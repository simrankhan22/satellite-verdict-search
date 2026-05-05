import { useState } from "react";
import { Search, Satellite, CheckCircle2, XCircle, HelpCircle, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const SAMPLE_PROMPTS = [
  "solar farm",
  "shipping container yard",
  "deforestation patch",
  "wind turbines",
];

// Free satellite tile sources (Esri World Imagery)
const tileUrl = (z: number, x: number, y: number) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;

const SEED_TILES: { x: number; y: number; z: number; coords: string }[] = [
  { z: 10, x: 301, y: 384, coords: "37.79°N, 122.41°W" },
  { z: 10, x: 600, y: 401, coords: "34.05°N, 118.24°W" },
  { z: 10, x: 525, y: 390, coords: "40.71°N, 74.00°W" },
  { z: 10, x: 614, y: 372, coords: "41.87°N, 87.62°W" },
  { z: 10, x: 533, y: 399, coords: "29.76°N, 95.36°W" },
  { z: 10, x: 553, y: 408, coords: "25.76°N, 80.19°W" },
  { z: 10, x: 295, y: 379, coords: "47.60°N, 122.33°W" },
  { z: 10, x: 511, y: 365, coords: "42.36°N, 71.05°W" },
  { z: 10, x: 312, y: 410, coords: "32.71°N, 117.16°W" },
];

const randomVerdict = (): Verdict => {
  const r = Math.random();
  if (r < 0.45) return "YES";
  if (r < 0.8) return "NO";
  return "UNCLEAR";
};

const verdictMeta = {
  YES: { icon: CheckCircle2, color: "text-success", bg: "bg-success/15", border: "border-success/40", label: "YES" },
  NO: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/40", label: "NO" },
  UNCLEAR: { icon: HelpCircle, color: "text-warning", bg: "bg-warning/15", border: "border-warning/40", label: "UNCLEAR" },
};

const Index = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TileResult[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setSelected(null);
    // Backend integration will populate results here later.
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
  };

  const counts = results.reduce(
    (acc, r) => ({ ...acc, [r.verdict]: (acc[r.verdict] || 0) + 1 }),
    { YES: 0, NO: 0, UNCLEAR: 0 } as Record<Verdict, number>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10 bg-background/70">
        <div className="container py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Satellite className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">OrbitScan</h1>
              <p className="text-xs text-muted-foreground">VLM-powered satellite imagery search</p>
            </div>
          </div>
          <Badge variant="outline" className="hidden sm:flex border-primary/40 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2 animate-pulse" />
            Model online
          </Badge>
        </div>
      </header>

      {/* Search */}
      <section className="container pt-10 pb-6">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-8">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Search Earth with natural language
          </h2>
          <p className="text-muted-foreground">
            Describe what you're looking for. Our vision-language model scans satellite tiles and returns YES / NO / UNCLEAR verdicts.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 p-2 rounded-2xl bg-card border border-border shadow-elegant">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. solar farm, shipping containers, wildfire scar..."
                className="pl-10 h-11 bg-transparent border-0 focus-visible:ring-0 text-base"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              size="lg"
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow font-medium"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Search</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <span className="text-xs text-muted-foreground self-center mr-1">Try:</span>
            {SAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setQuery(p)}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Image grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Satellite Tiles {results.length > 0 && `(${results.length})`}
              </h3>
              {results.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline" className="border-success/40 text-success">YES {counts.YES}</Badge>
                  <Badge variant="outline" className="border-destructive/40 text-destructive">NO {counts.NO}</Badge>
                  <Badge variant="outline" className="border-warning/40 text-warning">UNCLEAR {counts.UNCLEAR}</Badge>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-16 text-center bg-card/40">
                <Satellite className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">Run a search to see satellite tiles here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {results.map((r) => {
                  const meta = verdictMeta[r.verdict];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelected(r.id)}
                      className={cn(
                        "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-muted",
                        selected === r.id ? "border-primary shadow-glow" : "border-border hover:border-primary/50"
                      )}
                    >
                      <img
                        src={r.imageUrl}
                        alt={`Satellite tile ${r.coords}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/0 to-background/0" />
                      <div className={cn("absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 backdrop-blur-md border", meta.bg, meta.border, meta.color)}>
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 text-xs text-foreground/90">
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
            <div className="sticky top-24 rounded-xl border border-border bg-gradient-panel shadow-elegant overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">VLM Verdicts</h3>
              </div>

              {results.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground text-center">
                  Verdicts will appear here after a search.
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto divide-y divide-border">
                  {results.map((r) => {
                    const meta = verdictMeta[r.verdict];
                    const Icon = meta.icon;
                    const isSelected = selected === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelected(r.id)}
                        className={cn(
                          "w-full text-left p-4 transition-colors hover:bg-secondary/50",
                          isSelected && "bg-secondary/70"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border", meta.bg, meta.border)}>
                            <Icon className={cn("h-4 w-4", meta.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={cn("text-xs font-semibold", meta.color)}>{meta.label}</span>
                              <span className="text-xs text-muted-foreground">{r.confidence}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
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
