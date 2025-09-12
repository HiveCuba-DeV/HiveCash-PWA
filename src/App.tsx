import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { CacheProvider } from './contexts/CacheContext';

// Pages
import { SplashScreen } from './pages/SplashScreen';
import { Onboarding } from './pages/Onboarding';
import { Unlock } from './pages/Unlock';
import { Home } from './pages/Home';
import { Receive } from './pages/Receive';
import { Send } from './pages/Send';
import { ReceiveOffline } from './pages/ReceiveOffline';
import { ReceiveOnchain } from './pages/ReceiveOnchain';
import { SendOffline } from './pages/SendOffline';
import { SendOnchain } from './pages/SendOnchain';
import { History } from './pages/History';
import { About } from './pages/About';

// Route Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isUnlocked } = useAuth();
  return isUnlocked ? <>{children}</> : <Navigate to="/unlock" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/unlock" element={<Unlock />} />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/receive"
        element={
          <ProtectedRoute>
            <Receive />
          </ProtectedRoute>
        }
      />

      <Route
        path="/send"
        element={
          <ProtectedRoute>
            <Send />
          </ProtectedRoute>
        }
      />

      <Route
        path="/receive/offline"
        element={
          <ProtectedRoute>
            <ReceiveOffline />
          </ProtectedRoute>
        }
      />

      <Route
        path="/receive/onchain"
        element={
          <ProtectedRoute>
            <ReceiveOnchain />
          </ProtectedRoute>
        }
      />

      <Route
        path="/send/offline"
        element={
          <ProtectedRoute>
            <SendOffline />
          </ProtectedRoute>
        }
      />

      <Route
        path="/send/onchain"
        element={
          <ProtectedRoute>
            <SendOnchain />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  // Register service worker
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <AuthProvider>
      <WalletProvider>
        <CacheProvider>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </CacheProvider>
      </WalletProvider>
    </AuthProvider>
  );
};

export default App;
