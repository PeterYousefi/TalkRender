/**
 * TalkRender Sandbox 2D Physics Simulator & Animation Loop
 */

(function () {
  const state = {
    canvas: null,
    ctx: null,
    bodies: [],
    lastTime: 0,
    isRunning: false,
    gravity: 980, // pixels per second squared
  };

  function init(canvas) {
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');
    if (!state.isRunning) {
      state.isRunning = true;
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  function addBody(body) {
    const fullBody = {
      id: body.bodyId || `body_${Date.now()}`,
      x: body.x || 100,
      y: body.y || 100,
      radius: body.radius || 20,
      width: body.width || 40,
      height: body.height || 40,
      vx: body.velocityX || 0,
      vy: body.velocityY || 0,
      mass: body.mass || 1,
      restitution: body.restitution !== undefined ? body.restitution : 0.8,
      friction: body.friction !== undefined ? body.friction : 0.05,
      isStatic: !!body.isStatic,
      gravityScale: body.gravityScale !== undefined ? body.gravityScale : 1,
      color: body.color || '#00ff66',
      trail: body.trail !== false,
      trailHistory: [],
    };
    state.bodies.push(fullBody);
  }

  function removeBody(bodyId) {
    state.bodies = state.bodies.filter((b) => b.id !== bodyId);
  }

  function clear() {
    state.bodies = [];
  }

  function loop(currentTime) {
    if (!state.isRunning) return;
    const dt = Math.min((currentTime - state.lastTime) / 1000, 0.1);
    state.lastTime = currentTime;

    update(dt);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (!state.canvas || !state.ctx) return;
    const width = state.canvas.parentElement ? state.canvas.parentElement.clientWidth : window.innerWidth;
    const height = state.canvas.parentElement ? state.canvas.parentElement.clientHeight : window.innerHeight;

    // Render underlying scene first
    if (window.TalkRenderRenderer) {
      window.TalkRenderRenderer.render();
    }

    const ctx = state.ctx;

    for (let i = 0; i < state.bodies.length; i++) {
      const b = state.bodies[i];

      if (!b.isStatic) {
        // Gravity
        b.vy += state.gravity * b.gravityScale * dt;

        // Position integration
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Floor collision
        if (b.y + b.radius > height) {
          b.y = height - b.radius;
          b.vy = -b.vy * b.restitution;
          b.vx *= 1 - b.friction;
        }

        // Ceiling collision
        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy = -b.vy * b.restitution;
        }

        // Left / Right wall collisions
        if (b.x + b.radius > width) {
          b.x = width - b.radius;
          b.vx = -b.vx * b.restitution;
        } else if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = -b.vx * b.restitution;
        }

        // Trail record
        if (b.trail) {
          b.trailHistory.push({ x: b.x, y: b.y });
          if (b.trailHistory.length > 25) {
            b.trailHistory.shift();
          }
        }
      }

      // Draw trails
      if (b.trailHistory && b.trailHistory.length > 1) {
        ctx.save();
        ctx.strokeStyle = b.color;
        for (let t = 1; t < b.trailHistory.length; t++) {
          ctx.beginPath();
          ctx.globalAlpha = t / b.trailHistory.length * 0.4;
          ctx.lineWidth = 2;
          ctx.moveTo(b.trailHistory[t - 1].x, b.trailHistory[t - 1].y);
          ctx.lineTo(b.trailHistory[t].x, b.trailHistory[t].y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw body
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  window.TalkRenderPhysics = {
    init,
    addBody,
    removeBody,
    clear,
    getBodies: () => state.bodies.map((b) => ({ ...b })),
  };
})();
