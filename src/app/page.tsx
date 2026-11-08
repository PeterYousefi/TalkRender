'use client';

import React, { useState, useCallback } from 'react';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { SplitScreenLayout } from '@/components/workspace/SplitScreenLayout';
import { AvatarContainer } from '@/components/avatar/AvatarContainer';
import { AvatarStatusBadge } from '@/components/avatar/AvatarStatusBadge';
import { AudioVisualizer } from '@/components/avatar/AudioVisualizer';
import { VisemeIndicator } from '@/components/avatar/VisemeIndicator';
import { CanvasSandbox } from '@/components/canvas/CanvasSandbox';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { ManualCommandTerminal } from '@/components/workspace/ManualCommandTerminal';
import { ToolExecutionInspector } from '@/components/workspace/ToolExecutionInspector';
import { CodeDiffInspector } from '@/components/workspace/CodeDiffInspector';
import { LatencyTelemetryHUD } from '@/components/telemetry/LatencyTelemetryHUD';
import { TemplateSelector } from '@/components/templates/TemplateSelector';

import { useCanvasSandbox } from '@/hooks/useCanvasSandbox';
import { useToolExecution } from '@/hooks/useToolExecution';
import { useLiveKitRoom } from '@/hooks/useLiveKitRoom';
import { useBosonRealtime } from '@/hooks/useBosonRealtime';
import { useBargeIn } from '@/hooks/useBargeIn';
import { useTelemetryCollector } from '@/hooks/useTelemetryCollector';
import { templateRegistry } from '@/lib/templates/registry';

import type { WorkspaceTheme, InspectorTab } from '@/types/workspace';
import type { SceneTemplate, PromptTrigger } from '@/types/templates';
import type { CanvasToolName } from '@/types/canvas-commands';
import { Wrench, Code2, Activity, Layers, X } from 'lucide-react';

