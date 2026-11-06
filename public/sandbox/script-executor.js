/**
 * TalkRender Sandbox Host-Guest Message Handler & Dynamic Script Executor
 */

(function () {
  let canvas = null;
  let ctx = null;
  let frameCount = 0;
  let lastFpsCalc = performance.now();

  function init(targetCanvas) {
    canvas = targetCanvas;
    ctx = canvas.getContext('2d');

    if (window.TalkRenderRenderer) window.TalkRenderRenderer.init(canvas);
    if (window.TalkRenderPhysics) window.TalkRenderPhysics.init(canvas);

    window.addEventListener('message', handleHostMessage);

    // Periodic FPS telemetry
    setInterval(reportFps, 1000);
  }

  function reportFps() {
    const now = performance.now();
    const elapsed = now - lastFpsCalc;
    const fps = Math.round((frameCount * 1000) / elapsed);
    frameCount = 0;
    lastFpsCalc = now;

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'FPS_UPDATE',
        fps: Math.min(fps || 60, 120),
        frameTimeMs: elapsed > 0 ? Math.round(1000 / (fps || 60)) : 16,
      }, '*');
    }
  }

  function handleHostMessage(event) {
    const data = event.data;
    if (!data || typeof data !== 'object' || !data.type) return;

    frameCount++;
    const startTime = performance.now();

    try {
      switch (data.type) {
        case 'HOST_INIT':
          if (window.parent) {
            window.parent.postMessage({
              type: 'GUEST_READY',
              version: '1.0.0',
              viewport: { width: window.innerWidth, height: window.innerHeight },
            }, '*');
          }
          break;

        case 'CANVAS_COMMAND': {
          const { callId, action } = data;
          executeAction(action);
          const duration = Math.round(performance.now() - startTime);

          if (window.parent) {
            window.parent.postMessage({
              type: 'COMMAND_ACK',
              callId,
              renderDurationMs: duration,
              elementsCount: window.TalkRenderRenderer ? window.TalkRenderRenderer.getState().shapes.length : 1,
            }, '*');
          }
          break;
        }

        case 'APPLY_SCRIPT_DIFF': {
          const { scriptId, code } = data;
          executeDynamicScript(code);
          if (window.parent) {
            window.parent.postMessage({
              type: 'COMMAND_ACK',
              callId: scriptId,
              renderDurationMs: Math.round(performance.now() - startTime),
              elementsCount: 1,
            }, '*');
          }
          break;
        }

        case 'REQUEST_SNAPSHOT': {
          if (window.TalkRenderStatePreserver) {
            const snapshot = window.TalkRenderStatePreserver.captureSnapshot();
            if (window.parent) {
              window.parent.postMessage({
                type: 'SNAPSHOT_DATA',
                snapshot,
              }, '*');
            }
          }
          break;
        }

        case 'RESTORE_SNAPSHOT': {
          if (window.TalkRenderStatePreserver) {
            window.TalkRenderStatePreserver.restoreSnapshot(data.snapshot);
            if (window.parent) {
              window.parent.postMessage({
                type: 'COMMAND_ACK',
                callId: 'restore',
                renderDurationMs: Math.round(performance.now() - startTime),
                elementsCount: 1,
              }, '*');
            }
          }
          break;
        }

        case 'PING':
          if (window.parent) {
            window.parent.postMessage({
              type: 'PONG',
              sentTimestamp: data.timestamp,
              receivedTimestamp: Date.now(),
            }, '*');
          }
          break;
      }
    } catch (err) {
      if (window.parent) {
        window.parent.postMessage({
          type: 'COMMAND_ERROR',
          callId: data.callId,
          error: err instanceof Error ? err.message : String(err),
        }, '*');
      }
    }
  }

  function executeAction(action) {
    if (!action || !action.type) return;

    switch (action.type) {
      case 'DRAW_SHAPE':
        if (window.TalkRenderRenderer) {
          window.TalkRenderRenderer.addShape(action.payload);
        }
        break;

      case 'SET_BACKGROUND':
        if (window.TalkRenderRenderer) {
          window.TalkRenderRenderer.setBackground(action.payload);
        }
        break;

      case 'CREATE_PHYSICS_BODY':
        if (window.TalkRenderPhysics) {
          window.TalkRenderPhysics.addBody(action.payload);
        }
        break;

      case 'CLEAR_CANVAS':
        if (window.TalkRenderRenderer) {
          window.TalkRenderRenderer.clear(action.payload);
        }
        if (window.TalkRenderPhysics && (!action.payload || action.payload.clearType !== 'shapes_only')) {
          window.TalkRenderPhysics.clear();
        }
        break;

      case 'UPDATE_STYLE':
        if (action.payload && action.payload.styles) {
          const target = canvas || document.body;
          Object.assign(target.style, action.payload.styles);
        }
        break;

      case 'INJECT_SCRIPT':
        if (action.payload && action.payload.code) {
          executeDynamicScript(action.payload.code);
        }
        break;
    }
  }

  function executeDynamicScript(code) {
    try {
      const runner = new Function('ctx', 'canvas', 'renderer', 'physics', code);
      runner(
        ctx,
        canvas,
        window.TalkRenderRenderer,
        window.TalkRenderPhysics
      );
    } catch (err) {
      console.error('Sandboxed script execution error:', err);
      throw err;
    }
  }

  window.TalkRenderRuntime = {
    init,
    executeAction,
    executeDynamicScript,
  };
})();
