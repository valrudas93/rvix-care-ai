-- =============================================================================
-- VARIME – Script de creación de base de datos PostgreSQL
-- Ejecutar en DBeaver conectado a: localhost:5432
-- =============================================================================

-- Crear la base de datos (ejecutar como superusuario si no existe)
-- CREATE DATABASE cervical_ai_db;
-- CREATE USER cerviai WITH PASSWORD 'cerviai';
-- GRANT ALL PRIVILEGES ON DATABASE cervical_ai_db TO cerviai;

-- Conectar a la base de datos: cervical_ai_db
-- \c cervical_ai_db

-- =============================================================================
-- TABLA: doctors
-- Médicos/usuarios del sistema
-- =============================================================================
CREATE TABLE IF NOT EXISTS doctors (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(120)    NOT NULL,
    email           VARCHAR(120)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    especialidad    VARCHAR(120)    NOT NULL,
    hospital        VARCHAR(200)    NOT NULL,
    fecha_creacion  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_doctors_id    ON doctors (id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_doctors_email ON doctors (email);

-- =============================================================================
-- TABLA: patients
-- Pacientes registrados por un doctor
-- =============================================================================
CREATE TABLE IF NOT EXISTS patients (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(120)    NOT NULL,
    edad                INTEGER         NOT NULL,
    identificacion      VARCHAR(60)     NOT NULL UNIQUE,
    fecha_registro      TIMESTAMP       NOT NULL DEFAULT NOW(),
    doctor_id           INTEGER         NOT NULL REFERENCES doctors(id),
    antecedentes        VARCHAR(2000),
    resultados_previos  VARCHAR(2000),
    tipo_muestra        VARCHAR(60)     -- 'citologia' | 'resonancia' | 'ambas'
);

CREATE INDEX IF NOT EXISTS ix_patients_id              ON patients (id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_patients_identificacion ON patients (identificacion);

-- =============================================================================
-- TABLA: image_studies
-- Imágenes cargadas para análisis
-- =============================================================================
CREATE TABLE IF NOT EXISTS image_studies (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER         NOT NULL REFERENCES patients(id),
    doctor_id       INTEGER         NOT NULL REFERENCES doctors(id),
    image_path      VARCHAR(500)    NOT NULL,
    fecha_estudio   TIMESTAMP       NOT NULL DEFAULT NOW(),
    tipo_estudio    VARCHAR(60)     NOT NULL,  -- 'citologia' | 'resonancia' | 'ambas'
    notas_medicas   TEXT
);

CREATE INDEX IF NOT EXISTS ix_image_studies_id ON image_studies (id);

-- =============================================================================
-- TABLA: predictions
-- Resultados de los modelos ViT por estudio
-- =============================================================================
CREATE TABLE IF NOT EXISTS predictions (
    id                   SERIAL PRIMARY KEY,
    study_id             INTEGER         NOT NULL REFERENCES image_studies(id),
    patient_id           INTEGER         NOT NULL REFERENCES patients(id),
    prediction           VARCHAR(60)     NOT NULL,  -- 'bajo_riesgo' | 'medio_riesgo' | 'alto_riesgo'
    confidence           DOUBLE PRECISION NOT NULL,
    detected_regions     JSON,
    recommendations      JSON,
    medical_explanation  TEXT,
    fecha_prediccion     TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_predictions_id ON predictions (id);

-- =============================================================================
-- TABLA: analysis_jobs
-- Jobs asíncronos del flujo /api/analyze (estado en memoria + persistencia)
-- =============================================================================
CREATE TABLE IF NOT EXISTS analysis_jobs (
    job_id              VARCHAR(64)     PRIMARY KEY,
    doctor_id           INTEGER         NOT NULL REFERENCES doctors(id),
    patient_id          INTEGER         NOT NULL REFERENCES patients(id),
    study_ids           JSON            NOT NULL,
    status              VARCHAR(20)     NOT NULL,  -- 'queued' | 'processing' | 'completed' | 'error'
    progress            DOUBLE PRECISION NOT NULL DEFAULT 0,
    current_step_index  INTEGER,
    result_payload      JSON,
    error               TEXT,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_analysis_jobs_job_id     ON analysis_jobs (job_id);
CREATE INDEX IF NOT EXISTS ix_analysis_jobs_doctor_id  ON analysis_jobs (doctor_id);
CREATE INDEX IF NOT EXISTS ix_analysis_jobs_patient_id ON analysis_jobs (patient_id);
CREATE INDEX IF NOT EXISTS ix_analysis_jobs_status     ON analysis_jobs (status);

-- =============================================================================
-- TABLA: alembic_version
-- Control de versiones de migraciones (gestionado por Alembic)
-- =============================================================================
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL PRIMARY KEY
);

-- Registrar la revisión inicial (solo si se crea desde cero)
INSERT INTO alembic_version (version_num)
VALUES ('4bd7db6b8325')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================