export default function WorkspacePage() {
  const [theme, setTheme] = useState<WorkspaceTheme>('cyberpunk');
  const [activeInspectorTab, setActiveInspectorTab] = useState<InspectorTab>('tools');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [autoRollback, setAutoRollback] = useState(true);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('physics_playground');
  const [activeScript, setActiveScript] = useState<{
    id: string;
    code: string;
    runtime: 'canvas2d' | 'webgl' | 'dom';
  } | null>(null);

  // 1. Tool execution & history queue
  const { queue, history, telemetry: toolTelemetry } = useToolExecution();

  // 2. Sandboxed Canvas runtime
  const {
    bridge,
    fps: canvasFps,
    latencyMs: canvasLatencyMs,
    handleBridgeReady,
    executeCommand,
    injectCode,
    clearCanvas,
  } = useCanvasSandbox();

  // 3. WebRTC LiveKit connection
  const {
    state: liveKitRoomState,
    avatarTrack,
    toggleMicrophone,
  } = useLiveKitRoom();

  // 4. Boson AI Realtime full-duplex session
  const {
    status: bosonStatus,
    interrupt: interruptBoson,
    client: bosonClient,
  } = useBosonRealtime({
    onFunctionCall: async (call) => {
      queue.enqueue(call.name as CanvasToolName, call.arguments, call.callId);
      try {
        const parsedArgs = JSON.parse(call.arguments);
        executeCommand({
          type: call.name === 'clear_canvas' ? 'CLEAR_CANVAS' : 'DRAW_SHAPE',
          payload: parsedArgs,
        });
      } catch {
        // ignore parse error
      }
    },
  });

  // 5. Barge-in & Interruption Recovery Coordinator
  const {
    interruptionState,
    isInterrupted,
    interruptionCount,
    triggerManualInterrupt,
  } = useBargeIn({
    bosonClient,
    toolQueue: queue,
    sandboxBridge: bridge,
    rollbackOnInterruption: autoRollback,
  });

  // 6. Real-time telemetry collector
  const { telemetry: latencyTelemetry } = useTelemetryCollector({
    sandboxBridge: bridge,
    enabled: true,
  });

  // Handle template selection
  const handleSelectTemplate = useCallback(
    (template: SceneTemplate) => {
      setActiveTemplateId(template.id);
      setIsTemplateModalOpen(false);

      // Execute initialization commands sequence
      const commands = templateRegistry.generateInitializationCommands(template.id);
      commands.forEach((cmd) => {
        executeCommand(cmd);
      });

      if (template.customScript) {
        setActiveScript(template.customScript);
        injectCode(template.customScript.code, template.customScript.runtime);
      }
    },
    [executeCommand, injectCode]
  );

  // Handle voice trigger selection
  const handleSelectTrigger = useCallback(
    (trigger: PromptTrigger) => {
      queue.enqueue(trigger.toolName, trigger.args);
      if (bosonClient) {
        bosonClient.send({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: trigger.voicePhrase }],
          },
        });
      }
    },
    [queue, bosonClient]
  );

  // Manual terminal command execution
  const handleTerminalCommand = useCallback(
    async (cmdStr: string) => {
      if (cmdStr.toLowerCase() === 'rollback') {
        const rolledBack = queue.rollbackLast();
        if (rolledBack && bridge) {
          bridge.sendCommand(`rollback_${rolledBack.id}`, {
            type: 'ROLLBACK_ACTION',
            payload: { actionId: rolledBack.id },
          });
        }
        return {
          success: true,
          result: rolledBack
            ? `Rolled back tool call ${rolledBack.name} (${rolledBack.id}).`
            : 'No actions available to rollback.',
        };
      }

      // Check for voice template trigger match
      const matchedTrigger = templateRegistry.findMatchingVoiceTrigger(cmdStr);
      if (matchedTrigger) {
        queue.enqueue(matchedTrigger.toolName, matchedTrigger.args);
        return {
          success: true,
          result: `Matched Voice Trigger: "${matchedTrigger.voicePhrase}" -> Executing ${matchedTrigger.toolName}.`,
        };
      }

      // Send as directive to Boson AI
      if (bosonClient) {
        bosonClient.send({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: cmdStr }],
          },
        });
      }

      return {
        success: true,
        result: `Directive dispatched to Boson AI: "${cmdStr}".`,
      };
    },
    [queue, bridge, bosonClient]
  );

  return (
    <div
      data-testid="workspace-root"
      className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100"
    >
      {/* Top Application Header */}
      <WorkspaceHeader
        theme={theme}
        onThemeChange={setTheme}
        isMicMuted={!liveKitRoomState.isAudioEnabled}
        onToggleMic={toggleMicrophone}
        liveKitState={liveKitRoomState.status}
        bosonStatus={bosonStatus}
        autoRollback={autoRollback}
        onToggleAutoRollback={() => setAutoRollback(!autoRollback)}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onEmergencyStop={() => {
          interruptBoson();
          triggerManualInterrupt();
        }}
      />

      {/* Main Split-Screen Layout */}
      <SplitScreenLayout
        // Left Panel: Co-Pilot Talking Avatar
        leftPanel={
          <div className="flex flex-col gap-3">
            <AvatarContainer
              avatarName="BOSON HIGGS COPILOT"
              track={avatarTrack}
              isSpeaking={interruptionState.isInterrupted ? false : bosonStatus === 'speaking'}
              isMuted={!liveKitRoomState.isAudioEnabled}
              onToggleMute={toggleMicrophone}
            />

            <AvatarStatusBadge
              quality={liveKitRoomState.status === 'connected' ? 'excellent' : 'reconnecting'}
              latencyMs={latencyTelemetry.audioRttMs}
              fps={latencyTelemetry.fps}
              isSpeaking={bosonStatus === 'speaking'}
            />

            <AudioVisualizer isSpeaking={bosonStatus === 'speaking'} />

            <VisemeIndicator viseme="aa" isSpeaking={bosonStatus === 'speaking'} />
          </div>
        }
        // Center Panel: Live Sandboxed Canvas & Controls
        centerPanel={
          <div className="relative flex h-full w-full flex-col">
            <CanvasToolbar
              onClear={() => clearCanvas('all')}
              onRollback={() => {
                const rolledBack = queue.rollbackLast();
                if (rolledBack && bridge) {
                  bridge.sendCommand(`rollback_${rolledBack.id}`, {
                    type: 'ROLLBACK_ACTION',
                    payload: { actionId: rolledBack.id },
                  });
                }
              }}
              fps={canvasFps}
              latencyMs={canvasLatencyMs}
            />

            <div className="relative flex-1 overflow-hidden">
              <CanvasSandbox onBridgeReady={handleBridgeReady} />
            </div>
          </div>
        }
        // Center Drawer: Command Terminal
        terminalPanel={
          <ManualCommandTerminal
            onExecuteCommand={handleTerminalCommand}
            isMuted={!liveKitRoomState.isAudioEnabled}
          />
        }
        // Right Panel: Inspector Tabs & Telemetry
        rightPanel={
          <div className="flex h-full flex-col gap-3">
            {/* Inspector Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
              <button
                type="button"
                data-testid="tab-tools-btn"
                onClick={() => setActiveInspectorTab('tools')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeInspectorTab === 'tools'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Tools</span>
              </button>

              <button
                type="button"
                data-testid="tab-code-btn"
                onClick={() => setActiveInspectorTab('code')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeInspectorTab === 'code'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Code</span>
              </button>

              <button
                type="button"
                data-testid="tab-telemetry-btn"
                onClick={() => setActiveInspectorTab('telemetry')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeInspectorTab === 'telemetry'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Telemetry</span>
              </button>

              <button
                type="button"
                data-testid="tab-templates-btn"
                onClick={() => setActiveInspectorTab('templates')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeInspectorTab === 'templates'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Templates</span>
              </button>
            </div>

            {/* Active Tab Panel Body */}
            <div className="flex-1 overflow-y-auto">
              {activeInspectorTab === 'tools' && (
                <ToolExecutionInspector
                  items={history}
                  telemetry={toolTelemetry}
                  onRollbackItem={(id) => {
                    const rolled = queue.rollback(id);
                    if (rolled && bridge) {
                      bridge.sendCommand(`rollback_${id}`, {
                        type: 'ROLLBACK_ACTION',
                        payload: { actionId: id },
                      });
                    }
                  }}
                />
              )}

              {activeInspectorTab === 'code' && (
                <CodeDiffInspector
                  activeScript={
                    activeScript
                      ? {
                          scriptId: activeScript.id,
                          code: activeScript.code,
                          runtime: activeScript.runtime,
                        }
                      : null
                  }
                  onApplyScript={(id, code) => {
                    injectCode(code, 'canvas2d');
                  }}
                />
              )}

              {activeInspectorTab === 'telemetry' && (
                <LatencyTelemetryHUD
                  telemetry={latencyTelemetry}
                  interruptionCount={interruptionCount}
                  isInterrupted={isInterrupted}
                  defaultExpanded={true}
                />
              )}

              {activeInspectorTab === 'templates' && (
                <TemplateSelector
                  onSelectTemplate={handleSelectTemplate}
                  onSelectTrigger={handleSelectTrigger}
                  activeTemplateId={activeTemplateId}
                />
              )}
            </div>
          </div>
        }
      />

      {/* Template Selector Modal Overlay */}
      {isTemplateModalOpen && (
        <div
          data-testid="template-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
        >
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <button
              type="button"
              data-testid="close-template-modal-btn"
              onClick={() => setIsTemplateModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <TemplateSelector
              onSelectTemplate={handleSelectTemplate}
              onSelectTrigger={handleSelectTrigger}
              activeTemplateId={activeTemplateId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
