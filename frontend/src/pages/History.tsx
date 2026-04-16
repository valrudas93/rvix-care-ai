import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Eye, Calendar, User, Brain, Activity, AlertCircle } from "lucide-react";
import { getAnalysisHistory, HistoryItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MedicalMarkdown } from "@/components/MedicalMarkdown";

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const items = await getAnalysisHistory();
        setHistoryData(items);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudo cargar el historial",
          variant: "destructive",
        });
      }
    };
    loadHistory();
  }, [toast]);

  const filteredData = historyData.filter((item) =>
    item.patient_identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskBadge = (risk: string) => {
    const styles: Record<string, string> = {
      bajo: "border-green-400 text-green-700 bg-green-50",
      medio: "border-yellow-400 text-yellow-700 bg-yellow-50",
      alto: "border-red-400 text-red-700 bg-red-50",
    };
    return (
      <Badge variant="outline" className={`font-semibold ${styles[risk] ?? ""}`}>
        {risk.toUpperCase()}
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
        {filteredData.map((item) => (
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
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tipo de Imagen</p>
                  <p className="text-sm font-medium capitalize">{item.study_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confianza</p>
                  <p className="text-sm font-medium">{item.confidence}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Informe LLM</p>
                  <p className="text-sm font-medium">
                    {item.medical_explanation ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Brain className="h-3 w-3" /> Disponible
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No generado</span>
                    )}
                  </p>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Consulta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron resultados</p>
          </CardContent>
        </Card>
      )}

      {/* Detail Sheet — consulta completa */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader className="pb-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Consulta — {selectedItem.patient_identifier}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedItem.date).toLocaleDateString("es-ES", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Risk summary */}
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mb-1">Nivel de Riesgo</p>
                    {getRiskBadge(selectedItem.risk_level)}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-muted-foreground">Confianza</p>
                    <p className="text-2xl font-bold text-primary">{selectedItem.confidence}%</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-muted-foreground">Tipo estudio</p>
                    <p className="text-sm font-medium capitalize">{selectedItem.study_type}</p>
                  </div>
                </div>

                {/* Detected regions */}
                {selectedItem.detected_regions.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" /> Regiones Detectadas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.detected_regions.map((r, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedItem.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Recomendaciones</p>
                    <ul className="space-y-1.5">
                      {selectedItem.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* LLM explanation */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg gradient-medical shadow-sm">
                      <Brain className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="text-sm font-semibold">Informe Médico — Claude AI</p>
                  </div>
                  {selectedItem.medical_explanation ? (
                    <MedicalMarkdown text={selectedItem.medical_explanation} />
                  ) : (
                    <div className="flex items-center gap-2 py-4 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm italic">Informe no disponible para este análisis.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default History;
