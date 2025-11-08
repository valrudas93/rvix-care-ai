import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Download, FileText, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simulated results
  const results = {
    riskLevel: "medio",
    confidence: 87.5,
    detectedRegions: ["Zona de transformación", "Células escamosas atípicas"],
    recommendations: [
      "Realizar seguimiento en 3 meses",
      "Considerar colposcopía para evaluación detallada",
      "Mantener vigilancia regular",
    ],
    model1: {
      name: "Detección de Lesiones Tempranas",
      status: "completado",
      findings: "Células escamosas atípicas de significado indeterminado (ASC-US) detectadas",
    },
    model2: {
      name: "Análisis de Heterogeneidad Tumoral",
      status: "completado",
      findings: "Patrón de distribución celular irregular en zona de transformación",
    },
  };

  const handleDownload = () => {
    toast({
      title: "Descargando Informe",
      description: "El informe PDF se está generando...",
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Resultados del Análisis</h1>
          <p className="text-muted-foreground">
            Revisión completa de los modelos de inteligencia artificial
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Panel
        </Button>
      </div>

      {/* Risk Level Card */}
      <Card className="shadow-medical border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Nivel de Riesgo</CardTitle>
              <CardDescription>Basado en el análisis de IA</CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className="text-lg px-4 py-2 border-2 border-primary bg-primary-light text-primary font-semibold"
            >
              {results.riskLevel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <span>Nivel de confianza: {results.confidence}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Model Results */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{results.model1.name}</CardTitle>
            </div>
            <CardDescription>Estado: {results.model1.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{results.model1.findings}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{results.model2.name}</CardTitle>
            </div>
            <CardDescription>Estado: {results.model2.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{results.model2.findings}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detected Regions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Regiones Afectadas</CardTitle>
          <CardDescription>Áreas identificadas por los modelos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {results.detectedRegions.map((region, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                {region}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recomendaciones del Sistema</CardTitle>
          <CardDescription>Sugerencias basadas en el análisis</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {results.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          className="gradient-medical shadow-medical hover:opacity-90"
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar Informe PDF
        </Button>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Enviar al Médico Tratante
        </Button>
      </div>
    </div>
  );
};

export default Results;
