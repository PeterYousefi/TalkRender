/**
 * Workspace Layout, Theme, and Manual Command Terminal Type Definitions
 */

export type WorkspaceTheme = 'cyberpunk' | 'dark' | 'slate';

export interface WorkspacePanelVisibility {
  avatarPanel: boolean;
  canvasPanel: boolean;
  inspectorPanel: boolean;
  terminalPanel: boolean;
}

export type TerminalMessageType = 'input' | 'output' | 'error' | 'system';

export interface TerminalCommandItem {
  id: string;
  type: TerminalMessageType;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export type InspectorTab = 'tools' | 'code' | 'telemetry' | 'templates';

export interface WorkspaceState {
  theme: WorkspaceTheme;
  panels: WorkspacePanelVisibility;
  activeInspectorTab: InspectorTab;
  isMicMuted: boolean;
  isAutoRollbackEnabled: boolean;
}
