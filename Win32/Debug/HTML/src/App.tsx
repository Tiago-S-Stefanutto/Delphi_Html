import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Elementos from "./pages/Elementos";
import Grupos from "./pages/Grupos";
import Periodos from "./pages/Periodos";
import Familias from "./pages/Familias";
import Categorias from "./pages/Categorias";
import ElementoForm from "./pages/ElementoForm";
import GrupoForm from "./pages/GrupoForm";
import PeriodoForm from "./pages/PeriodoForm";
import FamiliaForm from "./pages/FamiliaForm";
import CategoriaForm from "./pages/CategoriaForm";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Welcome} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/elementos"} component={Elementos} />
      <Route path={"/grupos"} component={Grupos} />
      <Route path={"/periodos"} component={Periodos} />
      <Route path={"/familias"} component={Familias} />
      <Route path={"/categorias"} component={Categorias} />
      <Route path={"/elemento-form"} component={ElementoForm} />
      <Route path={"/grupo-form"} component={GrupoForm} />
      <Route path={"/periodo-form"} component={PeriodoForm} />
      <Route path={"/familia-form"} component={FamiliaForm} />
      <Route path={"/categoria-form"} component={CategoriaForm} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
