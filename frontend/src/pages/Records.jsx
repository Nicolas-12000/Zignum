import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FolderOpen, Search, User, Calendar, ChevronDown, ChevronUp, FileText, Pill } from 'lucide-react';
import MockBanner from '../components/MockBanner';
import './Records.css';

const Records = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecord, setExpandedRecord] = useState(null);

  const records = [
    { 
      id: 'REC-1234', 
      patient: 'Juan Pérez', 
      nationalId: '10203040',
      dob: '1985-03-15',
      lastUpdate: '2026-05-10',
      doctor: 'Dr. García',
      specialty: 'Cardiología',
      status: 'active',
      notes: 'Paciente presenta evolución favorable post-cirugía. Se recomienda continuar con medicación actual y control en 15 días. Signos vitales estables.',
      documents: 4,
      diagnoses: ['Hipertensión arterial', 'Post-op bypass coronario']
    },
    { 
      id: 'REC-5678', 
      patient: 'María Gómez', 
      nationalId: '20304050',
      dob: '1990-07-22',
      lastUpdate: '2026-04-22',
      doctor: 'Dra. Martínez',
      specialty: 'Neurología',
      status: 'pending',
      notes: 'Pendiente resultados de laboratorio de perfil lipídico y electroencefalograma. Contactar a la paciente cuando estén disponibles.',
      documents: 2,
      diagnoses: ['Migraña crónica']
    },
    {
      id: 'REC-9012',
      patient: 'Carlos López',
      nationalId: '30405060',
      dob: '1978-11-03',
      lastUpdate: '2026-03-15',
      doctor: 'Dr. García',
      specialty: 'Cardiología',
      status: 'active',
      notes: 'Control rutinario. Niveles de colesterol en rango normal. Mantener tratamiento actual.',
      documents: 6,
      diagnoses: ['Dislipidemia', 'Diabetes tipo 2']
    }
  ];

  const toggleExpand = (id) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  };

  const filtered = records.filter(r =>
    r.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.nationalId.includes(searchTerm)
  );

  return (
    <div className="records-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Expedientes Clínicos</h1>
          <p className="page-subtitle">
            {user?.role === 'doctor' 
              ? 'Gestión de historiales de todos tus pacientes.' 
              : 'Tu historial médico e información clínica.'}
          </p>
        </div>
        <MockBanner label="Expedientes simulados" />
      </div>

      <div className="card toolbar">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder={user?.role === 'doctor' ? "Buscar paciente por nombre o ID..." : "Buscar expediente..."} 
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="records-count">
          {filtered.length} expediente{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="records-list">
        {filtered.map((record, i) => (
          <div 
            key={record.id} 
            className={`card record-card ${expandedRecord === record.id ? 'expanded' : ''} animate-fade-in`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="record-header" onClick={() => toggleExpand(record.id)}>
              <div className="record-main-info">
                <div className="record-avatar">
                  {record.patient.charAt(0)}
                </div>
                <div>
                  <h3 className="record-patient">{record.patient}</h3>
                  <div className="record-meta-inline">
                    <span className="record-id">ID: {record.nationalId}</span>
                    <span className="dot-sep">•</span>
                    <span className="record-date"><Calendar size={13}/> {record.lastUpdate}</span>
                    <span className="dot-sep">•</span>
                    <span><FileText size={13}/> {record.documents} docs</span>
                  </div>
                </div>
              </div>
              
              <div className="record-actions">
                <span className={`badge ${record.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {record.status === 'active' ? 'Activo' : 'Pendiente'}
                </span>
                <div className={`toggle-chevron ${expandedRecord === record.id ? 'open' : ''}`}>
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {expandedRecord === record.id && (
              <div className="record-details animate-fade-in">
                <div className="details-grid">
                  <div className="detail-group">
                    <label>Médico Tratante</label>
                    <p>{record.doctor}</p>
                  </div>
                  <div className="detail-group">
                    <label>Especialidad</label>
                    <p>{record.specialty}</p>
                  </div>
                  <div className="detail-group">
                    <label>Fecha de Nacimiento</label>
                    <p>{record.dob}</p>
                  </div>
                  <div className="detail-group">
                    <label>Documentos Asociados</label>
                    <p>{record.documents} archivos cifrados</p>
                  </div>
                </div>

                <div className="detail-group">
                  <label>Diagnósticos</label>
                  <div className="diagnoses-list">
                    {record.diagnoses.map((d, j) => (
                      <span key={j} className="diagnosis-tag">
                        <Pill size={12} /> {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detail-group notes">
                  <label>Última Evolución</label>
                  <div className="notes-box">
                    <p>{record.notes}</p>
                  </div>
                </div>

                {user?.role === 'doctor' && (
                  <div className="record-footer-actions">
                    <button className="btn btn-secondary">Ver Documentos</button>
                    <button className="btn btn-primary">Agregar Evolución</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <FolderOpen size={48} strokeWidth={1} />
          <h3>Sin resultados</h3>
          <p>No se encontraron expedientes con esa búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default Records;
