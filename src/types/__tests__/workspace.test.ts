import { describe, it, expect } from 'vitest';
import type {
  WorkspaceTheme,
  WorkspaceState,
  TerminalCommandItem,
  InspectorTab,
} from '../workspace';

describe('Workspace Type Definitions', () => {
  it('should support valid WorkspaceTheme options', () => {
    const themes: WorkspaceTheme[] = ['cyberpunk', 'dark', 'slate'];
    expect(themes).toContain('cyberpunk');
    expect(themes).toContain('dark');
    expect(themes).toContain('slate');
  });

  it('should construct a valid TerminalCommandItem', () => {
    const item: TerminalCommandItem = {
      id: 'cmd_1',
      type: 'input',
      content: 'draw_shape { "type": "circle", "radius": 30 }',
      timestamp: Date.now(),
      metadata: { callId: 'call_99' },
    };

    expect(item.id).toBe('cmd_1');
    expect(item.type).toBe('input');
    expect(item.metadata?.callId).toBe('call_99');
  });

  it('should construct a complete WorkspaceState object', () => {
    const activeTab: InspectorTab = 'tools';
    const state: WorkspaceState = {
      theme: 'cyberpunk',
      panels: {
        avatarPanel: true,
        canvasPanel: true,
        inspectorPanel: true,
        terminalPanel: false,
      },
      activeInspectorTab: activeTab,
      isMicMuted: false,
      isAutoRollbackEnabled: true,
    };

    expect(state.theme).toBe('cyberpunk');
    expect(state.panels.canvasPanel).toBe(true);
    expect(state.panels.terminalPanel).toBe(false);
    expect(state.activeInspectorTab).toBe('tools');
  });
});
