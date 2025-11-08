import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Calendar, User } from "lucide-react";

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const historyData = [
    {
      id: "PAC-2025-012",
      date: "2025-01-15",
      imageType: "Citología",
      model: "Detección Temprana",
      result: "bajo",
      confidence: 94,
    },
    {
      id: "PAC-2025-011",
      date: "2025-01-14",
      imageType: "Resonancia",
      model: "Heterogeneidad Tumoral",
      result: "medio",
      confidence: 87,
    },
    {
      id: "PAC-2025-010",
      date: "2025-01-13",
      imageType: "Ambas",
      model: "Análisis Completo",
      result: "bajo",
      confidence: 91,
    },
    {
      id: "PAC-2025-009",
      date: "2025-01-12",
      imageType: "Citología",
      model: "Detección Temprana",
      result: "alto",
      confidence: 89,
    },
    {
      id: "PAC-2025-008",
      date: "2025-01-11",
      imageType: "Resonancia",
      model: "Heterogeneidad Tumoral",
      result: "medio",
      confidence: 85,
    },
  ];

  const filteredData = historyData.filter((item) =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Card key={item.id} className="shadow-card hover:shadow-medical transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">{item.id}</CardTitle>
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
                {getRiskBadge(item.result)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tipo de Imagen</p>
                  <p className="text-sm font-medium">{item.imageType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Modelo Aplicado</p>
                  <p className="text-sm font-medium">{item.model}</p>
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
