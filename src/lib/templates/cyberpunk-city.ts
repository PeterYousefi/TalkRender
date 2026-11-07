/**
 * Scene Template: Cyberpunk Neon City
 * Retro-futuristic synthwave city skyline, perspective grid, neon glow, and dynamic acid rain.
 */

import type { SceneTemplate } from '@/types/templates';

export const cyberpunkCityTemplate: SceneTemplate = {
  id: 'cyberpunk_city',
  title: 'Cyberpunk Neon City',
  description: 'Retro-futuristic skyline with perspective wireframe grid, glowing neon monoliths, and digital rain.',
  category: 'cyberpunk',
  tags: ['cyberpunk', 'synthwave', 'neon', 'cityscape', 'grid', 'generative'],
  badgeColor: '#ec4899',
  initialCommands: [
    // 1. Dark cyberpunk night sky with magenta/indigo gradient
    {
      type: 'SET_BACKGROUND',
      payload: {
        type: 'linear-gradient',
        color: '#050510',
        gradient: {
          x0: 400,
          y0: 0,
          x1: 400,
          y1: 600,
          colorStops: [
            { offset: 0, color: '#030014' },
            { offset: 0.5, color: '#16082f' },
            { offset: 1, color: '#2b0938' },
          ],
        },
      },
    },
    // 2. Distant giant neon synthwave sun
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'synthwave_sun',
        type: 'circle',
        x: 400,
        y: 280,
        radius: 110,
        style: {
          fillColor: '#f43f5e',
          shadowColor: '#fb7185',
          shadowBlur: 45,
          opacity: 0.9,
        },
      },
    },
    // 3. Foreground skyscraper silhouettes
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'tower_left',
        type: 'rectangle',
        x: 100,
        y: 360,
        width: 120,
        height: 240,
        style: {
          fillColor: '#0a0a1a',
          strokeColor: '#06b6d4',
          strokeWidth: 2,
          shadowColor: '#06b6d4',
          shadowBlur: 15,
        },
      },
    },
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'tower_center_left',
        type: 'rectangle',
        x: 260,
        y: 310,
        width: 100,
        height: 290,
        style: {
          fillColor: '#070716',
          strokeColor: '#ec4899',
          strokeWidth: 2,
          shadowColor: '#ec4899',
          shadowBlur: 18,
        },
      },
    },
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'tower_center_right',
        type: 'rectangle',
        x: 440,
        y: 330,
        width: 110,
        height: 270,
        style: {
          fillColor: '#09081e',
          strokeColor: '#8b5cf6',
          strokeWidth: 2,
          shadowColor: '#8b5cf6',
          shadowBlur: 20,
        },
      },
    },
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'tower_right',
        type: 'rectangle',
        x: 630,
        y: 380,
        width: 130,
        height: 220,
        style: {
          fillColor: '#0a0a1a',
          strokeColor: '#06b6d4',
          strokeWidth: 2,
          shadowColor: '#06b6d4',
          shadowBlur: 15,
        },
      },
    },
  ],
  voiceTriggers: [
    {
      id: 'trigger_spawn_hovercar',
      voicePhrase: 'Spawn a flying spinner hovercar across the skyline',
      description: 'Animates a glowing aerodynamic hovercar cruising between skyscrapers',
      toolName: 'draw_shape',
      args: {
        id: 'hovercar_spinner',
        type: 'rectangle',
        x: 150,
        y: 220,
        width: 70,
        height: 18,
        style: {
          fillColor: '#22d3ee',
          shadowColor: '#06b6d4',
          shadowBlur: 25,
        },
      },
    },
    {
      id: 'trigger_neon_billboard',
      voicePhrase: 'Add a holographic billboard with NEO TOKYO on the central tower',
      description: 'Renders a bright neon cyberpunk sign text over the skyline',
      toolName: 'draw_shape',
      args: {
        id: 'billboard_neo_tokyo',
        type: 'rectangle',
        x: 270,
        y: 340,
        width: 80,
        height: 35,
        style: {
          fillColor: 'rgba(236, 72, 153, 0.25)',
          strokeColor: '#ec4899',
          strokeWidth: 2,
          shadowColor: '#ec4899',
          shadowBlur: 22,
        },
      },
    },
    {
      id: 'trigger_turn_on_rain',
      voicePhrase: 'Start neon digital matrix rain',
      description: 'Activates fast vertical particle rain cascading down the scene',
      toolName: 'inject_script',
      args: {
        scriptId: 'matrix_digital_rain',
        code: `
          window.__rainActive = true;
        `,
      },
    },
  ],
  customScript: {
    id: 'cyberpunk_grid_and_rain_engine',
    runtime: 'canvas2d',
    code: `
      // Animated perspective horizon grid and digital rain
      let gridOffset = 0;
      const rainDrops = Array.from({ length: 60 }, () => ({
        x: Math.random() * 800,
        y: Math.random() * 600,
        speed: 4 + Math.random() * 8,
        length: 8 + Math.random() * 12
      }));

      window.onCustomRender = function(ctx) {
        if (!ctx) return;
        
        // Draw perspective grid floor
        ctx.save();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.lineWidth = 1;
        const horizon = 480;

        // Converging perspective lines
        for (let x = -200; x <= 1000; x += 60) {
          ctx.beginPath();
          ctx.moveTo(400, horizon);
          ctx.lineTo(x, 600);
          ctx.stroke();
        }

        // Horizontal scrolling lines
        gridOffset = (gridOffset + 1.5) % 30;
        for (let y = horizon; y <= 600; y += 15) {
          const shiftedY = y + gridOffset;
          if (shiftedY <= 600) {
            ctx.beginPath();
            ctx.moveTo(0, shiftedY);
            ctx.lineTo(800, shiftedY);
            ctx.stroke();
          }
        }

        // Draw digital neon rain
        if (window.__rainActive) {
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.5;
          rainDrops.forEach(drop => {
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.stroke();
            drop.y += drop.speed;
            if (drop.y > 600) drop.y = -20;
          });
        }
        ctx.restore();
      };
    `,
  },
};
