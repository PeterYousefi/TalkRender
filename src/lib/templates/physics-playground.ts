/**
 * Scene Template: 2D Physics Playground
 * Dynamic kinetic bodies, bounce restitution, gravity simulation, and collision boundaries.
 */

import type { SceneTemplate } from '@/types/templates';

export const physicsPlaygroundTemplate: SceneTemplate = {
  id: 'physics_playground',
  title: '2D Physics Playground',
  description: 'Interactive kinetic bodies with customizable gravity, bouncy restitution, and collision walls.',
  category: 'physics',
  tags: ['physics', 'particles', 'kinetic', 'gravity', 'simulation'],
  badgeColor: '#10b981',
  initialCommands: [
    // 1. Dark technical canvas background
    {
      type: 'SET_BACKGROUND',
      payload: {
        type: 'linear-gradient',
        color: '#090d16',
        gradient: {
          x0: 0,
          y0: 0,
          x1: 800,
          y1: 600,
          colorStops: [
            { offset: 0, color: '#090d16' },
            { offset: 1, color: '#131b2e' },
          ],
        },
      },
    },
    // 2. Static bottom boundary floor
    {
      type: 'CREATE_PHYSICS_BODY',
      payload: {
        id: 'floor_boundary',
        shape: 'rectangle',
        x: 400,
        y: 580,
        width: 780,
        height: 20,
        isStatic: true,
        restitution: 0.8,
        color: '#334155',
      },
    },
    // 3. Static left and right walls
    {
      type: 'CREATE_PHYSICS_BODY',
      payload: {
        id: 'left_wall',
        shape: 'rectangle',
        x: 10,
        y: 300,
        width: 20,
        height: 560,
        isStatic: true,
        restitution: 0.8,
        color: '#1e293b',
      },
    },
    {
      type: 'CREATE_PHYSICS_BODY',
      payload: {
        id: 'right_wall',
        shape: 'rectangle',
        x: 790,
        y: 300,
        width: 20,
        height: 560,
        isStatic: true,
        restitution: 0.8,
        color: '#1e293b',
      },
    },
    // 4. Initial kinetic bouncing balls
    {
      type: 'CREATE_PHYSICS_BODY',
      payload: {
        id: 'orb_cyan',
        shape: 'circle',
        x: 200,
        y: 100,
        radius: 24,
        mass: 1.2,
        restitution: 0.88,
        color: '#06b6d4',
        vx: 3,
        vy: 2,
      },
    },
    {
      type: 'CREATE_PHYSICS_BODY',
      payload: {
        id: 'orb_emerald',
        shape: 'circle',
        x: 350,
        y: 80,
        radius: 30,
        mass: 2.0,
        restitution: 0.75,
        color: '#10b981',
        vx: -2.5,
        vy: 1,
      },
    },
    {
      type: 'CREATE_PHYSICS_BODY',
      payload: {
        id: 'orb_magenta',
        shape: 'circle',
        x: 550,
        y: 120,
        radius: 20,
        mass: 0.8,
        restitution: 0.95,
        color: '#d946ef',
        vx: -4,
        vy: 3,
      },
    },
  ],
  voiceTriggers: [
    {
      id: 'trigger_spawn_heavy_crate',
      voicePhrase: 'Drop a heavy steel crate in the middle',
      description: 'Spawns a high-mass wooden/steel crate that crashes down',
      toolName: 'create_physics_body',
      args: {
        id: 'heavy_crate',
        shape: 'rectangle',
        x: 400,
        y: 50,
        width: 60,
        height: 60,
        mass: 10,
        restitution: 0.2,
        color: '#f59e0b',
      },
    },
    {
      id: 'trigger_burst_orbs',
      voicePhrase: 'Drop five bouncy neon particles',
      description: 'Spawns a swarm of hyper-elastic bouncing orbs',
      toolName: 'create_physics_body',
      args: {
        shape: 'circle',
        radius: 16,
        mass: 0.5,
        restitution: 0.96,
        color: '#38bdf8',
        vx: 5,
        vy: -2,
      },
    },
    {
      id: 'trigger_clear_particles',
      voicePhrase: 'Clear the physics playground',
      description: 'Resets the canvas and removes all dynamic physics bodies',
      toolName: 'clear_canvas',
      args: {
        resetState: true,
      },
    },
  ],
  customScript: {
    id: 'kinetic_trail_renderer',
    runtime: 'canvas2d',
    code: `
      // Kinetic particle motion trails
      if (!window.__trails) window.__trails = [];
      window.onPhysicsTick = function(bodies) {
        if (!bodies) return;
        bodies.forEach(b => {
          if (!b.isStatic && (Math.abs(b.vx) > 0.5 || Math.abs(b.vy) > 0.5)) {
            window.__trails.push({ x: b.x, y: b.y, color: b.color, alpha: 0.7 });
          }
        });
        if (window.__trails.length > 80) window.__trails.splice(0, 20);
      };
    `,
  },
};
