import { useState } from "react";
import { Diamond } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface VlmAgentProps {
  onAsk?: (payload: {
    base: string;
    model: string;
    systemPrompt: string;
    question: string;
    maxTokens: number;
    temperature: number;
    thinking: boolean;
  }) => void;
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[11px] font-mono font-semibold tracking-wider text-primary uppercase">
    {children}
  </label>
);

export const VlmAgent = ({ onAsk }: VlmAgentProps) => {
  const [base, setBase] = useState("http://100.64.0.2:8080");
  const [model] = useState("Qwen3.6-35B-A3B (loaded)");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a satellite operator provided with satellite or aerial footage. Answer the user with one sentence unless asked otherwise."
  );
  const [question, setQuestion] = useState(
    "Compare these search results. What visible scene features do they share?"
  );
  const [maxTokens, setMaxTokens] = useState(256);
  const [temperature, setTemperature] = useState(1.8);
  const [thinking, setThinking] = useState(false);

  const handleAsk = () => {
    onAsk?.({ base, model, systemPrompt, question, maxTokens, temperature, thinking });
  };

  return (
    <div className="rounded-md border border-border bg-card shadow-elegant p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Diamond className="h-4 w-4 text-primary fill-primary/30" />
          <h2 className="font-mono font-bold tracking-wider text-foreground">VLM AGENT</h2>
        </div>
        <p className="text-sm text-muted-foreground">Send selected images to the VLM agent.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Llama-Server Base</Label>
          <Input
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="font-mono bg-secondary/40 border-border"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Active Model</Label>
          <Input
            value={model}
            readOnly
            className="font-mono bg-secondary/40 border-border text-muted-foreground"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>System Prompt</Label>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={3}
            className="bg-secondary/40 border-border resize-y"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Question</Label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="bg-secondary/40 border-border resize-y"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Max Answer Tokens</Label>
          <Input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            className="font-mono bg-secondary/40 border-border"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Temperature</Label>
          <Input
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="font-mono bg-secondary/40 border-border"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={thinking}
            onCheckedChange={(c) => setThinking(c === true)}
            className="border-border"
          />
          <span className="text-[11px] font-mono font-semibold tracking-wider text-primary uppercase">
            Enable thinking if supported
          </span>
        </label>
        <Button
          onClick={handleAsk}
          variant="outline"
          className="border-primary/60 text-primary hover:bg-primary/10 hover:text-primary font-mono font-bold tracking-wider px-8"
        >
          <Diamond className="h-4 w-4 fill-primary/30" />
          <span className="ml-2">ASK VLM</span>
        </Button>
      </div>
    </div>
  );
};
