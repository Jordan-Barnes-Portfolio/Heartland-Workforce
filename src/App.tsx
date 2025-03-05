import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { ProjectDocumentation } from '@/pages/ProjectDocumentation';
import { Metrics } from '@/pages/Metrics';
import { TimeCards } from '@/pages/metrics/TimeCards';
import { Archived } from '@/pages/metrics/Archived';
import { AIAssistant } from '@/pages/metrics/AIAssistant';
import Partners from '@/pages/Partners';
import { Referrals } from '@/pages/Referrals';
import { Wiki } from '@/pages/Wiki';
import { ClaimReadyPlus } from '@/pages/ClaimReadyPlus';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';
import { ProjectProvider } from '@/lib/project-context';
import { PartnerProvider } from '@/lib/partner-context';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProjectProvider>
          <PartnerProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/documentation" element={
                <ProtectedRoute>
                  <ProjectDocumentation />
                </ProtectedRoute>
              } />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/metrics/time-cards" element={<TimeCards />} />
              <Route path="/metrics/archived" element={<Archived />} />
              <Route path="/metrics/ai-assistant" element={<AIAssistant />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/wiki" element={<Wiki />} />
              <Route path="/claim-ready" element={<ClaimReadyPlus />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </PartnerProvider>
        </ProjectProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;