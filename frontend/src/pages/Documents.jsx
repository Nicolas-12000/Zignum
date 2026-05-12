import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, UploadCloud, Search, Shield, Clock, X, Image, FileBarChart, TestTube2 } from 'lucide-react';
import MockBanner from '../components/MockBanner';
import { config } from '../config';
import './Documents.css';

const Documents = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('report');
  const [patientId, setPatientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

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

  const filtered = useMemo(() => documents.filter(d => {
    const matchesFilter = activeFilter === 'all' || d.type === activeFilter;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const docDate = new Date(d.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    const matchesDate = (!fromDate || docDate >= fromDate) && (!toDate || docDate <= toDate);
    return matchesFilter && matchesSearch && matchesDate;
  }), [documents, activeFilter, searchTerm, dateFrom, dateTo]);

  const apiBase = useMemo(() => config.apiUrl.replace(/\/$/, ''), []);

  const formatBytes = (bytes) => {
    if (bytes == null) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = Number(bytes);
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const getAuthHeaders = () => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }
    return headers;
  };

  const fetchDocuments = async () => {
    if (!apiBase) return;

    setIsLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (activeFilter !== 'all') params.set('doc_type', activeFilter);
    if (dateFrom) params.set('uploaded_from', dateFrom);
    if (dateTo) params.set('uploaded_to', dateTo);

    const url = `${apiBase}/records${params.toString() ? `?${params.toString()}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('No se pudo cargar la lista de documentos.');
      }

      const data = await response.json();
      const normalized = data.map((item) => ({
        id: item.document_id,
        name: item.file_name,
        type: item.doc_type,
        date: item.uploaded_at,
        size: formatBytes(item.file_size),
        expires: item.doc_type === 'diagnostic_image' ? '5 min' : '1 hora',
        patientId: item.patient_id,
        doctorId: item.doctor_id,
        s3Key: item.s3_key,
        mimeType: item.mime_type
      }));

      setDocuments(normalized);
    } catch (err) {
      setError(err.message || 'Error inesperado al cargar documentos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [apiBase, activeFilter, dateFrom, dateTo]);

  const handleDownload = async (documentId) => {
    if (!apiBase) return;

    setError('');
    try {
      const response = await fetch(`${apiBase}/documents/${documentId}/download-url`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('No se pudo generar la URL de descarga.');
      }

      const data = await response.json();
      if (data?.downloadUrl) {
        window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setError(err.message || 'Error al generar la URL de descarga.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !apiBase) return;

    if (user?.role === 'doctor' && !patientId) {
      setError('Debes indicar el ID del paciente.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const payload = {
        file_name: selectedFile.name,
        doc_type: selectedType
      };

      if (user?.role === 'doctor') {
        payload.patient_id = patientId;
      }

      const response = await fetch(`${apiBase}/documents`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('No se pudo generar la URL de subida.');
      }

      const data = await response.json();
      const uploadUrl = data?.upload_url;

      if (!uploadUrl) {
        throw new Error('La respuesta no contiene URL de subida.');
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type || 'application/octet-stream'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('No se pudo subir el archivo a S3.');
      }

      setShowUpload(false);
      setSelectedFile(null);
      setPatientId('');
      await fetchDocuments();
    } catch (err) {
      setError(err.message || 'Error al subir el documento.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="documents-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Documentos Médicos</h1>
          <p className="page-subtitle">Gestiona documentos protegidos con cifrado SSE-KMS.</p>
        </div>
        <div className="page-header-actions">
          <MockBanner label="Archivos simulados" />
          {user?.role === 'doctor' || user?.role === 'patient' ? (
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
              <UploadCloud size={18} /> Subir Documento
            </button>
          ) : null}
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

      {error && (
        <div className="card error-banner">
          <p>{error}</p>
        </div>
      )}

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
              <button
                className="btn-icon"
                title="Generar Presigned URL y descargar"
                onClick={() => handleDownload(doc.id)}
              >
                <Download size={18} />
              </button>
            </div>

            <div className="doc-icon-container">
              <div className="doc-icon-circle">
                {typeConfig[doc.type].icon}
              </div>
            </div>

            <h3 className="doc-name" title={doc.name}>{doc.name}</h3>
            {user?.role === 'doctor' && (
              <p className="doc-patient">Paciente: {doc.patientId}</p>
            )}

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

      {filtered.length === 0 && !isLoading && (
        <div className="empty-state">
          <FileText size={48} strokeWidth={1} />
          <h3>Sin resultados</h3>
          <p>No se encontraron documentos con ese filtro.</p>
        </div>
      )}

      {isLoading && (
        <div className="empty-state">
          <FileText size={48} strokeWidth={1} />
          <h3>Cargando documentos...</h3>
          <p>Espera un momento.</p>
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
              <input
                type="file"
                className="file-input-hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>

            {selectedFile && (
              <div className="selected-file">
                Archivo: <strong>{selectedFile.name}</strong>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Tipo de Documento</label>
              <select
                className="form-input"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="report">Informe Médico — URL expira en 1 hora</option>
                <option value="diagnostic_image">Imagen Diagnóstica — URL expira en 5 min</option>
                <option value="lab_result">Resultado de Laboratorio — URL expira en 1 hora</option>
              </select>
            </div>

            {user?.role === 'doctor' && (
              <div className="form-group">
                <label className="form-label">ID del Paciente</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="UUID del paciente"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </div>
            )}

            <div className="upload-info">
              <Shield size={14} />
              <span>El archivo será cifrado automáticamente con tu CMK de KMS antes de almacenarse en S3.</span>
            </div>

            <button
              className="btn btn-primary w-100"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? 'Subiendo...' : 'Subir y Cifrar con KMS'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
