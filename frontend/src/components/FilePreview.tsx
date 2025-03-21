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
  const [textContent, setTextContent] = useState<string>('');

  // Create new plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Função para verificar se é um arquivo de texto
  const isTextFile = (contentType: string) => {
    return contentType?.startsWith('text/') || 
           contentType === 'application/json' || 
           contentType === 'application/xml';
  };

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const previewData = await getFilePreview(file.path);
        setPreview(previewData);

        // Se for arquivo de texto, carregar o conteúdo
        if (previewData && isTextFile(previewData.content_type)) {
          const response = await fetch(previewData.url, {
            headers: {
              'Accept': 'text/plain, application/json, application/xml, text/*'
            },
            // Força o fetch a tratar como uma requisição CORS
            mode: 'cors',
            // Impede o Vite de interceptar a requisição
            cache: 'no-store'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const text = await response.text();
          setTextContent(text);
        }
      } catch (err) {
        setError('Erro ao carregar preview do arquivo');
        console.error('Erro detalhado:', err);
      } finally {
        setLoading(false);
      }
    };

    // Resetar o conteúdo quando mudar de arquivo
    setTextContent('');
    setLoading(true);
    setError(null);
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

  // Para arquivos de texto
  if (isTextFile(preview.content_type)) {
    return (
      <div className="h-[calc(100vh-120px)] overflow-auto">
        <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
          {textContent || 'Carregando conteúdo...'}
        </pre>
      </div>
    );
  }

  // Para imagens
  if (preview.content_type?.startsWith('image/')) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <img src={preview.url} alt={file.name} className="max-w-full max-h-full object-contain" />
      </div>
    );
  }

  // Para PDFs
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

  // Para outros tipos de arquivo
  return (
    <div className="h-[calc(100vh-120px)] p-4">
      <div className="text-gray-600">
        <p>Tipo de arquivo: {preview.content_type}</p>
        <p>Tamanho: {Math.round(preview.size / 1024)} KB</p>
        <a href={preview.url} target="_blank" rel="noopener noreferrer" 
           className="text-blue-500 hover:underline mt-2 inline-block">
          Abrir arquivo
        </a>
      </div>
    </div>
  );
};

export default FilePreview;