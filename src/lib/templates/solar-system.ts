/**
 * Scene Template: Interactive Solar System
 * Celestial mechanics, elliptical orbital trajectories, central star coronal glow, and planetary bodies.
 */

import type { SceneTemplate } from '@/types/templates';

export const solarSystemTemplate: SceneTemplate = {
  id: 'solar_system',
  title: 'Interactive Solar System',
  description: 'Celestial orbital mechanics simulation with Keplerian trajectories, planetary rings, and coronal flares.',
  category: 'space',
  tags: ['space', 'astronomy', 'orbits', 'physics', 'celestial', 'simulation'],
  badgeColor: '#f59e0b',
  initialCommands: [
    // 1. Deep cosmos void
    {
      type: 'SET_BACKGROUND',
      payload: {
        type: 'solid',
        color: '#02040a',
      },
    },
    // 2. Central Sun with fiery coronal glow
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'central_sun',
        type: 'circle',
        x: 400,
        y: 300,
        radius: 42,
        style: {
          fillColor: '#facc15',
          shadowColor: '#ea580c',
          shadowBlur: 50,
        },
      },
    },
    // 3. Orbital track guides
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'orbit_mercury',
        type: 'circle',
        x: 400,
        y: 300,
        radius: 80,
        style: {
          fillColor: 'transparent',
          strokeColor: 'rgba(255, 255, 255, 0.12)',
          strokeWidth: 1,
        },
      },
    },
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'orbit_earth',
        type: 'circle',
        x: 400,
        y: 300,
        radius: 140,
        style: {
          fillColor: 'transparent',
          strokeColor: 'rgba(255, 255, 255, 0.12)',
          strokeWidth: 1,
        },
      },
    },
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'orbit_mars',
        type: 'circle',
        x: 400,
        y: 300,
        radius: 200,
        style: {
          fillColor: 'transparent',
          strokeColor: 'rgba(255, 255, 255, 0.12)',
          strokeWidth: 1,
        },
      },
    },
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'orbit_jupiter',
        type: 'circle',
        x: 400,
        y: 300,
        radius: 270,
        style: {
          fillColor: 'transparent',
          strokeColor: 'rgba(255, 255, 255, 0.12)',
          strokeWidth: 1,
        },
      },
    },
    // 4. Earth planet body
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'planet_earth',
        type: 'circle',
        x: 540,
        y: 300,
        radius: 14,
        style: {
          fillColor: '#38bdf8',
          shadowColor: '#0284c7',
          shadowBlur: 10,
        },
      },
    },
    // 5. Mars planet body
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'planet_mars',
        type: 'circle',
        x: 400,
        y: 500,
        radius: 10,
        style: {
          fillColor: '#ef4444',
          shadowColor: '#b91c1c',
          shadowBlur: 8,
        },
      },
    },
  ],
  voiceTriggers: [
    {
      id: 'trigger_spawn_comet',
      voicePhrase: 'Send a blazing icy comet zooming through the solar system',
      description: 'Animates a fast high-eccentricity comet with vapor tail',
      toolName: 'draw_shape',
      args: {
        id: 'halley_comet',
        type: 'circle',
        x: 100,
        y: 80,
        radius: 6,
        style: {
          fillColor: '#e0f2fe',
          shadowColor: '#38bdf8',
          shadowBlur: 20,
        },
      },
    },
    {
      id: 'trigger_solar_flare',
      voicePhrase: 'Trigger a massive coronal mass ejection from the sun',
      description: 'Expands the sun radius and pulses high-energy plasma corona',
      toolName: 'update_style',
      args: {
        elementId: 'central_sun',
        style: {
          shadowBlur: 90,
          shadowColor: '#dc2626',
        },
      },
    },
    {
      id: 'trigger_add_asteroid_belt',
      voicePhrase: 'Add the dense asteroid belt between Mars and Jupiter',
      description: 'Injects particle field representing hundreds of orbiting asteroids',
      toolName: 'inject_script',
      args: {
        scriptId: 'asteroid_belt_generator',
        code: `
          window.__asteroidBeltActive = true;
        `,
      },
    },
  ],
  customScript: {
    id: 'orbital_mechanics_animator',
    runtime: 'canvas2d',
    code: `
      // Keplerian planetary orbit rotation loop
      let angle = 0;
      window.onCustomRender = function(ctx) {
        if (!ctx) return;
        angle += 0.015;

        // Render animated orbiting planets
        const earthX = 400 + Math.cos(angle) * 140;
        const earthY = 300 + Math.sin(angle) * 140;

        const marsX = 400 + Math.cos(angle * 0.53 + 1.2) * 200;
        const marsY = 300 + Math.sin(angle * 0.53 + 1.2) * 200;

        ctx.save();
        // Earth glow
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(earthX, earthY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Moon orbiting Earth
        const moonX = earthX + Math.cos(angle * 8) * 24;
        const moonY = earthY + Math.sin(angle * 8) * 24;
        ctx.fillStyle = '#cbd5e1';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Mars
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#b91c1c';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(marsX, marsY, 9, 0, Math.PI * 2);
        ctx.fill();

        // Asteroids field
        if (window.__asteroidBeltActive) {
          ctx.fillStyle = 'rgba(203, 213, 225, 0.6)';
          ctx.shadowBlur = 0;
          for (let i = 0; i < 40; i++) {
            const astAngle = (i / 40) * Math.PI * 2 + angle * 0.2;
            const r = 230 + ((i * 17) % 25);
            ctx.fillRect(400 + Math.cos(astAngle) * r, 300 + Math.sin(astAngle) * r, 2, 2);
          }
        }

        ctx.restore();
      };
    `,
  },
};
