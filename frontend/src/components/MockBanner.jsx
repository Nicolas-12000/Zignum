import React from 'react';
import { FlaskConical } from 'lucide-react';
import './MockBanner.css';

const MockBanner = ({ label = 'Datos de demostración' }) => (
  <div className="mock-banner">
    <FlaskConical size={14} />
    <span>MOCK DATA</span>
    <span className="mock-separator">—</span>
    <span className="mock-label">{label}</span>
  </div>
);

export default MockBanner;
