import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Stethoscope, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    // Patient specific
    nationalId: '',
    dateOfBirth: '',
    // Doctor specific
    license: '',
    specialty: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Connect to AWS Cognito sign-up
    setTimeout(() => {
      login({
        id: '123',
        name: formData.name,
        email: formData.email,
        role: role,
        token: 'mock-jwt-token'
      });
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="auth-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} /> Volver
      </Link>
      
      <div className="auth-container glass-panel animate-fade-in">
        <div className="auth-header">
          <h2>Crear Cuenta</h2>
          <p>Únete a la plataforma médica segura</p>
        </div>

        <div className="role-selector">
          <button 
            type="button"
            className={`role-btn ${role === 'patient' ? 'active' : ''}`}
            onClick={() => setRole('patient')}
          >
            <User size={24} />
            <span>Paciente</span>
          </button>
          <button 
            type="button"
            className={`role-btn ${role === 'doctor' ? 'active' : ''}`}
            onClick={() => setRole('doctor')}
          >
            <Stethoscope size={24} />
            <span>Médico</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Conditional Fields based on Role */}
          {role === 'patient' ? (
            <>
              <div className="form-group">
                <label className="form-label">Documento de Identidad</label>
                <input 
                  type="text" 
                  name="nationalId"
                  className="form-input" 
                  value={formData.nationalId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  name="dateOfBirth"
                  className="form-input" 
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Licencia Médica</label>
                <input 
                  type="text" 
                  name="license"
                  className="form-input" 
                  placeholder="Ej. COL-MED-12345"
                  value={formData.license}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Especialidad</label>
                <input 
                  type="text" 
                  name="specialty"
                  className="form-input" 
                  placeholder="Ej. Cardiología"
                  value={formData.specialty}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-4" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
