import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Stethoscope, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'amazon-cognito-identity-js';
import { config } from '../config';
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
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setError('');
    setNotice('');

    const poolId = role === 'doctor' ? config.cognito.doctorsPoolId : config.cognito.patientsPoolId;
    const clientId = role === 'doctor' ? config.cognito.doctorsClientId : config.cognito.patientsClientId;

    if (!poolId || !clientId) {
      setError('Cognito no esta configurado. Revisa los IDs del User Pool.');
      setIsLoading(false);
      return;
    }

    const userPool = new CognitoUserPool({ UserPoolId: poolId, ClientId: clientId });
    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: formData.email }),
      new CognitoUserAttribute({ Name: 'name', Value: formData.name }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: role })
    ];

    if (role === 'doctor') {
      attributes.push(new CognitoUserAttribute({ Name: 'custom:license', Value: formData.license }));
      attributes.push(new CognitoUserAttribute({ Name: 'custom:specialty', Value: formData.specialty }));
    } else {
      attributes.push(new CognitoUserAttribute({ Name: 'custom:national_id', Value: formData.nationalId }));
      attributes.push(new CognitoUserAttribute({ Name: 'custom:date_of_birth', Value: formData.dateOfBirth }));
    }

    userPool.signUp(formData.email, formData.password, attributes, null, (err, result) => {
      if (err) {
        setError(err.message || 'No se pudo registrar.');
        setIsLoading(false);
        return;
      }

      if (result?.userConfirmed) {
        const authDetails = new AuthenticationDetails({
          Username: formData.email,
          Password: formData.password
        });
        const cognitoUser = new CognitoUser({ Username: formData.email, Pool: userPool });

        cognitoUser.authenticateUser(authDetails, {
          onSuccess: (session) => {
            const idToken = session.getIdToken().getJwtToken();
            login({
              email: formData.email,
              role,
              token: idToken
            });
            navigate('/dashboard');
            setIsLoading(false);
          },
          onFailure: (authErr) => {
            setError(authErr?.message || 'Registro OK, pero no se pudo iniciar sesion.');
            setIsLoading(false);
          }
        });
      } else {
        setNotice('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
        setIsLoading(false);
      }
    });
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
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          {notice && (
            <div className="auth-notice">
              {notice}
            </div>
          )}
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
