-- =========================================================
-- MEDICAL DOCUMENT SYSTEM - DEFINITIVE POSTGRESQL SCHEMA
-- =========================================================
-- Compatible con:
-- - AWS Lambda
-- - API Gateway
-- - Cognito
-- - S3
-- - PostgreSQL únicamente
-- =========================================================

-- =========================================================
-- CLEAN PREVIOUS STRUCTURE
-- =========================================================

DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS shared_access CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

DROP TYPE IF EXISTS access_level CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;

-- =========================================================
-- EXTENSIONS
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- ENUMS
-- =========================================================

CREATE TYPE document_type AS ENUM (
    'diagnostic_image',
    'report',
    'lab_result'
);

CREATE TYPE access_level AS ENUM (
    'read',
    'write',
    'owner'
);

-- =========================================================
-- PATIENTS
-- =========================================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cognito_sub VARCHAR(255) UNIQUE NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    full_name VARCHAR(255) NOT NULL,

    date_of_birth DATE,

    national_id VARCHAR(50),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- DOCTORS
-- =========================================================

CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cognito_sub VARCHAR(255) UNIQUE NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    full_name VARCHAR(255) NOT NULL,

    license_number VARCHAR(100),

    specialty VARCHAR(100),

    verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- DOCUMENTS
-- =========================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL,

    doctor_id UUID,

    s3_key VARCHAR(500) NOT NULL,

    doc_type document_type NOT NULL,

    file_name VARCHAR(255) NOT NULL,

    file_size BIGINT NOT NULL,

    mime_type VARCHAR(100) NOT NULL,

    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_documents_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_documents_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE SET NULL
);

-- =========================================================
-- SHARED ACCESS
-- =========================================================

CREATE TABLE shared_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_id UUID NOT NULL,

    patient_id UUID NOT NULL,

    doctor_id UUID NOT NULL,

    access_type access_level NOT NULL DEFAULT 'read',

    expires_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_shared_document
        FOREIGN KEY (document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_shared_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_shared_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE
);

-- =========================================================
-- AUDIT LOG
-- =========================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    action VARCHAR(100) NOT NULL,

    user_sub VARCHAR(255) NOT NULL,

    document_id UUID,

    ip_address VARCHAR(45),

    user_agent TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_document
        FOREIGN KEY (document_id)
        REFERENCES documents(id)
        ON DELETE SET NULL
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_patients_cognito_sub
ON patients(cognito_sub);

CREATE INDEX idx_doctors_cognito_sub
ON doctors(cognito_sub);

CREATE INDEX idx_documents_patient_id
ON documents(patient_id);

CREATE INDEX idx_documents_doctor_id
ON documents(doctor_id);

CREATE INDEX idx_documents_uploaded_at
ON documents(uploaded_at);

CREATE INDEX idx_shared_document_id
ON shared_access(document_id);

CREATE INDEX idx_shared_doctor_id
ON shared_access(doctor_id);

CREATE INDEX idx_audit_document_id
ON audit_log(document_id);

CREATE INDEX idx_audit_user_sub
ON audit_log(user_sub);

-- =========================================================
-- VERIFY TABLES
-- =========================================================

\dt