import axios from 'axios';

export const REMOTE_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://rag-api-iana-agentic-workflows-workshop.cleverapps.io';
export const LOCAL_API_URL = 'http://localhost:8000';

const savedUrl = localStorage.getItem('apiUrl');
let currentApiUrl = savedUrl || REMOTE_API_URL;

const api = axios.create({
  baseURL: currentApiUrl,
});

export const setApiUrl = (url: string) => {
  currentApiUrl = url;
  api.defaults.baseURL = url;
  localStorage.setItem('apiUrl', url);
};

export const getApiUrl = () => currentApiUrl;

export const ingestFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/ingest', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export interface FileIngestResult {
  filename: string;
  success: boolean;
  num_chunks: number;
  error?: string | null;
}

export interface BatchIngestResponse {
  message: string;
  total_files: number;
  total_chunks: number;
  results: FileIngestResult[];
}

export const ingestFiles = async (files: File[]): Promise<BatchIngestResponse> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const response = await api.post('/ingest-batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const queryDocuments = async (question: string, top_k: number = 4) => {
  const response = await api.post('/query', { question, top_k });
  return response.data;
};
export const clearDatabase = async () => {
  const response = await api.post('/clear');
  return response.data;
};

export default api;
