import { useEffect, useState } from "react";
import { Activity, FileText, TrendingUp, AlertCircle, CheckCircle2, Clock, Microscope } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getAnalysisHistory, HistoryItem } from "@/lib/api";

const riskBadgeClass: Record<string, string> = {
  alto: "bg-destructive/10 border-destructive/20 text-destructive",
  medio: "bg-yellow-50 border-yellow-200 text-yellow-700",
  bajo: "bg-primary-light border-primary/20 text-primary",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    getAnalysisHistory()
      .then(setHistory)
      .catch(() => {});
  }, []);

  const totalAnalyses = history.length;
  const activeCases = history.filter((h) => h.risk_level === "alto").length;
  const recentAlerts = history.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Panel Principal</h1>
          <p className="text-muted-foreground">
            Bienvenida al sistema de detección temprana de cáncer cervical
          </p>
        </div>
        <Button
          size="lg"
          className="gradient-medical shadow-medical hover:opacity-90 gap-2 whitespace-nowrap"
          onClick={() => navigate("/upload-images")}
        >
          <Microscope className="h-5 w-5" />
          Realizar Detección
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análisis Totales</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">Registros en el sistema</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Alto Riesgo</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases}</div>
            <p className="text-xs text-muted-foreground">Requieren seguimiento</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Detección</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">Precisión del modelo ViT</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="shadow-card hover:shadow-medical transition-all cursor-pointer"
          onClick={() => navigate("/clinical-data")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-light">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Registrar Paciente</CardTitle>
                <CardDescription>Ingresar información del paciente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Nuevo Registro
            </Button>
          </CardContent>
        </Card>

        <Card
          className="shadow-card hover:shadow-medical transition-all cursor-pointer"
          onClick={() => navigate("/upload-images")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-light">
                <Microscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Realizar Detección</CardTitle>
                <CardDescription>Citología y resonancia magnética</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Iniciar Análisis
            </Button>
          </CardContent>
        </Card>

        <Card
          className="shadow-card hover:shadow-medical transition-all cursor-pointer"
          onClick={() => navigate("/history")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-light">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Historial</CardTitle>
                <CardDescription>Ver análisis anteriores</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ver Registros
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Análisis Recientes</CardTitle>
          <CardDescription>Últimos resultados registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay análisis registrados aún.
            </p>
          ) : (
            recentAlerts.map((item) => (
              <div
                key={item.prediction_id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${riskBadgeClass[item.risk_level] ?? "bg-muted"}`}
              >
                {item.risk_level === "alto" ? (
                  <AlertCircle className="h-5 w-5 mt-0.5 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {item.risk_level === "alto"
                      ? "Nivel de Riesgo Alto Detectado"
                      : item.risk_level === "medio"
                      ? "Riesgo Moderado — Seguimiento recomendado"
                      : "Análisis Completado — Sin anomalías significativas"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Paciente ID: {item.patient_identifier} · {item.study_type} · {item.confidence}% confianza
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.date).toLocaleString("es-ES")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    item.risk_level === "alto"
                      ? "border-destructive text-destructive"
                      : item.risk_level === "medio"
                      ? "border-yellow-500 text-yellow-700"
                      : "border-primary text-primary"
                  }
                >
                  {item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
