import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle2, Loader2 } from "lucide-react";

const Processing = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { name: "Preprocesamiento de imágenes", duration: 2000 },
    { name: "Modelo 1: Detección de lesiones tempranas", duration: 3000 },
    { name: "Modelo 2: Análisis de heterogeneidad tumoral", duration: 3000 },
    { name: "Generación de informe", duration: 2000 },
  ];

  useEffect(() => {
    let stepIndex = 0;
    let totalTime = 0;
    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);

    const processSteps = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        const stepDuration = steps[stepIndex].duration;
        
        const interval = setInterval(() => {
          totalTime += 100;
          setProgress((totalTime / totalDuration) * 100);
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          stepIndex++;
          if (stepIndex < steps.length) {
            processSteps();
          } else {
            setTimeout(() => navigate("/results"), 500);
          }
        }, stepDuration);
      }
    };

    processSteps();
  }, [navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8">
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
      </div>
    </div>
  );
};

export default Processing;
