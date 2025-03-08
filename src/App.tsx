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
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/ThemeProvider";

// Install jsPDF and jspdf-autotable
// <lov-add-dependency>jspdf@latest</lov-add-dependency>
// <lov-add-dependency>jspdf-autotable@latest</lov-add-dependency>

// Criando o contexto de autenticação
export const AuthContext = React.createContext<ReturnType<typeof useAuth> | undefined>(undefined);

// Criando o provedor de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  
  if (auth.loading) {
    return <div>Carregando...</div>;
  }
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <TransactionProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
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
            <Toaster richColors position="top-right" />
          </TransactionProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
