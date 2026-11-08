import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Production Build & Standalone Deployment Readiness', () => {
  it('should have required scripts and engines configured in package.json', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    expect(pkg.scripts.build).toBe('next build');
    expect(pkg.scripts.start).toBe('next start');
    expect(pkg.scripts.typecheck).toBe('tsc --noEmit');
    expect(pkg.scripts.lint).toBe('next lint');
    expect(pkg.scripts.test).toBe('vitest run');
  });

  it('should define standalone output and essential security headers in next.config.mjs', () => {
    const configPath = path.resolve(process.cwd(), 'next.config.mjs');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    expect(configContent).toContain("output: 'standalone'");
    expect(configContent).toContain('reactStrictMode: true');
    expect(configContent).toContain('X-Content-Type-Options');
    expect(configContent).toContain('X-Frame-Options');
    expect(configContent).toContain('Referrer-Policy');
  });

  it('should have sandboxed runtime assets in public directory ready for production', () => {
    const runtimeHtmlPath = path.resolve(process.cwd(), 'public/sandbox/canvas-runtime.html');
    expect(fs.existsSync(runtimeHtmlPath)).toBe(true);

    const runtimeContent = fs.readFileSync(runtimeHtmlPath, 'utf-8');
    expect(runtimeContent).toContain('Content-Security-Policy');
    expect(runtimeContent).toContain('talkrender-viewport');
  });
});
