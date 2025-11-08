import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, ImageIcon, Activity, History, LogOut, Brain, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated && location.pathname !== "/") {
      navigate("/");
    }
  }, [navigate, location]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const menuItems = [
    { title: "Panel Principal", icon: Home, path: "/dashboard" },
    { title: "Datos Clínicos", icon: FileText, path: "/clinical-data" },
    { title: "Cargar Imágenes", icon: ImageIcon, path: "/upload-images" },
    { title: "Resultados", icon: Activity, path: "/results" },
    { title: "Historial", icon: History, path: "/history" },
  ];

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-medical shadow-medical">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">CerviAI</h2>
            <p className="text-xs text-muted-foreground">Sistema de Diagnóstico</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-primary-light hover:text-primary transition-all"
            activeClassName="bg-primary-light text-primary font-medium shadow-sm"
            onClick={() => setOpen(false)}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  if (location.pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b border-border bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg gradient-medical">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold">CerviAI</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 h-screen sticky top-0">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
