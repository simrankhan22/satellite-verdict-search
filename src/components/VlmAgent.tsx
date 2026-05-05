import { useState } from "react";
import { Diamond, Loader2 } from "lucide-react";
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
    "You are an AI analyst on a satellite monitoring wildfires. Detect wildfire risk in aerial images. Be concise and accurate."
  );
  const [question, setQuestion] = useState(
    "Does this satellite image show visible smoke, fire, or burned vegetation? Answer with only one word: YES or NO."
  );
  const [maxTokens, setMaxTokens] = useState(5);
  const [temperature, setTemperature] = useState(0.1);
  const [thinking, setThinking] = useState(false);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleAsk = async () => {
    onAsk?.({ base, model, systemPrompt, question, maxTokens, temperature, thinking });
    setLoading(true);
    setError("");
    setResponse("");
    try {
      const url = `${base.replace(/\/$/, "")}/v1/chat/completions`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          max_tokens: maxTokens,
          temperature,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const data = await res.json();
      const content =
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.text ??
        JSON.stringify(data);
      setResponse(typeof content === "string" ? content : JSON.stringify(content));
    } catch (e: any) {
      setError(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
          variant="outline"
          className="border-primary/60 text-primary hover:bg-primary/10 hover:text-primary font-mono font-bold tracking-wider px-8"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Diamond className="h-4 w-4 fill-primary/30" />}
          <span className="ml-2">{loading ? "ASKING…" : "ASK VLM"}</span>
        </Button>
      </div>

      {(response || error) && (
        <div className="mt-5 space-y-1.5">
          <Label>VLM Response</Label>
          <div
            className={
              "rounded-md border p-3 font-mono text-sm whitespace-pre-wrap break-words " +
              (error
                ? "border-destructive/50 bg-destructive/10 text-destructive"
                : "border-border bg-secondary/40 text-foreground")
            }
          >
            {error ? `Error: ${error}` : response}
          </div>
        </div>
      )}
    </div>
  );
};
