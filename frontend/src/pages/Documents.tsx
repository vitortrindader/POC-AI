import { useState, useEffect } from 'react';
import { getFoldersList } from '../services/storage';

const Documents = () => {
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    loadFolders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <h2 className="text-xl font-semibold">{error}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
        <p className="mt-2 text-gray-600">Gerencie seus documentos aqui</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder, index) => (
          <div 
            key={index}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-gray-800">{folder}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;