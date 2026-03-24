import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, User } from "lucide-react";
import { createPatient, listPatients } from "@/lib/api";

const ClinicalData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    patientId: "",
    age: "",
    medicalHistory: "",
    previousResults: "",
    sampleType: "",
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const patients = await listPatients();
      let patient = patients.find((p) => p.identificacion === formData.patientId);

      if (!patient) {
        patient = await createPatient({
          nombre: formData.patientId,
          edad: Number(formData.age),
          identificacion: formData.patientId,
          antecedentes: formData.medicalHistory || undefined,
          resultados_previos: formData.previousResults || undefined,
          tipo_muestra: formData.sampleType || undefined,
        });
      }

      localStorage.setItem("activePatientId", String(patient.id));
      localStorage.setItem("activePatientIdentifier", patient.identificacion);

      toast({
        title: "Datos Guardados",
        description: "La información clínica se ha registrado correctamente.",
      });
      navigate("/upload-images");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el paciente",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Datos Clínicos</h1>
        <p className="text-muted-foreground">
          Ingrese la información del paciente para iniciar el análisis
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-light">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Información del Paciente</CardTitle>
                <CardDescription>Complete todos los campos requeridos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patientId">ID del Paciente *</Label>
                <Input
                  id="patientId"
                  placeholder="Ej: PAC-2025-001"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Edad *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Años"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampleType">Tipo de Muestra *</Label>
              <Select
                value={formData.sampleType}
                onValueChange={(value) => setFormData({ ...formData, sampleType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de muestra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citologia">Citología Cervical</SelectItem>
                  <SelectItem value="resonancia">Resonancia Magnética</SelectItem>
                  <SelectItem value="ambas">Ambas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Antecedentes Médicos</Label>
              <Textarea
                id="medicalHistory"
                placeholder="Ingrese antecedentes relevantes, cirugías previas, tratamientos, etc."
                className="min-h-[100px]"
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousResults">Resultados Previos</Label>
              <Textarea
                id="previousResults"
                placeholder="Resultados de análisis anteriores, biopsias, etc."
                className="min-h-[100px]"
                value={formData.previousResults}
                onChange={(e) => setFormData({ ...formData, previousResults: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-medical shadow-medical hover:opacity-90" disabled={saving}>
                Guardar y Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ClinicalData;
