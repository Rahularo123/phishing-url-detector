import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Scanner from './components/Scanner';
import History from './components/History';
import Dashboard from './components/Dashboard';
import './App.css';

function MainApp() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="app-root">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="main-content">
        {activeTab === 'scanner' && (
          <Scanner onOpenAuth={() => setIsAuthOpen(true)} />
        )}
        {activeTab === 'history' && (
          <History onNavigateToScanner={() => setActiveTab('scanner')} />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard onNavigateToScanner={() => setActiveTab('scanner')} />
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}