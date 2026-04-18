import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import Results from "./pages/Results.tsx";
import Roadmap from "./pages/Roadmap.tsx";
import VirtualHRComments from "./pages/VirtualHRComments.tsx";
import ResumeJDRoadmap from "./pages/ResumeJDRoadmap.tsx";
import TailoredEmail from "./pages/TailoredEmail.tsx";
import JobSuggestions from "./pages/JobSuggestions.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

// Component to handle auth-based routing
const AuthenticatedRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={currentUser ? <Navigate to="/dashboard" /> : <Index />} 
      />
      <Route 
        path="/auth" 
        element={currentUser ? <Navigate to="/dashboard" /> : <AuthPage />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/results" 
        element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/roadmap" 
        element={
          <ProtectedRoute>
            <Roadmap />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/virtual-hr" 
        element={
          <ProtectedRoute>
            <VirtualHRComments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/match-roadmap" 
        element={
          <ProtectedRoute>
            <ResumeJDRoadmap />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tailored-email" 
        element={
          <ProtectedRoute>
            <TailoredEmail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/job-suggestions" 
        element={
          <ProtectedRoute>
            <JobSuggestions />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AuthenticatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
