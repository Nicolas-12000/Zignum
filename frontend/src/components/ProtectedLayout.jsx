import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  User, 
  LogOut, 
  Menu,
  X,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProtectedLayout.css';

const ProtectedLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Documentos', icon: <FileText size={20} />, path: '/documents' },
    { name: 'Expedientes', icon: <FolderOpen size={20} />, path: '/records' },
    { name: 'Perfil', icon: <User size={20} />, path: '/profile' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <Stethoscope className="logo-icon" size={24} />
            <h2>Zignum</h2>
          </div>
          <button className="close-sidebar btn-text d-md-none" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="topbar glass-panel">
          <button className="menu-btn btn-text d-md-none" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="topbar-right">
            <div className="user-info">
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className={`badge ${user?.role === 'doctor' ? 'badge-primary' : 'badge-success'}`}>
                {user?.role === 'doctor' ? 'Médico' : 'Paciente'}
              </span>
            </div>
            <div className="avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        <main className="content-area">
          <div className="page-transition animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
