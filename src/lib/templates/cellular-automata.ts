/**
 * Scene Template: Procedural Cellular Automata
 * Conway's Game of Life, generative grid simulation, Glider guns, and rule morphogenesis.
 */

import type { SceneTemplate } from '@/types/templates';

export const cellularAutomataTemplate: SceneTemplate = {
  id: 'cellular_automata',
  title: 'Procedural Cellular Automata',
  description: 'Conway’s Game of Life generative simulation with configurable survival rules and pattern injectors.',
  category: 'simulation',
  tags: ['cellular-automata', 'game-of-life', 'generative', 'simulation', 'math', 'grid'],
  badgeColor: '#8b5cf6',
  initialCommands: [
    // 1. Cyber-matrix background
    {
      type: 'SET_BACKGROUND',
      payload: {
        type: 'solid',
        color: '#030712',
      },
    },
    // 2. HUD framing border
    {
      type: 'DRAW_SHAPE',
      payload: {
        id: 'automata_frame',
        type: 'rectangle',
        x: 400,
        y: 300,
        width: 760,
        height: 560,
        style: {
          fillColor: 'transparent',
          strokeColor: '#3b82f6',
          strokeWidth: 2,
          shadowColor: '#2563eb',
          shadowBlur: 10,
        },
      },
    },
  ],
  voiceTriggers: [
    {
      id: 'trigger_spawn_glider_gun',
      voicePhrase: 'Spawn a Gosper Glider Gun in the top left',
      description: 'Injects a self-replicating glider gun pattern generating endless gliders',
      toolName: 'inject_script',
      args: {
        scriptId: 'inject_glider_gun',
        code: `
          if (window.__injectPattern) {
            window.__injectPattern('glider_gun', 5, 5);
          }
        `,
      },
    },
    {
      id: 'trigger_randomize_grid',
      voicePhrase: 'Randomize 30% of the cellular grid',
      description: 'Scatters random live organic cells across the simulation matrix',
      toolName: 'inject_script',
      args: {
        scriptId: 'randomize_matrix',
        code: `
          if (window.__randomizeCells) {
            window.__randomizeCells(0.3);
          }
        `,
      },
    },
    {
      id: 'trigger_clear_automata',
      voicePhrase: 'Clear the cellular automata grid',
      description: 'Wipes all living cells from the simulation matrix',
      toolName: 'inject_script',
      args: {
        scriptId: 'clear_matrix',
        code: `
          if (window.__clearCells) {
            window.__clearCells();
          }
        `,
      },
    },
  ],
  customScript: {
    id: 'cellular_automata_engine',
    runtime: 'canvas2d',
    code: `
      const COLS = 80;
      const ROWS = 60;
      const CELL_SIZE = 10;
      let grid = Array.from({ length: COLS }, () => new Uint8Array(ROWS));
      let nextGrid = Array.from({ length: COLS }, () => new Uint8Array(ROWS));

      // Initial pulsar pattern in center
      const cx = Math.floor(COLS / 2);
      const cy = Math.floor(ROWS / 2);
      // Glider
      grid[10][10] = 1;
      grid[11][11] = 1;
      grid[11][12] = 1;
      grid[10][12] = 1;
      grid[9][12] = 1;

      window.__randomizeCells = function(density = 0.25) {
        for (let x = 0; x < COLS; x++) {
          for (let y = 0; y < ROWS; y++) {
            grid[x][y] = Math.random() < density ? 1 : 0;
          }
        }
      };

      window.__clearCells = function() {
        for (let x = 0; x < COLS; x++) {
          grid[x].fill(0);
        }
      };

      window.__injectPattern = function(name, startX, startY) {
        if (name === 'glider_gun') {
          const coords = [
            [25,1],[23,2],[25,2],[13,3],[14,3],[21,3],[22,3],[35,3],[36,3],
            [12,4],[16,4],[21,4],[22,4],[35,4],[36,4],[1,5],[2,5],[11,5],
            [17,5],[21,5],[22,5],[1,6],[2,6],[11,6],[15,6],[17,6],[18,6],
            [23,6],[25,6],[11,7],[17,7],[25,7],[12,8],[16,8],[13,9],[14,9]
          ];
          coords.forEach(([dx, dy]) => {
            const x = (startX + dx) % COLS;
            const y = (startY + dy) % ROWS;
            grid[x][y] = 1;
          });
        }
      };

      let stepCounter = 0;
      window.onCustomRender = function(ctx) {
        if (!ctx) return;
        stepCounter++;

        // Step simulation every 3 frames (~20Hz)
        if (stepCounter % 3 === 0) {
          for (let x = 0; x < COLS; x++) {
            for (let y = 0; y < ROWS; y++) {
              let neighbors = 0;
              for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                  if (i === 0 && j === 0) continue;
                  const nx = (x + i + COLS) % COLS;
                  const ny = (y + j + ROWS) % ROWS;
                  neighbors += grid[nx][ny];
                }
              }
              const current = grid[x][y];
              // Standard Conway B3/S23
              if (current === 1 && (neighbors === 2 || neighbors === 3)) {
                nextGrid[x][y] = 1;
              } else if (current === 0 && neighbors === 3) {
                nextGrid[x][y] = 1;
              } else {
                nextGrid[x][y] = 0;
              }
            }
          }
          const temp = grid;
          grid = nextGrid;
          nextGrid = temp;
        }

        // Render alive cells
        ctx.save();
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#059669';
        ctx.shadowBlur = 4;

        for (let x = 0; x < COLS; x++) {
          for (let y = 0; y < ROWS; y++) {
            if (grid[x][y] === 1) {
              ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
            }
          }
        }
        ctx.restore();
      };
    `,
  },
};
