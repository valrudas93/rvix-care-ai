import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Calendar, User } from "lucide-react";
import { getAnalysisHistory, HistoryItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);

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
    const variants = {
      bajo: "outline",
      medio: "secondary",
      alto: "destructive",
    };
    return (
      <Badge variant={variants[risk as keyof typeof variants] as any} className="font-medium">
        {risk.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Historial de Análisis</h1>
        <p className="text-muted-foreground">
          Registro completo de todos los análisis realizados
        </p>
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
                      year: "numeric",
                      month: "long",
                      day: "numeric",
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
                  <p className="text-sm font-medium">{item.study_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Modelo Aplicado</p>
                  <p className="text-sm font-medium">Análisis Completo</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confianza</p>
                  <p className="text-sm font-medium">{item.confidence}%</p>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
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
    </div>
  );
};

export default History;
