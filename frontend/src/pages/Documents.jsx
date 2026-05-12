import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, UploadCloud, Search, Shield, Clock, X, Image, FileBarChart, TestTube2 } from 'lucide-react';
import MockBanner from '../components/MockBanner';
import './Documents.css';

const Documents = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const documents = [
    { id: '1', name: 'Resonancia_Magnetica_Cerebral.jpg', type: 'diagnostic_image', date: '2026-05-10', size: '4.2 MB', expires: '5 min', patient: 'Juan Pérez' },
    { id: '2', name: 'Informe_Cardiologia_Q2.pdf', type: 'report', date: '2026-05-09', size: '1.1 MB', expires: '1 hora', patient: 'María Gómez' },
    { id: '3', name: 'Hemograma_Completo.pdf', type: 'lab_result', date: '2026-05-05', size: '850 KB', expires: '1 hora', patient: 'Juan Pérez' },
    { id: '4', name: 'Radiografia_Torax_AP.jpg', type: 'diagnostic_image', date: '2026-05-02', size: '6.8 MB', expires: '5 min', patient: 'Carlos López' },
    { id: '5', name: 'Perfil_Lipidico.pdf', type: 'lab_result', date: '2026-04-28', size: '420 KB', expires: '1 hora', patient: 'María Gómez' },
    { id: '6', name: 'Informe_Neurologia.pdf', type: 'report', date: '2026-04-15', size: '2.3 MB', expires: '1 hora', patient: 'Juan Pérez' },
  ];

  const typeConfig = {
    diagnostic_image: { label: 'Imagen Diagnóstica', badge: 'badge-warning', icon: <Image size={20} /> },
    report: { label: 'Informe', badge: 'badge-primary', icon: <FileBarChart size={20} /> },
    lab_result: { label: 'Laboratorio', badge: 'badge-success', icon: <TestTube2 size={20} /> },
  };

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'diagnostic_image', label: 'Imágenes' },
    { key: 'report', label: 'Informes' },
    { key: 'lab_result', label: 'Laboratorio' },
  ];

  const filtered = documents.filter(d => {
    const matchesFilter = activeFilter === 'all' || d.type === activeFilter;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const docDate = new Date(d.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    const matchesDate = (!fromDate || docDate >= fromDate) && (!toDate || docDate <= toDate);
    return matchesFilter && matchesSearch && matchesDate;
  });

  return (
    <div className="documents-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Documentos Médicos</h1>
          <p className="page-subtitle">Gestiona documentos protegidos con cifrado SSE-KMS.</p>
        </div>
        <div className="page-header-actions">
          <MockBanner label="Archivos simulados" />
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
            <UploadCloud size={18} /> Subir Documento
          </button>
        </div>
      </div>

      <div className="card toolbar">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {filters.map(f => (
            <button 
              key={f.key}
              className={`filter-tab ${activeFilter === f.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="date-range">
          <input
            type="date"
            className="form-input date-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Fecha desde"
          />
          <span className="date-separator">a</span>
          <input
            type="date"
            className="form-input date-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Fecha hasta"
          />
        </div>
        <div className="security-badge">
          <Shield size={14} /> SSE-KMS Activo
        </div>
      </div>

      <div className="documents-grid">
        {filtered.map((doc, i) => (
          <div 
            key={doc.id} 
            className="card doc-card animate-fade-in" 
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="doc-card-header">
              <span className={`badge ${typeConfig[doc.type].badge}`}>
                {typeConfig[doc.type].label}
              </span>
              <button className="btn-icon" title="Generar Presigned URL y descargar">
                <Download size={18} />
              </button>
            </div>

            <div className="doc-icon-container">
              <div className="doc-icon-circle">
                {typeConfig[doc.type].icon}
              </div>
            </div>

            <h3 className="doc-name" title={doc.name}>{doc.name}</h3>
            <p className="doc-patient">{doc.patient}</p>

            <div className="doc-meta">
              <span>{doc.date}</span>
              <span>{doc.size}</span>
            </div>

            <div className={`doc-expiry ${doc.expires === '5 min' ? 'short' : ''}`}>
              <Clock size={13} />
              <span>URL expira en: <strong>{doc.expires}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <FileText size={48} strokeWidth={1} />
          <h3>Sin resultados</h3>
          <p>No se encontraron documentos con ese filtro.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal-content card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="card-title">Subir Documento</h2>
              <button className="btn-icon" onClick={() => setShowUpload(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="upload-zone">
              <UploadCloud size={40} color="var(--z-accent)" />
              <h3>Arrastra tu archivo aquí</h3>
              <p className="text-muted">o haz clic para seleccionar</p>
              <span className="upload-hint">PDF, JPG, PNG · Máx 25 MB</span>
              <input type="file" className="file-input-hidden" />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Documento</label>
              <select className="form-input">
                <option value="report">Informe Médico — URL expira en 1 hora</option>
                <option value="diagnostic_image">Imagen Diagnóstica — URL expira en 5 min</option>
                <option value="lab_result">Resultado de Laboratorio — URL expira en 1 hora</option>
              </select>
            </div>

            <div className="upload-info">
              <Shield size={14} />
              <span>El archivo será cifrado automáticamente con tu CMK de KMS antes de almacenarse en S3.</span>
            </div>

            <button className="btn btn-primary w-100" onClick={() => setShowUpload(false)}>
              Subir y Cifrar con KMS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
