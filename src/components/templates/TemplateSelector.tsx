'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Search, Play, Mic, Layers } from 'lucide-react';
import { templateRegistry } from '@/lib/templates/registry';
import type { SceneTemplate, TemplateCategory, PromptTrigger } from '@/types/templates';

export interface TemplateSelectorProps {
  onSelectTemplate: (template: SceneTemplate) => void;
  onSelectTrigger?: (trigger: PromptTrigger) => void;
  className?: string;
  activeTemplateId?: string;
}

const CATEGORIES: { id: TemplateCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Scenes' },
  { id: 'physics', label: 'Physics' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'space', label: 'Space' },
  { id: 'simulation', label: 'Simulation' },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  onSelectTrigger,
  className = '',
  activeTemplateId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    return templateRegistry.filterTemplates({
      category: selectedCategory,
      searchQuery,
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div
      data-testid="template-selector"
      className={`flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 font-mono text-slate-200 backdrop-blur-xl shadow-2xl ${className}`}
    >
      {/* Header & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Interactive Scene Templates
          </h2>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            data-testid="template-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scenes or voice prompts..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1" data-testid="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            data-testid={`category-tab-${cat.id}`}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Cards Grid */}
      <div
        data-testid="templates-grid"
        className="grid grid-cols-1 gap-3 md:grid-cols-2"
      >
        {filteredTemplates.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-xs text-slate-500">
            No templates matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const isActive = activeTemplateId === template.id;

            return (
              <div
                key={template.id}
                data-testid={`template-card-${template.id}`}
                className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                  isActive
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_16px_rgba(6,182,212,0.2)]'
                    : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: template.badgeColor || '#06b6d4' }}
                      />
                      {template.title}
                    </h3>

                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${template.badgeColor || '#06b6d4'}22`,
                        color: template.badgeColor || '#06b6d4',
                      }}
                    >
                      {template.category}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                    {template.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-800/60 px-1.5 py-0.5 text-[9px] text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Voice Quick-Start Trigger Chips */}
                  <div className="mt-3">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      <Mic className="h-3 w-3 text-cyan-400" /> Voice Quick-Triggers:
                    </span>
                    <div className="mt-1.5 flex flex-col gap-1">
                      {template.voiceTriggers.slice(0, 2).map((trigger) => (
                        <button
                          key={trigger.id}
                          type="button"
                          data-testid={`trigger-btn-${trigger.id}`}
                          onClick={() => onSelectTrigger?.(trigger)}
                          className="flex items-center gap-1.5 rounded bg-slate-800/40 px-2 py-1 text-left text-[10px] text-slate-300 hover:bg-cyan-950/60 hover:text-cyan-300 transition-colors border border-transparent hover:border-cyan-800/50"
                          title={trigger.description}
                        >
                          <Sparkles className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                          <span className="truncate italic">&ldquo;{trigger.voicePhrase}&rdquo;</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Load Template Action Button */}
                <div className="mt-4 pt-2.5 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {template.initialCommands.length} setup ops
                  </span>

                  <button
                    type="button"
                    data-testid={`load-template-btn-${template.id}`}
                    onClick={() => onSelectTemplate(template)}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-500 shadow-md transition-all active:scale-95"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Load Scene</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
