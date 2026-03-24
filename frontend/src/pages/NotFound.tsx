import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-soft p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-light mb-4">
          <AlertCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Página No Encontrada</h2>
        <p className="text-muted-foreground">
          La página que busca no existe o ha sido movida.
        </p>
        <Button 
          onClick={() => window.location.href = "/dashboard"} 
          className="gradient-medical shadow-medical hover:opacity-90"
        >
          <Home className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
