import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Lock, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login - in real app would validate credentials
    localStorage.setItem("isAuthenticated", "true");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-medical shadow-medical mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CerviAI</h1>
          <p className="text-muted-foreground">
            Detección Temprana con Inteligencia Artificial
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <a href="#" className="text-primary hover:underline font-medium">
                  ¿Olvidó su contraseña?
                </a>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full gradient-medical shadow-medical hover:opacity-90 transition-opacity"
                size="lg"
              >
                Iniciar Sesión
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Sistema de Diagnóstico Médico IA - 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
