'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Cpu,
  Layers,
  LayoutGrid,
  FileCode,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Table,
  User,
  Image,
  List,
  BarChart3,
  CheckCheck,
  Bot,
  ExternalLink,
} from 'lucide-react';
import {
  GeminiClient,
  GeminiStatusUpdate,
  DEFAULT_MODEL_CANDIDATES,
} from '@/lib/gemini/gemini-client';
import {
  validateTemplateAgainstJson,
  ValidationReport,
  extractAvailableJsonProperties,
} from '@/lib/gemini/template-validator';
import {
  VisualBlock,
  DisplayArchetype,
  parseTemplateToBlocks,
  blocksToTemplate,
  getArchetypeStyles,
} from '@/lib/gemini/block-converter';
import { LlmGenerationView } from './llm-generation-view';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: string;
  templateSnippet?: string;
}

interface LlmDesignerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: any;
  currentBlocks: VisualBlock[];
  selectedClass?: string;
  onApplyTemplate: (result: { blocks: VisualBlock[]; templateHtml: string }) => void;
}

export const LlmDesignerDialog: React.FC<LlmDesignerDialogProps> = ({
  isOpen,
  onClose,
  jsonData,
  currentBlocks,
  selectedClass,
  onApplyTemplate,
}) => {
  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const [discoveredModels, setDiscoveredModels] = useState<string[]>(DEFAULT_MODEL_CANDIDATES);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_CANDIDATES[0]);

  // Stage workflow: 'json' | 'archetype' | 'chat' | 'review'
  const [activeTab, setActiveTab] = useState<'json' | 'archetype' | 'chat' | 'review'>('json');

  // Archetype & Prompt States
  const [selectedArchetype, setSelectedArchetype] = useState<DisplayArchetype>('card');
  const [customStylePrompt, setCustomStylePrompt] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Generation & Status States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [statusUpdate, setStatusUpdate] = useState<GeminiStatusUpdate | null>(null);
  const [streamingText, setStreamingText] = useState<string>('');
  const [fallbacksTriggered, setFallbacksTriggered] = useState<string[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showStatusView, setShowStatusView] = useState<boolean>(true);

  // Generated outputs
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [generatedBlocks, setGeneratedBlocks] = useState<VisualBlock[]>(currentBlocks);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  // Load API key from local storage on mount
  useEffect(() => {
    const saved = GeminiClient.getStoredApiKey();
    if (saved) {
      setApiKey(saved);
      setIsKeySaved(true);
    }
  }, [isOpen]);

  // Available JSON fields
  const availableProps = useMemo(() => {
    return Array.from(extractAvailableJsonProperties(jsonData));
  }, [jsonData]);

  // Formatted JSON string
  const formattedJson = useMemo(() => {
    try {
      return JSON.stringify(jsonData, null, 2);
    } catch {
      return String(jsonData);
    }
  }, [jsonData]);

  const handleSaveApiKey = () => {
    GeminiClient.setStoredApiKey(apiKey);
    setIsKeySaved(Boolean(apiKey.trim()));
    if (apiKey.trim()) {
      GeminiClient.discoverModels(apiKey)
        .then(models => {
          setDiscoveredModels(models);
          if (models.length > 0 && !models.includes(selectedModel)) {
            setSelectedModel(models[0]);
          }
        })
        .catch(() => {});
    }
  };

  const handleClearApiKey = () => {
    GeminiClient.clearStoredApiKey();
    setApiKey('');
    setIsKeySaved(false);
  };

  // Run automated validation whenever generatedHtml changes
  useEffect(() => {
    if (generatedHtml) {
      const report = validateTemplateAgainstJson(generatedHtml, jsonData);
      setValidationReport(report);
      const parsed = parseTemplateToBlocks(generatedHtml);
      if (parsed.length > 0) {
        setGeneratedBlocks(parsed);
      }
    }
  }, [generatedHtml, jsonData]);

  // Execute generation with Gemini
  const handleGenerateTemplate = async (userPrompt?: string) => {
    if (!apiKey.trim()) {
      setActiveTab('json');
      alert('Please enter and save your Google Gemini API key first.');
      return;
    }

    setShowStatusView(true);
    setIsGenerating(true);
    setGenerationError(null);
    setStreamingText('');
    setFallbacksTriggered([]);
    setGenerationStep(1); // Connecting to Gemini

    const promptText = userPrompt || customStylePrompt || `Design a ${selectedArchetype} layout`;
    const targetClassLabel = selectedClass ? selectedClass.split(/[#/]/).pop() : 'Entity';

    const systemInstruction = `You are an expert UI developer and semantic web engineer specializing in RDF Webcomponents and Mustache template syntax.
You generate clean, responsive HTML Mustache templates designed to be rendered by <lens-display>.

MANDATORY RULES:
1. Wrap records inside {{#each items}} ... {{/each}}.
2. Use property interpolations {{field}} for primary headings or values.
3. Use conditional sections {{#field}}<p><strong>Field:</strong> {{field}}</p>{{/field}} for optional properties.
4. ONLY reference property names that exist in the provided JSON schema.
5. Include an embedded <style> block with beautiful, modern CSS classes (clean typography, subtle borders, responsive CSS grid/flexbox, soft shadows).
6. Annotate each property block with a comment <!-- Block: fieldName --> or <!-- Block: ? fieldName --> so our Visual Block Designer can parse it into canvas blocks.
7. Return ONLY the template HTML and style without extra conversational markdown chatter.`;

    const fullPrompt = `The RDF Lens extracted the following JSON data for ${targetClassLabel}:
\`\`\`json
${formattedJson}
\`\`\`

Available property fields: ${availableProps.join(', ')}
Desired Presentation Style: ${selectedArchetype}
User Request: ${promptText}

Generate the complete Mustache HTML template with <style> according to the rules.`;

    try {
      setGenerationStep(2); // Synthesizing blocks
      const result = await GeminiClient.generateWithFallback(fullPrompt, {
        apiKey,
        model: selectedModel,
        systemInstruction,
        temperature: 0.3,
        onStatusChange: update => {
          setStatusUpdate(update);
          if (update.status === 'fallback' && update.model) {
            setFallbacksTriggered(prev => [...prev, update.model]);
          }
        },
        onToken: token => {
          setStreamingText(token);
        },
      });

      setGenerationStep(3); // Validating
      let cleanCode = result.text.trim();
      // Remove any surrounding markdown backticks if returned
      if (cleanCode.startsWith('```html')) {
        cleanCode = cleanCode.replace(/^```html\s*/, '').replace(/\s*```$/, '');
      } else if (cleanCode.startsWith('```')) {
        cleanCode = cleanCode.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Synchronously execute validation and parse blocks
      try {
        const report = validateTemplateAgainstJson(cleanCode, jsonData);
        setValidationReport(report);
        const parsed = parseTemplateToBlocks(cleanCode);
        if (parsed.length > 0) {
          setGeneratedBlocks(parsed);
        }
      } catch (valErr) {
        console.warn('Template validation notice:', valErr);
      }

      setGeneratedHtml(cleanCode);
      setGenerationStep(4); // All 4 steps complete!

      // Add to conversation
      const newAgentMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        content: `I've synthesized a ${selectedArchetype} template for your ${targetClassLabel} data using model ${result.modelUsed}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        templateSnippet: cleanCode,
      };

      setMessages(prev => [...prev, newAgentMsg]);
      setActiveTab('review');
    } catch (err: any) {
      setGenerationError(err?.message || 'Failed to generate template.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isGenerating) return;

    const userText = chatInput.trim();
    setChatInput('');

    const newMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    await handleGenerateTemplate(userText);
  };

  const handleApply = () => {
    onApplyTemplate({
      blocks: generatedBlocks,
      templateHtml: generatedHtml || blocksToTemplate(generatedBlocks, selectedArchetype),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-2rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-2rem)] lg:max-w-[calc(100vw-2rem)] xl:max-w-[calc(100vw-2rem)] 2xl:max-w-[calc(100vw-2rem)] h-[96vh] max-h-[96vh] flex flex-col p-6 overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>AI Template Designer</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Gemini LLM
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Inspect lens JSON, converse with the agent, and generate validated Mustache blocks
                </DialogDescription>
              </div>
            </div>

            {/* Model & Key Pill */}
            <div className="flex items-center gap-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 underline-offset-2 transition-colors mr-1"
                title="Get your free Gemini API key from Google AI Studio (opens in new tab)"
              >
                <span>Get Google API Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border bg-slate-50 text-xs">
                <Key className="h-3.5 w-3.5 text-slate-400" />
                <span className={isKeySaved ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                  {isKeySaved ? 'API Key Active' : 'API Key Missing'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* API Key Configuration Accordion / Bar */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex-1 min-w-[320px] flex items-center gap-2">
            <span className="font-semibold text-slate-700 shrink-0">Gemini Key:</span>
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="h-8 pr-8 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button
              size="sm"
              variant={isKeySaved ? 'outline' : 'default'}
              onClick={handleSaveApiKey}
              className="h-8 text-xs cursor-pointer"
            >
              {isKeySaved ? 'Update' : 'Save Key'}
            </Button>
            {isKeySaved && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearApiKey}
                className="h-8 text-xs text-slate-400 hover:text-red-600 cursor-pointer"
              >
                Clear
              </Button>
            )}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200 transition-all shrink-0 cursor-pointer shadow-2xs"
              title="Get a free Gemini API key from Google AI Studio (opens in new tab)"
            >
              <span>Get API Key</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500 text-[11px]">Model:</span>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-mono text-slate-700"
            >
              {discoveredModels.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generation Status View (visible during and after generation) */}
        {showStatusView && (isGenerating || statusUpdate || generationError) && (
          <LlmGenerationView
            status={statusUpdate}
            activeStepIndex={generationStep}
            streamingText={streamingText}
            isGenerating={isGenerating}
            fallbacksTriggered={fallbacksTriggered}
            error={generationError}
            onDismiss={() => setShowStatusView(false)}
          />
        )}

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-4 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="json" className="text-xs font-semibold gap-1.5 cursor-pointer">
              <span>1. Lens JSON</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-200 text-slate-700">
                {availableProps.length} props
              </span>
            </TabsTrigger>
            <TabsTrigger value="archetype" className="text-xs font-semibold gap-1.5 cursor-pointer">
              <span>2. Style & Archetype</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs font-semibold gap-1.5 cursor-pointer">
              <span>3. Chat & Refine</span>
              {messages.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-100 text-indigo-700">
                  {messages.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="review" className="text-xs font-semibold gap-1.5 cursor-pointer">
              <span>4. Review & Validate</span>
              {validationReport && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                    validationReport.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {validationReport.valid ? 'Valid' : `${validationReport.errors.length} err`}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: JSON Inspection */}
          <TabsContent value="json" className="flex-1 flex flex-col min-h-0 pt-3 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">
                Extracted Data from <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">rdf-lens</code>:
              </span>
              <div className="flex items-center gap-1.5 flex-1 justify-end">
                <span className="text-slate-400 shrink-0">Available keys:</span>
                <div className="flex flex-wrap gap-1 max-w-2xl justify-end">
                  {availableProps.map(p => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-4 font-mono text-xs shadow-inner">
              <pre className="whitespace-pre-wrap">{formattedJson}</pre>
            </ScrollArea>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-[11px] text-slate-500">
                Step 1: Review data structure before generating visual blocks.
              </span>
              <Button
                size="sm"
                onClick={() => setActiveTab('archetype')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                Next: Choose Presentation Style →
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: Display Archetype Selection */}
          <TabsContent value="archetype" className="flex-1 flex flex-col min-h-0 pt-3 space-y-4">
            <div className="text-xs text-slate-600">
              Select how you would like the RDF data to be visually presented:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                {
                  id: 'card',
                  title: 'Card Grid',
                  icon: LayoutGrid,
                  desc: 'Modern card tiles with hover elevation, property badges & accents',
                },
                {
                  id: 'figure',
                  title: 'Figure / Showcase',
                  icon: Image,
                  desc: 'Highlighted media or avatar figure with descriptive captions',
                },
                {
                  id: 'profile',
                  title: 'Profile Badge',
                  icon: User,
                  desc: 'Identity card with top color ribbon, avatar slot, and contact details',
                },
                {
                  id: 'table',
                  title: 'Tabular / Rows',
                  icon: Table,
                  desc: 'Clean horizontal record rows optimized for multi-item datasets',
                },
                {
                  id: 'metric',
                  title: 'Metric KPI',
                  icon: BarChart3,
                  desc: 'Prominent headline numbers and key statistical data points',
                },
                {
                  id: 'list',
                  title: 'Compact List',
                  icon: List,
                  desc: 'Minimal linear items with left accent borders and concise layout',
                },
              ].map(arch => {
                const Icon = arch.icon;
                const isSelected = selectedArchetype === arch.id;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setSelectedArchetype(arch.id as DisplayArchetype)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-200 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-indigo-600 font-bold" />}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{arch.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{arch.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-2 border-t">
              <label className="text-xs font-semibold text-slate-700 block">
                Additional Instructions (Optional):
              </label>
              <Input
                placeholder="e.g. Include mailto link for email, make name prominent, subtle rounded borders..."
                value={customStylePrompt}
                onChange={e => setCustomStylePrompt(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setActiveTab('json')} className="cursor-pointer">
                ← Back
              </Button>
              <Button
                size="sm"
                onClick={() => handleGenerateTemplate()}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate {selectedArchetype.toUpperCase()} Template
              </Button>
            </div>
          </TabsContent>

          {/* TAB 3: Interactive Chat Refinement */}
          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 pt-2">
            <div className="grid lg:grid-cols-12 gap-4 flex-1 min-h-0">
              {/* Left Column: Chat conversation & prompt input */}
              <div className="lg:col-span-7 flex flex-col min-h-0 space-y-2">
                <ScrollArea className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 space-y-2">
                        <Bot className="h-8 w-8 mx-auto text-slate-300" />
                        <p className="text-xs font-medium">No conversation history yet.</p>
                        <p className="text-[11px]">
                          Choose an archetype from tab 2, or type a request below to begin designing.
                        </p>
                      </div>
                    ) : (
                      messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                              msg.sender === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            <p className="leading-relaxed">{msg.content}</p>
                            {msg.templateSnippet && (
                              <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between">
                                <span className="text-[10px] text-indigo-600 font-mono font-medium">
                                  Template generated
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setActiveTab('review')}
                                  className="h-6 text-[10px] text-indigo-600 hover:text-indigo-800 p-0 cursor-pointer"
                                >
                                  Inspect in Review →
                                </Button>
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Quick Feedback Chips */}
                <div className="flex flex-wrap gap-1.5 py-1">
                  {[
                    'Make it horizontal',
                    'Add email mailto link',
                    'Add soft background gradient',
                    'Only show city if provided',
                    'Compact badge format',
                  ].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleGenerateTemplate(chip)}
                      disabled={isGenerating}
                      className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer shadow-2xs"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex items-center gap-2 pt-1 border-t">
                  <Input
                    placeholder="Give feedback or ask for changes (e.g., 'Make headers larger', 'Add avatar placeholder')..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                    disabled={isGenerating}
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={handleSendChatMessage}
                    disabled={isGenerating || !chatInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Right Column: Live Design Draft & Blocks Preview on Wide Screens */}
              <div className="hidden lg:flex lg:col-span-5 flex-col min-h-0 space-y-2 border-l lg:pl-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Live Design Draft</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono">
                      {selectedArchetype}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab('review')}
                    className="h-6 text-[10px] text-indigo-600 hover:text-indigo-800 p-0 cursor-pointer"
                  >
                    Full Review →
                  </Button>
                </div>

                {/* Blocks Mini-List */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1.5">
                    Visual Blocks ({generatedBlocks.length}):
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {generatedBlocks.length === 0 ? (
                      <span className="text-slate-400 text-[11px] italic">No blocks generated yet.</span>
                    ) : (
                      generatedBlocks.map(block => (
                        <span
                          key={block.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                            block.type === 'property'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : block.type === 'conditional'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-purple-50 border-purple-200 text-purple-700'
                          }`}
                        >
                          {block.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* HTML Template Preview */}
                <div className="flex-1 flex flex-col min-h-0">
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Mustache Template HTML:
                  </span>
                  <ScrollArea className="flex-1 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-3 font-mono text-[10.5px] shadow-inner">
                    <pre className="whitespace-pre-wrap">
                      {generatedHtml || '<!-- Start a conversation or select an archetype to draft template -->'}
                    </pre>
                  </ScrollArea>
                </div>

                {/* Quick Apply Button */}
                {generatedBlocks.length > 0 && (
                  <Button
                    size="sm"
                    onClick={handleApply}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Apply Current Template to Canvas
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: Review, Automated Validation & Apply */}
          <TabsContent value="review" className="flex-1 flex flex-col min-h-0 pt-2 space-y-3">
            {/* Validation Report Banner */}
            {validationReport && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  validationReport.valid
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50/50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {validationReport.valid ? (
                    <CheckCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                  )}
                  <div>
                    <strong className="block font-semibold">
                      {validationReport.valid ? 'Template Validation Passed' : 'Validation Issues Detected'}
                    </strong>
                    <span className="text-[11px] text-slate-600">
                      {validationReport.matchedProperties.length} matched fields: (
                      {validationReport.matchedProperties.join(', ')})
                      {validationReport.missingProperties.length > 0 &&
                        ` | Missing: ${validationReport.missingProperties.join(', ')}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border shadow-2xs">
                    {generatedBlocks.length} Canvas Blocks
                  </span>
                </div>
              </div>
            )}

            {/* Side-by-side 2-column layout on wide screens */}
            <div className="grid lg:grid-cols-12 gap-4 flex-1 min-h-0">
              {/* Left Column: Visual Blocks List */}
              <div className="lg:col-span-5 flex flex-col min-h-0 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Generated Visual Designer Blocks ({generatedBlocks.length}):
                </span>
                <ScrollArea className="flex-1 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  {generatedBlocks.length === 0 ? (
                    <span className="text-slate-400 text-xs italic">No blocks generated yet.</span>
                  ) : (
                    <div className="space-y-2">
                      {generatedBlocks.map((block, idx) => (
                        <div
                          key={block.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border bg-white shadow-2xs ${
                            block.type === 'property'
                              ? 'border-blue-200 bg-gradient-to-r from-blue-50/20 to-white'
                              : block.type === 'conditional'
                              ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/20 to-white'
                              : 'border-purple-200 bg-gradient-to-r from-purple-50/20 to-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-slate-100 text-slate-600">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-mono font-semibold text-slate-800">
                              {block.name}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              block.type === 'property'
                                ? 'bg-blue-100 text-blue-700'
                                : block.type === 'conditional'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {block.type === 'property' ? '🗲 Property' : block.type === 'conditional' ? '? Conditional' : '<> HTML'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Right Column: HTML Template Output */}
              <div className="lg:col-span-7 flex flex-col min-h-0 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Mustache HTML Template Output:
                </span>
                <ScrollArea className="flex-1 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-4 font-mono text-[11px] shadow-inner">
                  <pre className="whitespace-pre-wrap">{generatedHtml || '<!-- Click generate to draft template -->'}</pre>
                </ScrollArea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setActiveTab('chat')} className="cursor-pointer">
                ← Refine with Chat
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateTemplate()}
                  disabled={isGenerating}
                  className="gap-1.5 cursor-pointer text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={!generatedHtml}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer font-bold shadow-sm"
                >
                  <Check className="h-4 w-4" />
                  Apply to Visual Designer Canvas
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
