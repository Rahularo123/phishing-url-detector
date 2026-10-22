import { useAuth } from '../context/AuthContext';
import { ShieldCheck, History, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => setActiveTab('scanner')}>
        <div className="brand-icon">
          <ShieldCheck size={28} />
        </div>
        <div className="brand-text">
          <span className="brand-title">PHISHGUARD</span>
          <span className="brand-tag">AI Threat Intelligence</span>
        </div>
      </div>

      <nav className="navbar-nav">
        <button
          className={`nav-tab ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          <ShieldCheck size={18} />
          <span>Scanner</span>
        </button>

        {isAuthenticated && (
          <>
            <button
              className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={18} />
              <span>History</span>
            </button>

            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
          </>
        )}
      </nav>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <div className="user-profile">
            <div className="user-badge">
              <User size={16} />
              <span className="user-name">{user?.name || 'User'}</span>
            </div>
            <button className="logout-btn" onClick={logout} title="Sign Out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button className="signin-btn" onClick={onOpenAuth}>
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}