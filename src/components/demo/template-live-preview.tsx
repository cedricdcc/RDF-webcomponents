'use client';

import React, { useState, useMemo } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { evaluateMustacheTemplate, generatePreviewDocument } from '@/lib/gemini/template-evaluator';

interface TemplateLivePreviewProps {
  templateHtml: string;
  jsonData: any;
  className?: string;
  onCopySuccess?: () => void;
  showToolbar?: boolean;
}

export const TemplateLivePreview: React.FC<TemplateLivePreviewProps> = ({
  templateHtml,
  jsonData,
  className = '',
  onCopySuccess,
  showToolbar = true,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Evaluate template with JSON data
  const evaluatedHtml = useMemo(() => {
    if (!templateHtml) return '';
    try {
      return evaluateMustacheTemplate(templateHtml, jsonData);
    } catch (err: any) {
      return `<div style="padding:1rem;color:#b91c1c;font-family:monospace;background:#fef2f2;border:1px solid #fecaca;border-radius:0.5rem;">
        <strong>Render Preview Error:</strong><br/>${err?.message || 'Failed to evaluate template.'}
      </div>`;
    }
  }, [templateHtml, jsonData, refreshKey]);

  // Generate full HTML document for iframe srcDoc
  const previewDoc = useMemo(() => {
    if (!evaluatedHtml) return '';
    return generatePreviewDocument(evaluatedHtml);
  }, [evaluatedHtml]);

  const itemsCount = useMemo(() => {
    if (Array.isArray(jsonData)) return jsonData.length;
    if (jsonData?.items && Array.isArray(jsonData.items)) return jsonData.items.length;
    return 1;
  }, [jsonData]);

  const handleCopy = async () => {
    if (!templateHtml) return;
    try {
      await navigator.clipboard.writeText(templateHtml);
      setCopied(true);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  if (!templateHtml || !templateHtml.trim()) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center ${className}`}>
        <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-3 shadow-2xs">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <p className="text-xs font-bold text-slate-700">Live Preview Waiting for Generation</p>
        <p className="text-[11px] text-slate-500 max-w-sm mt-1">
          Select an archetype from Tab 2 or chat with the AI assistant to synthesize a template and see the live rendered output in action.
        </p>
      </div>
    );
  }

  const viewportWidthClass =
    viewport === 'mobile'
      ? 'w-[375px]'
      : viewport === 'tablet'
      ? 'w-[640px]'
      : 'w-full';

  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-200 bg-slate-100/70 overflow-hidden shadow-inner ${
        isFullscreen ? 'fixed inset-4 z-50 bg-white shadow-2xl border-indigo-200' : className
      }`}
    >
      {/* Live Preview Header Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200 text-xs shrink-0">
          {/* Left: Status & Item Count */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Rendered Output</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 border text-slate-600">
              {itemsCount} {itemsCount === 1 ? 'record' : 'records'} rendered
            </span>
          </div>

          {/* Center: Device Viewport Controls */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewport === 'desktop' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewport === 'tablet' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tablet View (640px)"
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewport === 'mobile' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRefreshKey(k => k + 1)}
              className="h-7 px-2 text-[11px] gap-1 cursor-pointer text-slate-600 hover:text-slate-900"
              title="Re-render preview"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden md:inline">Refresh</span>
            </Button>

            <Button
              size="sm"
              variant={copied ? 'default' : 'outline'}
              onClick={handleCopy}
              className={`h-7 px-2.5 text-[11px] gap-1.5 cursor-pointer transition-all ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-emerald-600 shadow-2xs'
                  : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border-indigo-200'
              }`}
              title="Copy the raw Mustache template HTML to clipboard"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied HTML!' : 'Copy Template HTML'}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 cursor-pointer"
              title={isFullscreen ? 'Exit full view' : 'Expand preview'}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      )}

      {/* Frame Container */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 overflow-auto bg-slate-100/90">
        <div
          className={`${viewportWidthClass} h-full min-h-[280px] bg-white rounded-xl shadow-md border border-slate-200/80 overflow-hidden transition-all duration-200 flex flex-col`}
        >
          {/* Browser simulation bar */}
          <div className="h-6 px-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300"></span>
              <span className="h-2 w-2 rounded-full bg-slate-300"></span>
              <span className="h-2 w-2 rounded-full bg-slate-300"></span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              lens-display sandbox preview
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {viewport}
            </span>
          </div>

          {/* Sandboxed iframe */}
          <iframe
            key={`preview-frame-${refreshKey}`}
            srcDoc={previewDoc}
            title="Live Template Render Preview"
            sandbox="allow-same-origin allow-scripts"
            className="flex-1 w-full border-0 bg-transparent min-h-[260px]"
          />
        </div>
      </div>
    </div>
  );
};
