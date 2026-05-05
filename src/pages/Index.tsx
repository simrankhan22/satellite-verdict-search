import { useMemo, useState } from "react";
import { Flame, Scan, AlertTriangle, CheckCircle2, HelpCircle, Loader2, MapPin, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Verdict = "YES" | "NO" | "UNCLEAR";

interface TileResult {
  id: number;
  imageUrl: string;
  coords: string;
  verdict: Verdict;
  confidence: number;
  reasoning: string;
}

const verdictMeta: Record<Verdict, { label: string; icon: typeof Flame; color: string; bg: string; border: string; rank: number }> = {
  YES:     { label: "YES",     icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/50", rank: 0 },
  UNCLEAR: { label: "UNCLEAR", icon: HelpCircle,    color: "text-warning",     bg: "bg-warning/15",     border: "border-warning/50",     rank: 1 },
  NO:      { label: "NO",      icon: CheckCircle2,  color: "text-success",     bg: "bg-success/15",     border: "border-success/50",     rank: 2 },
};

const Index = () => {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<TileResult[]>([]);
  const [scanned, setScanned] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setResults([]);
    setSelected(null);
    setScanned(0);
    // Backend integration will populate results here later.
    await new Promise((r) => setTimeout(r, 700));
    setScanning(false);
  };

  const sorted = useMemo(
    () => [...results].sort((a, b) => verdictMeta[a.verdict].rank - verdictMeta[b.verdict].rank || b.confidence - a.confidence),
    [results]
  );

  const counts = results.reduce(
    (acc, r) => ({ ...acc, [r.verdict]: (acc[r.verdict] || 0) + 1 }),
    { YES: 0, NO: 0, UNCLEAR: 0 } as Record<Verdict, number>
  );
  const flagged = counts.YES + counts.UNCLEAR;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="container py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-gradient-primary flex items-center justify-center shadow-glow">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight leading-tight">
                Satellite Wildfire Triage
              </h1>
              <p className="text-xs text-muted-foreground font-mono">v0.1 · operational</p>
            </div>
          </div>
          <Badge variant="outline" className="border-success/50 text-success font-mono text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-success mr-2 animate-pulse" />
            LIVE
          </Badge>
        </div>
      </header>

      {/* Scan controls */}
      <section className="container pt-6 pb-4">
        <div className="rounded-md border border-border bg-card shadow-elegant">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Imagery Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Run VLM triage across the latest satellite tiles.
                </p>
              </div>
            </div>
            <Button
              onClick={handleScan}
              disabled={scanning}
              size="lg"
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow font-medium"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Scanning…</span>
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4" />
                  <span className="ml-2">Scan</span>
                </>
              )}
            </Button>
          </div>

          {/* Status bar */}
          <div className="border-t border-border px-4 py-2.5 bg-secondary/40 rounded-b-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            {scanning ? (
              <span className="text-muted-foreground">Analyzing imagery…</span>
            ) : results.length === 0 ? (
              <span className="text-muted-foreground">Idle — awaiting scan.</span>
            ) : (
              <span className="text-foreground">
                Scanned <span className="text-primary font-semibold">{scanned}</span> images —{" "}
                <span className={cn("font-semibold", flagged > 0 ? "text-destructive" : "text-success")}>
                  {flagged}
                </span>{" "}
                require attention
              </span>
            )}
            <div className="flex gap-2">
              <Badge variant="outline" className="border-destructive/50 text-destructive font-mono">YES {counts.YES}</Badge>
              <Badge variant="outline" className="border-warning/50 text-warning font-mono">UNCLEAR {counts.UNCLEAR}</Badge>
              <Badge variant="outline" className="border-success/50 text-success font-mono">NO {counts.NO}</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Image grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Imagery {results.length > 0 && `· ${results.length}`}
              </h3>
              {results.length > 0 && (
                <span className="text-xs text-muted-foreground font-mono">sorted by risk</span>
              )}
            </div>

            {scanning ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="border border-dashed border-border rounded-md p-16 text-center bg-card/40">
                <Scan className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No imagery yet. Trigger a scan to begin triage.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sorted.map((r) => {
                  const meta = verdictMeta[r.verdict];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelected(r.id)}
                      className={cn(
                        "group relative aspect-square rounded-md overflow-hidden border-2 transition-all bg-muted text-left",
                        selected === r.id ? "border-primary shadow-glow" : "border-border hover:border-primary/50",
                        r.verdict === "YES" && "ring-1 ring-destructive/40"
                      )}
                    >
                      <img
                        src={r.imageUrl}
                        alt={`Satellite tile ${r.coords}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                      <div className={cn("absolute top-1.5 right-1.5 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border font-mono", meta.bg, meta.border, meta.color)}>
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-1 text-[10px] text-foreground/90 font-mono">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{r.coords}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Verdict panel */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-md border border-border bg-gradient-panel shadow-elegant overflow-hidden">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  VLM Verdicts
                </h3>
                {flagged > 0 && (
                  <Badge variant="outline" className="border-destructive/50 text-destructive font-mono text-[10px]">
                    {flagged} flagged
                  </Badge>
                )}
              </div>

              {results.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground text-center">
                  Verdicts will appear here after a scan.
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto divide-y divide-border">
                  {sorted.map((r) => {
                    const meta = verdictMeta[r.verdict];
                    const Icon = meta.icon;
                    const isSelected = selected === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelected(r.id)}
                        className={cn(
                          "w-full text-left p-3 transition-colors hover:bg-secondary/60",
                          isSelected && "bg-secondary/80"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("h-9 w-9 rounded-md flex items-center justify-center shrink-0 border", meta.bg, meta.border)}>
                            <Icon className={cn("h-4 w-4", meta.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={cn("text-xs font-bold font-mono", meta.color)}>{meta.label}</span>
                              <span className="text-xs text-muted-foreground font-mono">{r.confidence}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1 font-mono">
                              <MapPin className="h-3 w-3" /> {r.coords}
                            </p>
                            <p className="text-xs text-foreground/80 line-clamp-2">{r.reasoning}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Index;
