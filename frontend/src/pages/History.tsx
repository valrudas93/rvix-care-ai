import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Search, Eye, Calendar, User, AlertCircle, CheckCircle2, AlertTriangle, MapPin, ClipboardList, FileText } from "lucide-react";
import { getAnalysisHistory, HistoryItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const riskConfig = {
  bajo:  { label: "Bajo",   icon: CheckCircle2,   badge: "outline",     color: "text-primary",     bg: "bg-primary-light" },
  medio: { label: "Medio",  icon: AlertTriangle,  badge: "secondary",   color: "text-yellow-700",  bg: "bg-yellow-50" },
  alto:  { label: "Alto",   icon: AlertCircle,    badge: "destructive", color: "text-destructive",  bg: "bg-destructive/10" },
};

const studyTypeLabel: Record<string, string> = {
  citologia:  "Citología Cervical",
  resonancia: "Resonancia Magnética",
};

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    getAnalysisHistory()
      .then(setHistoryData)
      .catch((error) => {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudo cargar el historial",
          variant: "destructive",
        });
      });
  }, [toast]);

  const filteredData = historyData.filter((item) =>
    item.patient_identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskBadge = (risk: string) => {
    const cfg = riskConfig[risk as keyof typeof riskConfig];
    if (!cfg) return <Badge variant="outline">{risk.toUpperCase()}</Badge>;
    return (
      <Badge variant={cfg.badge as any} className="font-medium">
        {cfg.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Historial de Análisis</h1>
        <p className="text-muted-foreground">Registro completo de todos los análisis realizados</p>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID de paciente..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {filteredData.map((item) => {
          const cfg = riskConfig[item.risk_level as keyof typeof riskConfig];
          const Icon = cfg?.icon ?? CheckCircle2;
          return (
            <Card key={item.prediction_id} className="shadow-card hover:shadow-medical transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <CardTitle className="text-lg">{item.patient_identifier}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.date).toLocaleDateString("es-ES", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  {getRiskBadge(item.risk_level)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo de Imagen</p>
                    <p className="text-sm font-medium">{studyTypeLabel[item.study_type] ?? item.study_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Riesgo Detectado</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icon className={`h-4 w-4 ${cfg?.color ?? ""}`} />
                      <p className={`text-sm font-medium ${cfg?.color ?? ""}`}>{cfg?.label ?? item.risk_level}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confianza</p>
                    <p className="text-sm font-medium">{item.confidence}%</p>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelected(item)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron resultados</p>
          </CardContent>
        </Card>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (() => {
            const cfg = riskConfig[selected.risk_level as keyof typeof riskConfig];
            const Icon = cfg?.icon ?? CheckCircle2;
            return (
              <>
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-xl">Detalles del Análisis</SheetTitle>
                </SheetHeader>

                {/* Patient + date summary */}
                <div className={`flex items-center gap-3 p-4 rounded-lg ${cfg?.bg ?? "bg-muted"} mb-4`}>
                  <Icon className={`h-6 w-6 flex-shrink-0 ${cfg?.color ?? ""}`} />
                  <div className="flex-1">
                    <p className="font-semibold">{selected.patient_identifier}</p>
                    <p className="text-sm text-muted-foreground">
                      {studyTypeLabel[selected.study_type] ?? selected.study_type} ·{" "}
                      {new Date(selected.date).toLocaleDateString("es-ES", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                  {getRiskBadge(selected.risk_level)}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Nivel de Riesgo</p>
                    <p className={`text-lg font-bold ${cfg?.color ?? ""}`}>{cfg?.label ?? selected.risk_level}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Confianza del Modelo</p>
                    <p className="text-lg font-bold">{selected.confidence}%</p>
                  </div>
                </div>

                {/* Detected regions */}
                {selected.detected_regions.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <p className="font-medium text-sm">Hallazgos Detectados</p>
                      </div>
                      <ul className="space-y-1 pl-6">
                        {selected.detected_regions.map((r, i) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{r}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Recommendations */}
                {selected.recommendations.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-primary" />
                        <p className="font-medium text-sm">Recomendaciones</p>
                      </div>
                      <ul className="space-y-1 pl-6">
                        {selected.recommendations.map((r, i) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{r}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Medical explanation */}
                {selected.medical_explanation && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <p className="font-medium text-sm">Explicación Médica (IA)</p>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-lg">
                        {selected.medical_explanation}
                      </div>
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default History;
