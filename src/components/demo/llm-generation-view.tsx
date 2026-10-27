'use client';

import React from 'react';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Terminal,
  Cpu,
} from 'lucide-react';
import { GeminiStatusUpdate } from '@/lib/gemini/gemini-client';

interface LlmGenerationViewProps {
  status: GeminiStatusUpdate | null;
  activeStepIndex: number; // 0..3
  streamingText?: string;
  isGenerating: boolean;
  fallbacksTriggered: string[];
  error?: string | null;
}

const GENERATION_STEPS = [
  { id: 'inspect', label: '1. Inspect Lens JSON Schema', desc: 'Analyzing property paths & types' },
  { id: 'connect', label: '2. Select Gemini Model', desc: 'Auto-discovery & fallback cascade' },
  { id: 'synthesize', label: '3. Synthesize Mustache Blocks', desc: 'Drafting markup & responsive CSS' },
  { id: 'validate', label: '4. Automated Verification', desc: 'Checking field mappings & tag balance' },
];

export const LlmGenerationView: React.FC<LlmGenerationViewProps> = ({
  status,
  activeStepIndex,
  streamingText,
  isGenerating,
  fallbacksTriggered,
  error,
}) => {
  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 via-white to-white p-4 shadow-sm space-y-4">
      {/* Header bar: Model status and badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Gemini AI Engine</span>
              {isGenerating && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-100 text-indigo-700 animate-pulse">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  Generating...
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-500">Autonomous design & validation pipeline</p>
          </div>
        </div>

        {/* Model & Fallback Pill */}
        <div className="flex items-center gap-1.5">
          {status?.model && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-mono shadow-2xs">
              <Cpu className="h-3 w-3 text-indigo-600" />
              <span>{status.model}</span>
            </div>
          )}

          {fallbacksTriggered.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-medium animate-pulse">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              <span>Fallback active: {fallbacksTriggered[fallbacksTriggered.length - 1]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stepper Progression */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {GENERATION_STEPS.map((step, idx) => {
          const isDone = activeStepIndex > idx;
          const isCurrent = activeStepIndex === idx;
          const isPending = activeStepIndex < idx;

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isCurrent
                  ? 'border-indigo-400 bg-white ring-2 ring-indigo-100 shadow-xs'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-slate-100 bg-slate-50/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="h-3.5 w-3.5 text-indigo-600 animate-spin" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-slate-300" />
                )}
                <span
                  className={`text-[11px] font-bold truncate ${
                    isCurrent
                      ? 'text-indigo-900'
                      : isDone
                      ? 'text-emerald-800'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 line-clamp-1">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Fallback Notice Banner */}
      {status?.status === 'fallback' && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Primary model unavailable. Auto-switched from{' '}
              <strong className="font-mono">{status.previousModel}</strong> to{' '}
              <strong className="font-mono">{status.model}</strong>.
            </span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-amber-600 shrink-0 ml-2" />
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <div className="flex-1">
            <strong className="font-semibold block">Generation Error:</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Live Stream / Shimmer View */}
      {isGenerating && (
        <div className="rounded-lg border border-slate-200 bg-slate-900 text-slate-100 p-3 font-mono text-[11px] space-y-2 shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-indigo-400" />
              <span>Live Generation Stream ({status?.model || 'Gemini'})</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Streaming tokens
            </span>
          </div>

          <div className="max-h-36 overflow-auto whitespace-pre-wrap text-slate-300 leading-relaxed font-mono">
            {streamingText || (
              <div className="flex items-center gap-2 py-3 text-slate-500 italic">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                <span>Model thinking and synthesizing Mustache layout blocks...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
