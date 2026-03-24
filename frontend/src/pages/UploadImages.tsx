import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, ImageIcon, FileCheck, X, ArrowRight, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { uploadImagesForAnalysis } from "@/lib/api";

const UploadImages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [citologyFiles, setCitologyFiles] = useState<File[]>([]);
  const [mriFiles, setMriFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (files: FileList | null, type: "citology" | "mri") => {
    if (!files) return;
    const fileArray = Array.from(files);
    
    if (type === "citology") {
      setCitologyFiles([...citologyFiles, ...fileArray]);
    } else {
      setMriFiles([...mriFiles, ...fileArray]);
    }

    // Reset upload progress when new files are selected
    setUploadProgress(0);
  };

  const removeFile = (index: number, type: "citology" | "mri") => {
    if (type === "citology") {
      setCitologyFiles(citologyFiles.filter((_, i) => i !== index));
    } else {
      setMriFiles(mriFiles.filter((_, i) => i !== index));
    }
  };

  const handleProcess = async () => {
    if (citologyFiles.length === 0 && mriFiles.length === 0) {
      toast({
        title: "Error",
        description: "Debe cargar al menos una imagen antes de procesar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const activePatientId = localStorage.getItem("activePatientId");
      const parsedPatientId = activePatientId ? Number(activePatientId) : undefined;

      const response = await uploadImagesForAnalysis(citologyFiles, mriFiles, (progress) => {
        setUploadProgress(progress);
      }, parsedPatientId);

      toast({
        title: "Archivo enviado",
        description: "Las imágenes se están procesando...",
      });

      navigate("/processing", { state: { jobId: response.jobId } });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error subiendo archivos",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Realizar Detección de Cáncer</h1>
        <p className="text-muted-foreground">
          Suba las imágenes de citología cervical y/o resonancia magnética para análisis con IA
        </p>
      </div>

      {/* Citology Upload */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-light">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Imágenes de Citología Cervical</CardTitle>
              <CardDescription>Formatos aceptados: JPG, PNG, DICOM</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              id="citology-upload"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files, "citology")}
            />
            <label htmlFor="citology-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-primary" />
              <p className="font-medium">Haga clic para subir o arrastre aquí</p>
              <p className="text-sm text-muted-foreground">Puede seleccionar múltiples archivos</p>
            </label>
          </div>

          {citologyFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
              {citologyFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index, "citology")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MRI Upload */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-light">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Imágenes de Resonancia Magnética</CardTitle>
              <CardDescription>Formatos aceptados: JPG, PNG, DICOM, NIfTI</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              id="mri-upload"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files, "mri")}
            />
            <label htmlFor="mri-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-primary" />
              <p className="font-medium">Haga clic para subir o arrastre aquí</p>
              <p className="text-sm text-muted-foreground">Puede seleccionar múltiples archivos</p>
            </label>
          </div>

          {mriFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
              {mriFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index, "mri")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subiendo archivos...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/clinical-data")} disabled={isProcessing}>
          Volver
        </Button>
        <Button 
          onClick={handleProcess}
          className="gradient-medical shadow-medical hover:opacity-90"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Procesar con IA
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UploadImages;
