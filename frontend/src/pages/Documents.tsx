import React, { useState, useEffect } from 'react';
import { getFoldersList, getFilesByPrefix, createFolder, uploadFile, deleteFolder, deleteFile } from '../services/storage';
import { StorageFile } from '../types';
import FolderCard from '../components/FolderCard';
import FileTable from '../components/FileTable';
import NewFolderForm from '../components/NewFolderForm';

const Documents = () => {
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const foldersList = await getFoldersList();
      setFolders(foldersList);
    } catch (err) {
      setError('Erro ao carregar as pastas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = async (folder: string) => {
    try {
      if (selectedFolder === folder) {
        setSelectedFolder(null);
        setFiles([]);
        return;
      }

      setSelectedFolder(folder);
      setLoading(true);
      const filesList = await getFilesByPrefix(folder);
      setFiles(filesList);
    } catch (err) {
      setError('Erro ao carregar os arquivos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFolder(newFolderName);
      setNewFolderName('');
      setIsAddingFolder(false);
      loadFolders();
    } catch (err) {
      setError('Erro ao criar pasta');
      console.error(err);
    }
  };

  const handleDeleteFolder = async (folder: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Tem certeza que deseja deletar a pasta "${folder}"?`)) return;

    try {
      setLoading(true);
      await deleteFolder(folder);
      if (selectedFolder === folder) {
        setSelectedFolder(null);
        setFiles([]);
      }
      await loadFolders();
    } catch (err) {
      setError('Erro ao deletar pasta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFolder || !e.target.files?.length) return;
    
    try {
      setLoading(true);
      setUploadError(null);
      
      const file = e.target.files[0];
      await uploadFile(selectedFolder, file);
      
      const filesList = await getFilesByPrefix(selectedFolder);
      setFiles(filesList);
    } catch (err) {
      setUploadError('Erro ao fazer upload do arquivo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar o arquivo?`)) return;

    try {
      setLoading(true);
      await deleteFile(filePath);
      if (selectedFolder) {
        const filesList = await getFilesByPrefix(selectedFolder);
        setFiles(filesList);
      }
    } catch (err) {
      setError('Erro ao deletar arquivo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedFolder) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
        <p className="mt-2 text-gray-600">Gerencie seus documentos aqui</p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pastas ({folders.length})</h2>
        <button
          onClick={() => setIsAddingFolder(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Nova Pasta
        </button>
      </div>

      {isAddingFolder && (
        <NewFolderForm
          folderName={newFolderName}
          onSubmit={handleAddFolder}
          onChange={(e) => setNewFolderName(e.target.value)}
          onCancel={() => setIsAddingFolder(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder) => (
          <FolderCard
            key={folder}
            name={folder}
            isSelected={selectedFolder === folder}
            onSelect={() => handleFolderClick(folder)}
            onDelete={(e) => handleDeleteFolder(folder, e)}
          />
        ))}
      </div>

      {selectedFolder && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              Arquivos em {selectedFolder}:
            </h3>
            <label className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Adicionar Arquivo
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {uploadError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {uploadError}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <FileTable files={files} onDelete={handleDeleteFile} />
          )}
        </div>
      )}
    </div>
  );
};

export default Documents;