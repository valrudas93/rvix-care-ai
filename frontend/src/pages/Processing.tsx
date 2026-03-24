import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getJobStatus, getJobResult } from "@/lib/api";

const Processing = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { name: "Preprocesamiento de imágenes", duration: 2000 },
    { name: "Modelo 1: Detección de lesiones tempranas", duration: 3000 },
    { name: "Modelo 2: Análisis de heterogeneidad tumoral", duration: 3000 },
    { name: "Generación de informe", duration: 2000 },
  ];

  const location = useLocation();
  const state = location.state as { jobId?: string } | null;
  const jobId = state?.jobId;

  useEffect(() => {
    if (!jobId) {
      setError("ID de trabajo no encontrado");
      const t = setTimeout(() => navigate("/dashboard"), 2000);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    
    const pollStatus = async () => {
      try {
        const data = await getJobStatus(jobId);
        if (cancelled) return;

        setProgress(data.progress ?? 0);
        if (data.current_step) {
          setCurrentStep(data.current_step.index ?? 0);
        }

        if (data.status === "completed") {
          const result = await getJobResult(jobId);
          if (cancelled) return;
          navigate("/results", { state: { result: result.result, jobId } });
        } else if (data.status === "error") {
          setError("Error durante el procesamiento");
        } else {
          // Continue polling
          setTimeout(pollStatus, 1000);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      }
    };

    pollStatus();

    return () => {
      cancelled = true;
    };
  }, [jobId, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8">
        {error ? (
          <>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold">Error en el Procesamiento</h1>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => navigate("/dashboard")}>
                Volver al Panel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-medical shadow-medical animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Procesando Análisis</h1>
              <p className="text-muted-foreground">
                Los modelos de inteligencia artificial están analizando las imágenes
              </p>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-center">Progreso del Análisis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Completado</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                        index < currentStep
                          ? "bg-primary-light"
                          : index === currentStep
                          ? "bg-primary-light border-2 border-primary"
                          : "bg-muted"
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      ) : index === currentStep ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-border flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          index <= currentStep ? "font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground pt-4">
                  <p>Por favor espere, este proceso puede tomar algunos minutos...</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Processing;
