import { Activity, FileText, ImageIcon, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Panel Principal</h1>
        <p className="text-muted-foreground">
          Bienvenida al sistema de detección temprana de cáncer cervical
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análisis Totales</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+12%</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Activos</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Pendientes de revisión
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Detección</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">
              Precisión del modelo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-card hover:shadow-medical transition-all cursor-pointer" onClick={() => navigate("/clinical-data")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-light">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Datos Clínicos</CardTitle>
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

        <Card className="shadow-card hover:shadow-medical transition-all cursor-pointer" onClick={() => navigate("/upload-images")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-light">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Subir Imágenes</CardTitle>
                <CardDescription>Citología y resonancia magnética</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Cargar Archivos
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-medical transition-all cursor-pointer" onClick={() => navigate("/history")}>
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
          <CardTitle>Alertas Recientes</CardTitle>
          <CardDescription>Resultados que requieren atención</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Nivel de Riesgo Alto Detectado</p>
              <p className="text-sm text-muted-foreground">Paciente ID: 1847 - Requiere seguimiento inmediato</p>
              <p className="text-xs text-muted-foreground mt-1">Hace 2 horas</p>
            </div>
            <Badge variant="destructive">Alto</Badge>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-light border border-primary/20">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Análisis Completado</p>
              <p className="text-sm text-muted-foreground">Paciente ID: 1845 - Sin anomalías detectadas</p>
              <p className="text-xs text-muted-foreground mt-1">Hace 4 horas</p>
            </div>
            <Badge variant="outline" className="border-primary text-primary">Normal</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
