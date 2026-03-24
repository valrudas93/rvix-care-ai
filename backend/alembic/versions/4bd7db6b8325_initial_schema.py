"""initial_schema

Revision ID: 4bd7db6b8325
Revises:
Create Date: 2026-03-11 00:29:52.902458

Schema completo del sistema VARIME:
  - doctors
  - patients
  - image_studies
  - predictions
  - analysis_jobs
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '4bd7db6b8325'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── doctors ───────────────────────────────────────────────────────────────
    op.create_table(
        'doctors',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=120), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('especialidad', sa.String(length=120), nullable=False),
        sa.Column('hospital', sa.String(length=200), nullable=False),
        sa.Column('fecha_creacion', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_doctors_id', 'doctors', ['id'], unique=False)
    op.create_index('ix_doctors_email', 'doctors', ['email'], unique=True)

    # ── patients ──────────────────────────────────────────────────────────────
    op.create_table(
        'patients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=120), nullable=False),
        sa.Column('edad', sa.Integer(), nullable=False),
        sa.Column('identificacion', sa.String(length=60), nullable=False),
        sa.Column('fecha_registro', sa.DateTime(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('antecedentes', sa.String(length=2000), nullable=True),
        sa.Column('resultados_previos', sa.String(length=2000), nullable=True),
        sa.Column('tipo_muestra', sa.String(length=60), nullable=True),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_patients_id', 'patients', ['id'], unique=False)
    op.create_index('ix_patients_identificacion', 'patients', ['identificacion'], unique=True)

    # ── image_studies ─────────────────────────────────────────────────────────
    op.create_table(
        'image_studies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('image_path', sa.String(length=500), nullable=False),
        sa.Column('fecha_estudio', sa.DateTime(), nullable=False),
        sa.Column('tipo_estudio', sa.String(length=60), nullable=False),
        sa.Column('notas_medicas', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_image_studies_id', 'image_studies', ['id'], unique=False)

    # ── predictions ───────────────────────────────────────────────────────────
    op.create_table(
        'predictions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('study_id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('prediction', sa.String(length=60), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('detected_regions', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('recommendations', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('medical_explanation', sa.Text(), nullable=True),
        sa.Column('fecha_prediccion', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
        sa.ForeignKeyConstraint(['study_id'], ['image_studies.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_predictions_id', 'predictions', ['id'], unique=False)

    # ── analysis_jobs ─────────────────────────────────────────────────────────
    op.create_table(
        'analysis_jobs',
        sa.Column('job_id', sa.String(length=64), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('study_ids', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('progress', sa.Float(), nullable=False),
        sa.Column('current_step_index', sa.Integer(), nullable=True),
        sa.Column('result_payload', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
        sa.PrimaryKeyConstraint('job_id'),
    )
    op.create_index('ix_analysis_jobs_job_id', 'analysis_jobs', ['job_id'], unique=False)
    op.create_index('ix_analysis_jobs_doctor_id', 'analysis_jobs', ['doctor_id'], unique=False)
    op.create_index('ix_analysis_jobs_patient_id', 'analysis_jobs', ['patient_id'], unique=False)
    op.create_index('ix_analysis_jobs_status', 'analysis_jobs', ['status'], unique=False)


def downgrade() -> None:
    op.drop_table('analysis_jobs')
    op.drop_table('predictions')
    op.drop_table('image_studies')
    op.drop_table('patients')
    op.drop_table('doctors')
