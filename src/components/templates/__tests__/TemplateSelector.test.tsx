import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TemplateSelector } from '../TemplateSelector';

describe('TemplateSelector Component', () => {
  it('should render all template cards and category tabs', () => {
    const onSelectTemplate = vi.fn();
    render(<TemplateSelector onSelectTemplate={onSelectTemplate} />);

    expect(screen.getByTestId('template-selector')).toBeDefined();
    expect(screen.getByTestId('category-tabs')).toBeDefined();
    expect(screen.getByTestId('template-card-physics_playground')).toBeDefined();
    expect(screen.getByTestId('template-card-cyberpunk_city')).toBeDefined();
  });

  it('should filter templates when a category tab is clicked', () => {
    const onSelectTemplate = vi.fn();
    render(<TemplateSelector onSelectTemplate={onSelectTemplate} />);

    // Click 'Space' category tab
    const spaceTab = screen.getByTestId('category-tab-space');
    fireEvent.click(spaceTab);

    expect(screen.getByTestId('template-card-solar_system')).toBeDefined();
    expect(screen.queryByTestId('template-card-physics_playground')).toBeNull();
  });

  it('should filter templates based on search input', () => {
    const onSelectTemplate = vi.fn();
    render(<TemplateSelector onSelectTemplate={onSelectTemplate} />);

    const searchInput = screen.getByTestId('template-search-input');
    fireEvent.change(searchInput, { target: { value: 'glider' } });

    expect(screen.getByTestId('template-card-cellular_automata')).toBeDefined();
    expect(screen.queryByTestId('template-card-cyberpunk_city')).toBeNull();
  });

  it('should trigger onSelectTemplate when Load Scene button is clicked', () => {
    const onSelectTemplate = vi.fn();
    render(<TemplateSelector onSelectTemplate={onSelectTemplate} />);

    const loadBtn = screen.getByTestId('load-template-btn-physics_playground');
    fireEvent.click(loadBtn);

    expect(onSelectTemplate).toHaveBeenCalledTimes(1);
    expect(onSelectTemplate.mock.calls[0][0].id).toBe('physics_playground');
  });

  it('should trigger onSelectTrigger when a voice quick-trigger chip is clicked', () => {
    const onSelectTemplate = vi.fn();
    const onSelectTrigger = vi.fn();

    render(
      <TemplateSelector
        onSelectTemplate={onSelectTemplate}
        onSelectTrigger={onSelectTrigger}
      />
    );

    const triggerBtn = screen.getByTestId('trigger-btn-trigger_spawn_heavy_crate');
    fireEvent.click(triggerBtn);

    expect(onSelectTrigger).toHaveBeenCalledTimes(1);
    expect(onSelectTrigger.mock.calls[0][0].id).toBe('trigger_spawn_heavy_crate');
  });
});
