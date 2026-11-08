import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CodeDiffInspector } from '../CodeDiffInspector';

describe('CodeDiffInspector Component', () => {
  it('should render default message when activeScript is not provided', () => {
    render(<CodeDiffInspector />);
    expect(screen.getByTestId('code-diff-inspector')).toBeDefined();
    expect(screen.getByTestId('code-editor-textarea')).toBeDefined();
    const textarea = screen.getByTestId('code-editor-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('No dynamic scripts currently injected');
  });

  it('should render scriptId and runtime badge when activeScript is present', () => {
    const script = {
      scriptId: 'kinetic_particles_engine',
      code: 'function renderParticles() { return 42; }',
      runtime: 'canvas2d' as const,
    };

    render(<CodeDiffInspector activeScript={script} />);

    expect(screen.getByTestId('script-id-badge')).toBeDefined();
    expect(screen.getByTestId('script-id-badge').textContent).toContain('kinetic_particles_engine');
    expect(screen.getByTestId('script-runtime-badge')).toBeDefined();
    expect(screen.getByTestId('script-runtime-badge').textContent).toContain('CANVAS2D');

    const textarea = screen.getByTestId('code-editor-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('renderParticles');
  });

  it('should allow editing code and trigger onApplyScript on hot-reload', () => {
    const onApply = vi.fn();
    const script = {
      scriptId: 'test_script',
      code: 'const x = 1;',
      runtime: 'canvas2d' as const,
    };

    render(<CodeDiffInspector activeScript={script} onApplyScript={onApply} />);

    const textarea = screen.getByTestId('code-editor-textarea');
    fireEvent.change(textarea, { target: { value: 'const x = 200;' } });

    const runBtn = screen.getByTestId('apply-code-btn');
    fireEvent.click(runBtn);

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith('test_script', 'const x = 200;');
  });
});
