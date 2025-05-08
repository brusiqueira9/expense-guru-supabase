import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { TransactionProvider } from "@/context/TransactionContext";
import { RootLayout } from "./components/layout/RootLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Charts from "./pages/Charts";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Wallets from "./pages/Wallets";
import { Auth } from "./components/Auth";
import { useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./components/ThemeProvider";
import { Register } from "./components/Register";
import TestPage from "./pages/TestPage";
import Logout from "./pages/Logout";
import { useNotifications } from "./hooks/useNotifications";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { Toaster } from './components/ui/toaster';

// Install jsPDF and jspdf-autotable
// <lov-add-dependency>jspdf@latest</lov-add-dependency>
// <lov-add-dependency>jspdf-autotable@latest</lov-add-dependency>

// Criando o contexto de autenticação
export const AuthContext = React.createContext<ReturnType<typeof useAuth> | undefined>(undefined);

// Componente para prover o contexto de autenticação
function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Componente para proteger rotas que requerem autenticação
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const auth = React.useContext(AuthContext);

  if (!auth?.user) {
    // Redirecionar para a página de login se não estiver autenticado
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Componente para gerenciar notificações
function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const auth = React.useContext(AuthContext);
  
  // Sempre chamamos o hook, mas ele só terá efeito se o usuário estiver autenticado
  useNotifications();
  
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <TransactionProvider>
            <NotificationsProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/register" element={<Register />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/logout" element={<Logout />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <RootLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="accounts" element={<Accounts />} />
                  <Route path="wallets" element={<Wallets />} />
                  <Route path="charts" element={<Charts />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
              {/* Componente de atalhos de teclado */}
              <KeyboardShortcuts />
            </NotificationsProvider>
          </TransactionProvider>
        </ThemeProvider>
      </AuthProvider>
      <Toaster />
    </Router>
  );
}

export default App;
