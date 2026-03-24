import { useState, useCallback } from 'react';
import { 
  uploadImagesForAnalysis, 
  getJobStatus, 
  getJobResult,
  AnalysisResult,
  JobStatus,
  JobResult
} from '@/lib/api';

export interface UseAnalysisState {
  jobId: string | null;
  status: JobStatus | null;
  result: AnalysisResult | null;
  loading: boolean;
  error: Error | null;
  uploadProgress: number;
}

/**
 * Hook for managing image analysis workflow
 */
export function useAnalysis() {
  const [state, setState] = useState<UseAnalysisState>({
    jobId: null,
    status: null,
    result: null,
    loading: false,
    error: null,
    uploadProgress: 0,
  });

  const uploadImages = useCallback(
    async (citologyFiles: File[], mriFiles: File[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null, uploadProgress: 0 }));
      try {
        const response = await uploadImagesForAnalysis(
          citologyFiles,
          mriFiles,
          (progress) => {
            setState((prev) => ({ ...prev, uploadProgress: progress }));
          }
        );
        setState((prev) => ({
          ...prev,
          jobId: response.jobId,
          loading: false,
        }));
        return response.jobId;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Unknown error'),
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  const fetchStatus = useCallback(async (jobId: string) => {
    try {
      const status = await getJobStatus(jobId);
      setState((prev) => ({ ...prev, status, jobId }));
      return status;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }));
      throw error;
    }
  }, []);

  const fetchResult = useCallback(async (jobId: string) => {
    try {
      const result = await getJobResult(jobId);
      setState((prev) => ({
        ...prev,
        result: result.result || null,
        jobId,
      }));
      return result;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      jobId: null,
      status: null,
      result: null,
      loading: false,
      error: null,
      uploadProgress: 0,
    });
  }, []);

  return {
    ...state,
    uploadImages,
    fetchStatus,
    fetchResult,
    reset,
  };
}
