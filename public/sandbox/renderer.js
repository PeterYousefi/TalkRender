/**
 * TalkRender Sandbox 2D Canvas Renderer Engine
 */

(function () {
  const state = {
    canvas: null,
    ctx: null,
    dpr: 1,
    width: 0,
    height: 0,
    background: { mode: 'solid', color: '#0a0d14' },
    shapes: [],
    gridPulseOffset: 0,
  };

  function init(canvas) {
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!state.canvas) return;
    state.dpr = window.devicePixelRatio || 1;
    state.width = state.canvas.parentElement ? state.canvas.parentElement.clientWidth : window.innerWidth;
    state.height = state.canvas.parentElement ? state.canvas.parentElement.clientHeight : window.innerHeight;

    state.canvas.width = state.width * state.dpr;
    state.canvas.height = state.height * state.dpr;
    state.ctx.scale(state.dpr, state.dpr);
    render();
  }

  function setBackground(config) {
    state.background = { ...state.background, ...config };
    render();
  }

  function addShape(shape) {
    state.shapes.push(shape);
    render();
  }

  function removeShape(shapeId) {
    state.shapes = state.shapes.filter((s) => s.id !== shapeId);
    render();
  }

  function clear(options) {
    const opts = options || { clearType: 'all', preserveBackground: true };
    if (opts.clearType === 'all' || opts.clearType === 'shapes_only') {
      state.shapes = [];
    }
    if (!opts.preserveBackground) {
      state.background = { mode: 'solid', color: '#0a0d14' };
    }
    render();
  }

  function drawBackground() {
    const { ctx, width, height, background } = state;
    ctx.save();

    if (background.mode === 'gradient' && background.gradientColors && background.gradientColors.length >= 2) {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      background.gradientColors.forEach((color, idx) => {
        grad.addColorStop(idx / (background.gradientColors.length - 1), color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (background.mode === 'cyberpunk-mesh') {
      ctx.fillStyle = background.color || '#0a0d14';
      ctx.fillRect(0, 0, width, height);

      const gridSize = background.gridSize || 30;
      ctx.strokeStyle = background.gridColor || 'rgba(0, 243, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    } else {
      ctx.fillStyle = background.color || '#0a0d14';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  function drawShape(shape) {
    const { ctx } = state;
    ctx.save();
    ctx.globalAlpha = shape.opacity !== undefined ? shape.opacity : 1;

    if (shape.glow) {
      ctx.shadowColor = shape.glowColor || shape.color || '#00f3ff';
      ctx.shadowBlur = shape.glowBlur || 15;
    }

    ctx.translate(shape.x, shape.y);
    if (shape.rotation) {
      ctx.rotate((shape.rotation * Math.PI) / 180);
    }

    ctx.fillStyle = shape.color || '#00f3ff';
    ctx.strokeStyle = shape.strokeColor || shape.color || '#00f3ff';
    ctx.lineWidth = shape.strokeWidth || 2;

    switch (shape.shape) {
      case 'circle': {
        const r = shape.radius || 20;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        if (shape.fill !== false) ctx.fill();
        ctx.stroke();
        break;
      }
      case 'rectangle': {
        const w = shape.width || 60;
        const h = shape.height || 40;
        if (shape.fill !== false) ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        break;
      }
      case 'star': {
        const spikes = shape.points || 5;
        const outerRadius = shape.radius || 30;
        const innerRadius = outerRadius / 2;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < spikes; i++) {
          ctx.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
          rot += step;
          ctx.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
          rot += step;
        }
        ctx.lineTo(0, -outerRadius);
        ctx.closePath();
        if (shape.fill !== false) ctx.fill();
        ctx.stroke();
        break;
      }
      case 'text': {
        ctx.font = `${shape.fontSize || 24}px ${shape.fontFamily || 'monospace'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (shape.fill !== false) ctx.fillText(shape.text || '', 0, 0);
        if (shape.strokeColor) ctx.strokeText(shape.text || '', 0, 0);
        break;
      }
      default: {
        // Fallback dot
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function render() {
    if (!state.ctx) return;
    drawBackground();
    state.shapes.forEach((s) => drawShape(s));
  }

  window.TalkRenderRenderer = {
    init,
    resize,
    setBackground,
    addShape,
    removeShape,
    clear,
    render,
    getState: () => ({
      background: { ...state.background },
      shapes: [...state.shapes],
      viewport: { width: state.width, height: state.height },
    }),
  };
})();
