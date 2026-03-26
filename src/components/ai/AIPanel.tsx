"use client";

import * as React from "react";
import {
  IconX,
  IconSparkles,
  IconSend,
  IconBulb,
  IconSitemap,
  IconMessageQuestion,
  IconListDetails,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAIKeys, PROVIDER_META, type AIProvider } from "../../store/ai.store";

const PROMPT_SUGGESTIONS = [
  {
    icon: IconSitemap,
    label: "Build a diagram",
    description: "Generate an architecture from a description",
  },
  {
    icon: IconListDetails,
    label: "Design a process",
    description: "Map out workflows and data flows",
  },
  {
    icon: IconMessageQuestion,
    label: "Ask questions",
    description: "Explain any part of your architecture",
  },
  {
    icon: IconBulb,
    label: "Brainstorm ideas",
    description: "Suggest improvements or alternatives",
  },
];

interface AIPanelProps {
  onClose: () => void;
}

export default function AIPanel({ onClose }: AIPanelProps) {
  const { keys, hasAny } = useAIKeys();
  const [prompt, setPrompt] = React.useState("");
  const [selectedProvider, setSelectedProvider] = React.useState<AIProvider | null>(null);
  const [providerOpen, setProviderOpen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-select the first available provider
  React.useEffect(() => {
    if (keys.length > 0 && !selectedProvider) {
      setSelectedProvider(keys[0].provider);
    }
  }, [keys, selectedProvider]);

  const activeProvider = selectedProvider
    ? PROVIDER_META[selectedProvider]
    : null;

  const canSend = prompt.trim().length > 0 && hasAny;

  const handleSend = () => {
    if (!canSend) return;
    // TODO: hook into actual AI API call
    console.log("[AI] prompt:", prompt, "via:", selectedProvider);
    setPrompt("");
  };

  return (
    <div
      className="flex flex-col bg-card border border-border rounded-[--radius] shadow-2xl w-[380px] overflow-hidden animate-in slide-in-from-left-4 fade-in duration-300"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)", maxHeight: "calc(100vh - 96px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <IconSparkles size={16} className="text-primary" stroke={1.8} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold tracking-tight">AI Assistant</h3>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
              Powered by your API key
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Provider selector */}
          {keys.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setProviderOpen(!providerOpen)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {activeProvider?.label ?? "Select"}
                <IconChevronDown size={10} />
              </button>
              {providerOpen && (
                <div className="absolute top-[calc(100%+4px)] right-0 z-50 bg-card border border-border rounded-md p-1 min-w-[160px] shadow-xl">
                  {keys.map((k) => (
                    <button
                      key={k.provider}
                      onClick={() => {
                        setSelectedProvider(k.provider);
                        setProviderOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-[11px] hover:bg-muted transition-colors text-left",
                        selectedProvider === k.provider && "bg-primary/10 text-primary"
                      )}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: PROVIDER_META[k.provider].color }}
                      />
                      {PROVIDER_META[k.provider].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {keys.length === 1 && activeProvider && (
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: activeProvider.color }}
              />
              {activeProvider.label}
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconX size={14} />
          </button>
        </div>
      </div>

      {/* Chat / Prompt Area */}
      <div className="flex flex-col gap-3 p-4 flex-1 overflow-y-auto">
        {/* Prompt input */}
        <div className="relative rounded-[--radius] border border-border bg-muted/20 focus-within:border-primary focus-within:ring-[1px] focus-within:ring-primary/20 transition-all">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe what you want… (e.g. 'Design a chat app with WebSocket')"
            rows={3}
            className="w-full resize-none bg-transparent px-3 pt-3 pb-2 text-[13px] placeholder:text-muted-foreground outline-none leading-relaxed font-sans"
          />
          <div className="flex items-center justify-end gap-1.5 px-2 pb-2">
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "p-1.5 rounded-md transition-all",
                canSend
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              <IconSend size={14} />
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Things you can try
          </p>
          <div className="space-y-1">
            {PROMPT_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setPrompt(s.label + ": ");
                  textareaRef.current?.focus();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[--radius] hover:bg-muted/60 text-left transition-colors group"
              >
                <div className="p-1.5 bg-muted rounded-md shrink-0 group-hover:bg-primary/10 transition-colors">
                  <s.icon size={14} className="text-muted-foreground group-hover:text-primary transition-colors" stroke={1.5} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-foreground leading-tight">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                    {s.description}
                  </div>
                </div>
                <IconChevronRight size={12} className="text-muted-foreground/40 ml-auto shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/40 bg-muted/20">
        <p className="text-[9px] text-muted-foreground/60 leading-relaxed">
          Your API key is stored locally and never sent to our servers. Requests go directly from your browser to the AI provider.
        </p>
      </div>
    </div>
  );
}
