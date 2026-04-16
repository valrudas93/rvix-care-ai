// API Configuration and client functions

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  doctor_id: number;
  nombre: string;
}

export interface PatientCreateRequest {
  nombre: string;
  edad: number;
  identificacion: string;
  antecedentes?: string;
  resultados_previos?: string;
  tipo_muestra?: string;
}

export interface PatientResponse {
  id: number;
  nombre: string;
  edad: number;
  identificacion: string;
  fecha_registro: string;
  doctor_id: number;
  antecedentes?: string;
  resultados_previos?: string;
  tipo_muestra?: string;
}

export interface HistoryItem {
  prediction_id: number;
  patient_id: number;
  patient_identifier: string;
  study_type: string;
  risk_level: 'bajo' | 'medio' | 'alto' | string;
  confidence: number;
  date: string;
  detected_regions: string[];
  recommendations: string[];
  medical_explanation: string | null;
}

function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

function buildAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function handleUnauthorized(): never {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('doctorName');
  localStorage.removeItem('activePatientId');
  window.location.href = '/login';
  throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
}

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) handleUnauthorized();
  return res;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  especialidad: string;
  hospital: string;
}

export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'No se pudo crear la cuenta');
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Credenciales inválidas');
  }

  return response.json();
}

export async function listPatients(): Promise<PatientResponse[]> {
  const response = await apiFetch(`${API_BASE_URL}/patients`, {
    headers: buildAuthHeaders(),
  });
  if (!response.ok) throw new Error('No se pudo obtener la lista de pacientes');
  return response.json();
}

export async function createPatient(data: PatientCreateRequest): Promise<PatientResponse> {
  const response = await apiFetch(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('No se pudo crear el paciente');
  return response.json();
}

export async function explainPrediction(
  prediction: string,
  confidence: number,
  detectedRegions?: string[],
  recommendations?: string[],
  model1Findings?: string,
  model2Findings?: string,
  clinicalData?: Record<string, unknown>,
): Promise<string> {
  const response = await apiFetch(`${API_BASE_URL}/llm/explain-prediction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
    body: JSON.stringify({
      prediction,
      confidence: confidence / 100,
      detected_regions: detectedRegions ?? null,
      recommendations: recommendations ?? null,
      model1_findings: model1Findings ?? null,
      model2_findings: model2Findings ?? null,
      clinical_data: clinicalData ?? null,
    }),
  });
  if (!response.ok) throw new Error('No se pudo generar la explicación médica');
  const data = await response.json();
  return data.medical_explanation as string;
}

export async function getAnalysisHistory(): Promise<HistoryItem[]> {
  const response = await apiFetch(`${API_BASE_URL}/api/history`, {
    headers: buildAuthHeaders(),
  });
  if (!response.ok) throw new Error('No se pudo obtener el historial');
  return response.json();
}

export interface AnalysisResult {
  riskLevel: string;
  confidence: number;
  detectedRegions: string[];
  recommendations: string[];
  model1: {
    name: string;
    status: string;
    findings: string;
  };
  model2: {
    name: string;
    status: string;
    findings: string;
  };
  medical_explanation?: string | null;
}

export interface JobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  current_step?: {
    index: number;
    name: string;
  };
}

export interface JobResult {
  status: string;
  progress?: number;
  result?: AnalysisResult;
}

/**
 * Upload images for analysis
 * @param citologyFiles - Array of citology image files
 * @param mriFiles - Array of MRI image files
 * @param onProgressCallback - Callback for upload progress (0-100)
 * @returns Promise with jobId
 */
export async function uploadImagesForAnalysis(
  citologyFiles: File[],
  mriFiles: File[],
  onProgressCallback?: (progress: number) => void,
  patientId?: number,
): Promise<{ jobId: string }> {
  const formData = new FormData();

  // Add citology files
  citologyFiles.forEach((file) => {
    formData.append('citology', file);
  });

  // Add MRI files
  mriFiles.forEach((file) => {
    formData.append('mri', file);
  });

  if (patientId) {
    formData.append('patient_id', String(patientId));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgressCallback) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgressCallback(percentComplete);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('POST', `${API_BASE_URL}/api/analyze`);
    const token = getAuthToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  });
}

/**
 * Get the status of an ongoing analysis
 * @param jobId - The job ID returned from uploadImagesForAnalysis
 * @returns Promise with job status
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await apiFetch(`${API_BASE_URL}/api/status/${jobId}`, {
    headers: buildAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to get job status: ${response.statusText}`);
  return response.json();
}

/**
 * Get the results of a completed analysis
 * @param jobId - The job ID returned from uploadImagesForAnalysis
 * @returns Promise with job result
 */
export async function getJobResult(jobId: string): Promise<JobResult> {
  const response = await apiFetch(`${API_BASE_URL}/api/results/${jobId}`, {
    headers: buildAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to get job results: ${response.statusText}`);
  return response.json();
}

/**
 * Utility function to wait for job completion with polling
 * @param jobId - The job ID
 * @param pollInterval - Interval in ms between status checks (default: 1000)
 * @param maxWaitTime - Maximum wait time in ms (default: no limit)
 * @returns Promise that resolves when job is completed
 */
export async function waitForJobCompletion(
  jobId: string,
  pollInterval: number = 1000,
  maxWaitTime?: number
): Promise<AnalysisResult> {
  const startTime = Date.now();

  const poll = async (): Promise<AnalysisResult> => {
    if (maxWaitTime && Date.now() - startTime > maxWaitTime) {
      throw new Error('Job completion wait timeout');
    }

    const status = await getJobStatus(jobId);

    if (status.status === 'completed') {
      const result = await getJobResult(jobId);
      if (result.result) {
        return result.result;
      }
      throw new Error('No result returned from completed job');
    }

    if (status.status === 'error') {
      throw new Error('Job processing error');
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    return poll();
  };

  return poll();
}
