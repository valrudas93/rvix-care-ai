import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Brain, Lock, Mail, User, Building2, Stethoscope } from "lucide-react";
import { login as loginApi, register as registerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  /* ── Estado login ── */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  /* ── Estado registro ── */
  const [regNombre, setRegNombre] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regEspecialidad, setRegEspecialidad] = useState("");
  const [regHospital, setRegHospital] = useState("");

  /* Guarda el token y redirige al dashboard */
  const persistSession = (token: string, nombre: string) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("authToken", token);
    localStorage.setItem("doctorName", nombre);
    navigate("/dashboard");
  };

  /* ── Handlers ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginApi(loginEmail, loginPassword);
      persistSession(result.access_token, result.nombre);
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : "No se pudo iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Verifique que ambas contraseñas sean iguales",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const result = await registerApi({
        nombre: regNombre,
        email: regEmail,
        password: regPassword,
        especialidad: regEspecialidad,
        hospital: regHospital,
      });
      toast({ title: "Cuenta creada", description: `Bienvenido/a, ${result.nombre}` });
      persistSession(result.access_token, result.nombre);
    } catch (error) {
      toast({
        title: "Error al registrarse",
        description: error instanceof Error ? error.message : "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-medical shadow-medical mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">VARIME</h1>
          <p className="text-muted-foreground">Detección Temprana con Inteligencia Artificial</p>
        </div>

        {/* Tabs login / registro */}
        <div className="flex rounded-xl border border-border bg-muted p-1">
          {(["login", "register"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMode(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all
                ${mode === tab
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>

        {/* ── FORMULARIO LOGIN ── */}
        {mode === "login" && (
          <Card className="shadow-card border-border/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold">Bienvenido/a</CardTitle>
              <CardDescription>Ingrese sus credenciales para acceder al sistema</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="correo@hospital.com"
                      className="pl-10"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full gradient-medical shadow-medical hover:opacity-90 transition-opacity"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Ingresando..." : "Iniciar sesión"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  ¿No tiene cuenta?{" "}
                  <button
                    type="button"
                    className="text-primary font-medium hover:underline"
                    onClick={() => setMode("register")}
                  >
                    Regístrese aquí
                  </button>
                </p>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* ── FORMULARIO REGISTRO ── */}
        {mode === "register" && (
          <Card className="shadow-card border-border/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold">Crear cuenta de médico</CardTitle>
              <CardDescription>Complete sus datos profesionales</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">

                {/* Nombre completo */}
                <div className="space-y-2">
                  <Label htmlFor="reg-nombre">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-nombre"
                      type="text"
                      placeholder="Dr. María García"
                      className="pl-10"
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="correo@hospital.com"
                      className="pl-10"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Especialidad y hospital en fila */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="reg-especialidad">Especialidad</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-especialidad"
                        type="text"
                        placeholder="Oncología"
                        className="pl-10"
                        value={regEspecialidad}
                        onChange={(e) => setRegEspecialidad(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-hospital">Hospital / Centro</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-hospital"
                        type="text"
                        placeholder="Hospital X"
                        className="pl-10"
                        value={regHospital}
                        onChange={(e) => setRegHospital(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      className="pl-10"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="Repita la contraseña"
                      className="pl-10"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      required
                    />
                  </div>
                  {regConfirm && regPassword !== regConfirm && (
                    <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                  )}
                </div>

              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full gradient-medical shadow-medical hover:opacity-90 transition-opacity"
                  size="lg"
                  disabled={loading || (!!regConfirm && regPassword !== regConfirm)}
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  ¿Ya tiene cuenta?{" "}
                  <button
                    type="button"
                    className="text-primary font-medium hover:underline"
                    onClick={() => setMode("login")}
                  >
                    Inicie sesión
                  </button>
                </p>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Sistema de Diagnóstico Médico IA — 2025
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
