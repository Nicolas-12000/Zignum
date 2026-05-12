import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, Activity, ArrowRight, Server, Users, Zap } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo">
          <Activity color="var(--z-accent)" size={28} />
          <span>Zignum</span>
        </div>
        <nav className="landing-nav">
          <Link to="/login" className="btn btn-secondary">Iniciar Sesión</Link>
          <Link to="/register" className="btn btn-primary">Registrarse</Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              <Shield size={14} />
              <span>Plataforma Segura — Cifrado SSE-KMS</span>
            </div>
            <h1 className="hero-title">Expedientes clínicos seguros en la nube</h1>
            <p className="hero-subtitle">
              Telemedicina de próxima generación con aislamiento de red completo, 
              cifrado en reposo con claves gestionadas por el cliente, y control 
              de acceso basado en roles JWT.
            </p>
            <div className="hero-ctas">
              <Link to="/register" className="btn btn-primary btn-lg">
                Comenzar Ahora <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Iniciar Sesión</Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glass-panel mockup-card">
              <div className="mockup-header">
                <div className="dots"><span></span><span></span><span></span></div>
                <span className="mockup-title">Dashboard — Zignum</span>
              </div>
              <div className="mockup-body">
                <div className="mockup-stats">
                  <div className="mockup-stat"><span className="ms-value">12</span><span className="ms-label">Docs</span></div>
                  <div className="mockup-stat"><span className="ms-value">4</span><span className="ms-label">Exp</span></div>
                  <div className="mockup-stat accent"><span className="ms-value">KMS</span><span className="ms-label">Activo</span></div>
                </div>
                <div className="mockup-rows">
                  <div className="mockup-row"><div className="mr-dot"></div><div className="mr-line"></div><div className="mr-badge">5 min</div></div>
                  <div className="mockup-row"><div className="mr-dot blue"></div><div className="mr-line long"></div><div className="mr-badge green">1 hr</div></div>
                  <div className="mockup-row"><div className="mr-dot yellow"></div><div className="mr-line"></div><div className="mr-badge">1 hr</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-heading">
            <h2>Arquitectura Serverless en AWS</h2>
            <p>Cada componente diseñado para máxima seguridad y cero costo operativo.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Lock size={28} /></div>
              <h3>Cifrado KMS (CMK)</h3>
              <p>Documentos cifrados con claves gestionadas por el cliente. Key Policy con deny explícito — solo Lambda tiene acceso.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Users size={28} /></div>
              <h3>Cognito Dual Pool</h3>
              <p>Dos User Pools separados con atributos custom distintos. JWT enriquecido dinámicamente con Lambda Triggers.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Zap size={28} /></div>
              <h3>Presigned URLs</h3>
              <p>Acceso temporal a documentos con expiración dinámica — 5 minutos para imágenes, 1 hora para informes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Server size={28} /></div>
              <h3>VPC Aislada</h3>
              <p>RDS y Lambdas en subredes privadas. VPC Endpoints sustituyen NAT Gateway — tráfico nunca sale de AWS.</p>
            </div>
          </div>
        </section>

        <section className="stack-section">
          <div className="stack-grid">
            {['Lambda', 'API Gateway', 'Cognito', 'S3', 'RDS', 'CloudFront', 'KMS', 'CloudWatch'].map(s => (
              <div key={s} className="stack-chip">{s}</div>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="landing-footer">
        <p>Zignum — Proyecto de Cloud Computing. AWS Free Tier.</p>
      </footer>
    </div>
  );
};

export default Landing;
