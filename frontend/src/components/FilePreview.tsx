import React, { useEffect, useState } from 'react';
import { getFilePreview } from '../services/storage';
import { StorageFile } from '../types';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface FilePreviewProps {
  file: StorageFile;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Create new plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const previewData = await getFilePreview(file.path);
        setPreview(previewData);
      } catch (err) {
        setError('Erro ao carregar preview do arquivo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [file]);

  if (loading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!preview) {
    return <div className="text-gray-500">Não foi possível gerar o preview deste arquivo</div>;
  }

  switch (preview.type) {
    case 'media':
      if (preview.content_type?.startsWith('image/')) {
        return (
          <div className="h-[calc(100vh-120px)] flex items-center justify-center">
            <img src={preview.url} alt={file.name} className="max-w-full max-h-full object-contain" />
          </div>
        );
      }
      if (preview.content_type === 'application/pdf') {
        return (
          <div className="h-[calc(100vh-120px)]">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer
                fileUrl={preview.url}
                plugins={[defaultLayoutPluginInstance]}
                defaultScale={1}
                characterMap={{
                  isCompressed: true,
                  url: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/'
                }}
              />
            </Worker>
          </div>
        );
      }
      return <div className="text-gray-600">
        <p>Este arquivo é do tipo: {preview.content_type}</p>
        <a href={preview.url} target="_blank" rel="noopener noreferrer" 
           className="text-blue-500 hover:underline">
          Abrir arquivo
        </a>
      </div>;

    case 'text':
      return (
        <div className="h-[calc(100vh-120px)] overflow-auto">
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
            {preview.content}
          </pre>
        </div>
      );

    default:
      return (
        <div className="h-[calc(100vh-120px)] p-4">
          <div className="text-gray-600">
            <p>Tipo de arquivo: {preview.content_type}</p>
            <p>Tamanho: {Math.round(preview.size / 1024)} KB</p>
          </div>
        </div>
      );
  }
};

export default FilePreview;