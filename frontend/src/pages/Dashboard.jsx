import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, FolderOpen, Clock, Activity, ArrowUpRight } from 'lucide-react';
import MockBanner from '../components/MockBanner';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { icon: <FileText size={24} />, label: 'Documentos', value: '12', color: 'blue', trend: '+3 este mes' },
    { icon: <FolderOpen size={24} />, label: 'Expedientes', value: '4', color: 'green', trend: 'Todos activos' },
    { icon: <Clock size={24} />, label: 'URLs Activas', value: '2', color: 'yellow', trend: 'Expiran pronto' },
    { icon: <Activity size={24} />, label: 'Cifrado KMS', value: 'SSE-KMS', color: 'teal', trend: 'CMK Activa' },
  ];

  const recentActivity = [
    { action: 'Presigned URL generada', detail: 'Resonancia_Magnetica.jpg', time: 'Hace 10 minutos', color: 'green', expiry: '5 min' },
    { action: 'Documento subido', detail: 'Informe_Cardio.pdf', time: 'Ayer, 14:30', color: 'blue', expiry: null },
    { action: 'Expediente actualizado', detail: 'Paciente Juan Pérez', time: '10 May 2026, 09:15', color: 'yellow', expiry: null },
    { action: 'Acceso verificado', detail: 'JWT validado por Lambda Authorizer', time: '10 May 2026, 09:14', color: 'teal', expiry: null },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Bienvenido, {user?.name}
          </h1>
          <p className="page-subtitle">Resumen de tu actividad en la plataforma Zignum.</p>
        </div>
        <MockBanner label="Datos simulados para demostración" />
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div 
            key={stat.label} 
            className="stat-card card animate-fade-in" 
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="stat-card-top">
              <div className={`stat-icon ${stat.color}`}>
                {stat.icon}
              </div>
              <ArrowUpRight size={16} className="stat-arrow" />
            </div>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
            <span className="stat-trend">{stat.trend}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="card recent-activity animate-fade-in" style={{ animationDelay: '0.35s' }}>
          <div className="card-header">
            <h2 className="card-title">Actividad Reciente</h2>
            <span className="card-subtitle">Últimas operaciones</span>
          </div>
          <div className="activity-list">
            {recentActivity.map((item, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-dot ${item.color}`}></div>
                <div className="activity-details">
                  <p className="activity-action">{item.action}</p>
                  <p className="activity-detail">{item.detail}</p>
                  <span className="activity-time">{item.time}</span>
                </div>
                {item.expiry && (
                  <span className="activity-expiry">
                    <Clock size={12} /> {item.expiry}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-cards">
          <div className="card quick-actions animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="card-header">
              <h2 className="card-title">Acciones Rápidas</h2>
            </div>
            <div className="actions-list">
              <button className="action-btn">
                <div className="action-icon blue"><FileText size={20} /></div>
                <div>
                  <p className="action-name">Subir Documento</p>
                  <span className="action-desc">Cifrado automático con KMS</span>
                </div>
              </button>
              <button className="action-btn">
                <div className="action-icon green"><FolderOpen size={20} /></div>
                <div>
                  <p className="action-name">Ver Expedientes</p>
                  <span className="action-desc">Historiales clínicos</span>
                </div>
              </button>
            </div>
          </div>

          <div className="card system-status animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <div className="card-header">
              <h2 className="card-title">Estado del Sistema</h2>
            </div>
            <div className="status-list">
              <div className="status-row">
                <span>API Gateway</span>
                <span className="status-indicator online">Online</span>
              </div>
              <div className="status-row">
                <span>Lambda Functions</span>
                <span className="status-indicator online">Online</span>
              </div>
              <div className="status-row">
                <span>RDS PostgreSQL</span>
                <span className="status-indicator online">Online</span>
              </div>
              <div className="status-row">
                <span>S3 + KMS</span>
                <span className="status-indicator online">Cifrado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
