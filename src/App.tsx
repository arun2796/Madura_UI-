import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import BindingAdvice from "./pages/BindingAdvice";
import JobCards from "./pages/JobCards";
import ProductionPlanning from "./pages/ProductionPlanning";
import Inventory from "./pages/Inventory";
import Dispatch from "./pages/Dispatch";
import Billing from "./pages/Billing";
import BindingAdviceForm from "./pages/BindingAdviceForm";
import Reports from "./pages/Reports";
import Masters from "./pages/Masters";
import Calculations from "./pages/Calculations";
import RawMaterials from "./pages/inventory/RawMaterials";
import FinishedProducts from "./pages/inventory/FinishedProducts";
import Payments from "./pages/billing/Payments";
import Teams from "./pages/masters/Teams";
import UserManagement from "./pages/system/UserManagement";
import RoleManagement from "./pages/system/RoleManagement";
import SystemSettings from "./pages/system/SystemSettings";
import ProductionStageFlow from "./pages/ProductionStageFlow";
import ProductionStageDemo from "./pages/ProductionStageDemo";
import ApiDiagnostics from "./pages/ApiDiagnostics";
import { AuthProvider } from "./context/AuthContext";
import { QueryProvider } from "./providers/QueryProvider";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

              <div className="flex">
                <Sidebar
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                />

                <main className="flex-1 transition-all duration-200 lg:ml-64">
                  <div className="p-6 pt-20 lg:pt-24">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route
                        path="/binding-advice"
                        element={<BindingAdvice />}
                      />
                      <Route
                        path="/binding-advice/create"
                        element={<BindingAdviceForm />}
                      />
                      <Route
                        path="/binding-advice/edit"
                        element={<BindingAdviceForm />}
                      />
                      <Route path="/job-cards" element={<JobCards />} />
                      <Route
                        path="/job-cards/:jobCardId/stages"
                        element={<ProductionStageFlow />}
                      />
                      <Route
                        path="/production-stage-demo"
                        element={<ProductionStageDemo />}
                      />
                      <Route
                        path="/api-diagnostics"
                        element={<ApiDiagnostics />}
                      />
                      <Route
                        path="/production-planning"
                        element={<ProductionPlanning />}
                      />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route
                        path="/inventory/raw-materials"
                        element={<RawMaterials />}
                      />
                      <Route
                        path="/inventory/finished-products"
                        element={<FinishedProducts />}
                      />
                      <Route path="/dispatch" element={<Dispatch />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/billing/payments" element={<Payments />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/calculations" element={<Calculations />} />
                      <Route path="/masters/*" element={<Masters />} />
                      <Route path="/masters/teams" element={<Teams />} />
                      <Route
                        path="/system/users"
                        element={<UserManagement />}
                      />
                      <Route
                        path="/system/roles"
                        element={<RoleManagement />}
                      />
                      <Route
                        path="/system/settings"
                        element={<SystemSettings />}
                      />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          </Router>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
