import { StorageFile } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro na requisição');
  }
  return response.json();
};

export const getFoldersList = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/folders/`);
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao buscar lista de pastas:', error);
    throw error;
  }
};

export const createFolder = async (folderName: string): Promise<{ folder: string }> => {
  try {
    const response = await fetch(`${API_URL}/folders/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_name: folderName }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    throw error;
  }
};

export const deleteFolder = async (folderName: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/folders/${folderName}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar pasta');
  } catch (error) {
    console.error('Erro ao deletar pasta:', error);
    throw error;
  }
};

export const getFilesByPrefix = async (prefix: string): Promise<StorageFile[]> => {
  try {
    const response = await fetch(`${API_URL}/files/${prefix}/`);
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    throw error;
  }
};

export const uploadFile = async (folder: string, file: File): Promise<StorageFile> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/files/upload/${folder}/`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/files/delete/${filePath}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar arquivo');
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
};

export const getFilePreview = async (filePath: string) => {
  try {
    const response = await fetch(`${API_URL}/files/preview/${filePath}/`);
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao buscar preview:', error);
    throw error;
  }
};