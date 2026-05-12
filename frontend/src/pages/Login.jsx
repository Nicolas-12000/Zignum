import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, ArrowLeft, KeyRound } from 'lucide-react';
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { config } from '../config';
import './Auth.css'; // Shared between Login and Register

const Login = () => {
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [cognitoUserObj, setCognitoUserObj] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (session) => {
    const idToken = session.getIdToken().getJwtToken();
    login({
      email,
      role,
      token: idToken
    });
    navigate('/dashboard');
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const poolId = role === 'doctor' ? config.cognito.doctorsPoolId : config.cognito.patientsPoolId;
    const clientId = role === 'doctor' ? config.cognito.doctorsClientId : config.cognito.patientsClientId;

    if (!poolId || !clientId) {
      setError('Cognito no está configurado. Revisa los IDs del User Pool.');
      setIsLoading(false);
      return;
    }

    const userPool = new CognitoUserPool({ UserPoolId: poolId, ClientId: clientId });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: handleLoginSuccess,
      onFailure: (err) => {
        setError(err?.message || 'No se pudo iniciar sesión.');
        setIsLoading(false);
      },
      newPasswordRequired: () => {
        // User was created by admin and needs to change password
        setNeedsNewPassword(true);
        setCognitoUserObj(cognitoUser);
        setIsLoading(false);
        // We delete the temporary password from state for security
        setPassword('');
      }
    });
  };

  const handleNewPasswordSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!cognitoUserObj) {
      setError('Error en la sesión. Por favor intenta de nuevo.');
      setIsLoading(false);
      return;
    }

    cognitoUserObj.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: handleLoginSuccess,
      onFailure: (err) => {
        setError(err?.message || 'No se pudo actualizar la contraseña.');
        setIsLoading(false);
      }
    });
  };

  if (needsNewPassword) {
    return (
      <div className="auth-page">
        <div className="auth-container glass-panel animate-fade-in">
          <div className="auth-header">
            <div className="auth-icon-circle">
              <KeyRound size={32} />
            </div>
            <h2>Nueva Contraseña</h2>
            <p>Es tu primer ingreso. Por favor define una contraseña permanente.</p>
          </div>

          <form onSubmit={handleNewPasswordSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="form-help">Mínimo 8 caracteres, debe incluir números y letras.</p>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-4" disabled={isLoading}>
              {isLoading ? 'Actualizando...' : 'Confirmar Contraseña'}
            </button>

            <button 
              type="button" 
              className="btn btn-ghost w-100 mt-2" 
              onClick={() => {
                setNeedsNewPassword(false);
                setCognitoUserObj(null);
                setNewPassword('');
              }}
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} /> Volver
      </Link>
      
      <div className="auth-container glass-panel animate-fade-in">
        <div className="auth-header">
          <h2>Iniciar Sesión</h2>
          <p>Bienvenido de nuevo a Zignum</p>
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
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-4" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

