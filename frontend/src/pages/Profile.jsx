import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, Mail, Stethoscope } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Mi Perfil</h1>
        <p className="page-subtitle">Información de tu cuenta y sesión activa.</p>
      </div>

      <div className="profile-content">
        <div className="card profile-main-card">
          <div className="profile-avatar-large">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="profile-name">{user?.name}</h2>
          <div className="profile-role-badge">
            <span className={`badge ${user?.role === 'doctor' ? 'badge-primary' : 'badge-success'}`}>
              {user?.role === 'doctor' ? 'Médico Especialista' : 'Paciente'}
            </span>
          </div>

          <div className="profile-details">
            <div className="profile-detail-item">
              <Mail size={18} className="detail-icon" />
              <div>
                <label>Correo Electrónico</label>
                <p>{user?.email}</p>
              </div>
            </div>
            
            {user?.role === 'doctor' && (
              <div className="profile-detail-item">
                <Stethoscope size={18} className="detail-icon" />
                <div>
                  <label>Licencia Médica</label>
                  <p>COL-MED-12345 (Verificada)</p>
                </div>
              </div>
            )}
            
            {user?.role === 'patient' && (
              <div className="profile-detail-item">
                <User size={18} className="detail-icon" />
                <div>
                  <label>Documento ID</label>
                  <p>10203040</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="card security-card">
            <div className="card-header">
              <h3 className="card-title flex-align">
                <Shield size={20} color="var(--z-accent)" /> 
                Seguridad de Cuenta
              </h3>
            </div>
            <div className="security-status">
              <div className="status-item">
                <div className="status-dot green"></div>
                <span>Sesión activa (JWT Válido)</span>
              </div>
              <div className="status-item">
                <div className="status-dot green"></div>
                <span>Autenticado vía Amazon Cognito</span>
              </div>
            </div>
            <button className="btn btn-secondary w-100 mt-4">Cambiar Contraseña</button>
          </div>

          <div className="card jwt-card">
            <div className="card-header">
              <h3 className="card-title flex-align">
                <Key size={20} color="var(--z-secondary)" />
                JWT Claims (Simulado)
              </h3>
            </div>
            <div className="code-block">
              <pre>
{JSON.stringify({
  sub: "a1b2c3d4-...",
  email: user?.email,
  "custom:role": user?.role,
  ...(user?.role === 'doctor' && { "custom:license": "COL-MED-12345" }),
  iss: "https://cognito-idp..."
}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
