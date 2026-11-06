/**
 * TalkRender Sandbox Hot-Reload State Preserver & Snapshot Manager
 */

(function () {
  const STORAGE_KEY = 'talkrender_sandbox_state_snapshot';
  let memorySnapshot = null;

  function captureSnapshot() {
    const rendererState = window.TalkRenderRenderer ? window.TalkRenderRenderer.getState() : {};
    const physicsBodies = window.TalkRenderPhysics ? window.TalkRenderPhysics.getBodies() : [];

    const snapshot = {
      id: `snap_${Date.now()}`,
      timestamp: Date.now(),
      background: rendererState.background || { mode: 'solid', color: '#0a0d14' },
      shapes: rendererState.shapes || [],
      physicsBodies: physicsBodies || [],
      appliedStyles: {},
    };

    memorySnapshot = snapshot;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage quota or sandboxed iframe restriction
    }

    return snapshot;
  }

  function restoreSnapshot(snapshot) {
    const target = snapshot || memorySnapshot || loadFromStorage();
    if (!target) return false;

    if (window.TalkRenderRenderer) {
      if (target.background) {
        window.TalkRenderRenderer.setBackground(target.background);
      }
      if (target.shapes && Array.isArray(target.shapes)) {
        window.TalkRenderRenderer.clear({ clearType: 'shapes_only', preserveBackground: true });
        target.shapes.forEach((s) => window.TalkRenderRenderer.addShape(s));
      }
    }

    if (window.TalkRenderPhysics && target.physicsBodies && Array.isArray(target.physicsBodies)) {
      window.TalkRenderPhysics.clear();
      target.physicsBodies.forEach((b) => window.TalkRenderPhysics.addBody(b));
    }

    return true;
  }

  function loadFromStorage() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  window.TalkRenderStatePreserver = {
    captureSnapshot,
    restoreSnapshot,
    getLatestSnapshot: () => memorySnapshot || loadFromStorage(),
  };
})();
