import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Download, FileText, ArrowLeft, Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { explainPrediction } from "@/lib/api";
import { MedicalMarkdown } from "@/components/MedicalMarkdown";


const Results = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const location = useLocation();
  const state = location.state as { result?: any; jobId?: string } | null;

  const fallback = {
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

  const result = state?.result ?? fallback;

  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    // Use pre-generated explanation from job if available
    if (result.medical_explanation) {
      setExplanation(result.medical_explanation);
      return;
    }
    // Fallback: call LLM on demand
    setLoadingExplanation(true);
    explainPrediction(
      result.riskLevel,
      result.confidence,
      result.detectedRegions,
      result.recommendations,
      result.model1?.findings,
      result.model2?.findings,
    )
      .then((text) => setExplanation(text))
      .catch(() => {
        toast({
          title: "Error",
          description: "No se pudo obtener la explicación médica del LLM.",
          variant: "destructive",
        });
      })
      .finally(() => setLoadingExplanation(false));
  }, []);

  const handleDownload = () => {
    const fecha = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const recomendacionesHtml = result.recommendations
      .map((r: string) => `<li style="margin-bottom:6px">${r}</li>`)
      .join("");

    const regionesHtml = result.detectedRegions
      .map((r: string) => `<span style="display:inline-block;background:#f0ebff;color:#6d28d9;border-radius:4px;padding:3px 10px;margin:3px;font-size:13px">${r}</span>`)
      .join("");

    const explicacionHtml = explanation
      ? `<div style="white-space:pre-wrap;font-size:13px;line-height:1.7;color:#374151">${explanation}</div>`
      : "<p style='color:#9ca3af'>No disponible</p>";

    const riskColors: Record<string, string> = {
      bajo: "#16a34a",
      medio: "#d97706",
      alto: "#dc2626",
    };
    const riskColor = riskColors[result.riskLevel] ?? "#6d28d9";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Informe VARIME — ${fecha}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; color: #1f2937; padding: 48px; max-width: 800px; margin: auto; }
    header { border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 32px; }
    h1 { color: #7c3aed; font-size: 24px; margin-bottom: 4px; }
    .meta { font-size: 13px; color: #6b7280; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 15px; font-weight: bold; color: #374151; border-left: 4px solid #7c3aed; padding-left: 10px; margin-bottom: 14px; }
    .risk-badge { display: inline-block; padding: 6px 20px; border-radius: 20px; font-weight: bold; font-size: 18px; color: ${riskColor}; border: 2px solid ${riskColor}; }
    .confidence { font-size: 13px; color: #6b7280; margin-top: 8px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .box-title { font-size: 13px; font-weight: bold; color: #374151; margin-bottom: 6px; }
    .box-sub { font-size: 12px; color: #9ca3af; margin-bottom: 8px; }
    .box-text { font-size: 13px; color: #4b5563; }
    ul { padding-left: 20px; }
    footer { margin-top: 48px; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <header>
    <h1>Informe de Análisis — VARIME</h1>
    <p class="meta">Generado el ${fecha} · Sistema VARIME de detección temprana de cáncer cervical</p>
  </header>

  <div class="section">
    <div class="section-title">Nivel de Riesgo</div>
    <div class="risk-badge">${result.riskLevel.toUpperCase()}</div>
    <p class="confidence">Nivel de confianza: ${result.confidence}%</p>
  </div>

  <div class="section">
    <div class="section-title">Resultados por Modelo</div>
    <div class="grid-2">
      <div class="box">
        <div class="box-title">${result.model1.name}</div>
        <div class="box-sub">Estado: ${result.model1.status}</div>
        <div class="box-text">${result.model1.findings}</div>
      </div>
      <div class="box">
        <div class="box-title">${result.model2.name}</div>
        <div class="box-sub">Estado: ${result.model2.status}</div>
        <div class="box-text">${result.model2.findings}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Regiones Detectadas</div>
    ${regionesHtml}
  </div>

  <div class="section">
    <div class="section-title">Recomendaciones</div>
    <ul>${recomendacionesHtml}</ul>
  </div>

  <div class="section">
    <div class="section-title">Interpretación Médica — Claude AI</div>
    ${explicacionHtml}
  </div>

  <footer>
    Este informe fue generado automáticamente por el sistema VARIME. No sustituye el juicio clínico del médico tratante.
  </footer>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Error", description: "Permite ventanas emergentes para descargar el informe.", variant: "destructive" });
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleSendToDoctor = () => {
    const fecha = new Date().toLocaleDateString("es-ES");
    const subject = encodeURIComponent(`Informe VARIME — Riesgo ${result.riskLevel.toUpperCase()} — ${fecha}`);
    const body = encodeURIComponent(
      `Estimado/a médico tratante,\n\nSe adjunta el resumen del análisis VARIME generado el ${fecha}.\n\n` +
      `NIVEL DE RIESGO: ${result.riskLevel.toUpperCase()} (${result.confidence}% confianza)\n\n` +
      `REGIONES DETECTADAS:\n${result.detectedRegions.join("\n")}\n\n` +
      `RECOMENDACIONES:\n${result.recommendations.join("\n")}\n\n` +
      `INTERPRETACIÓN IA:\n${explanation ?? "No disponible"}\n\n` +
      `— Sistema VARIME / VARIME`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const riskColor = {
    bajo: "text-green-600 border-green-400 bg-green-50",
    medio: "text-yellow-600 border-yellow-400 bg-yellow-50",
    alto: "text-red-600 border-red-400 bg-red-50",
  }[result.riskLevel] ?? "text-primary border-primary bg-primary-light";

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
              className={`text-lg px-4 py-2 border-2 font-semibold ${riskColor}`}
            >
              {result.riskLevel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <span>Nivel de confianza: {result.confidence}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Model Results */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{result.model1.name}</CardTitle>
            </div>
            <CardDescription>Estado: {result.model1.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{result.model1.findings}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{result.model2.name}</CardTitle>
            </div>
            <CardDescription>Estado: {result.model2.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{result.model2.findings}</p>
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
            {result.detectedRegions.map((region: string, index: number) => (
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
            {result.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Claude LLM Medical Explanation */}
      <Card className="shadow-card border-2 border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-medical shadow-sm">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">Informe Médico — Claude AI</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Análisis estructurado generado por inteligencia artificial
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingExplanation ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm">Generando informe médico con Claude AI...</span>
              <span className="text-xs text-muted-foreground/70">Esto puede tomar unos segundos</span>
            </div>
          ) : explanation ? (
            <MedicalMarkdown text={explanation} />
          ) : (
            <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm italic">No se pudo cargar la explicación médica.</p>
            </div>
          )}
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
        <Button variant="outline" onClick={handleSendToDoctor}>
          <FileText className="mr-2 h-4 w-4" />
          Enviar al Médico Tratante
        </Button>
      </div>
    </div>
  );
};

export default Results;
