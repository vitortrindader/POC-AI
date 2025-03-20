import React, { useState, useCallback } from 'react';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { useDropzone } from 'react-dropzone';

// Inicialize o Gemini API - use uma variável de ambiente para a API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

interface Message {
  role: 'user' | 'assistant';
  content: string | Part[];
}

const GeminiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && pendingFiles.length === 0) return;

    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const parts: Part[] = [];

      // Adiciona mensagens anteriores para o contexto
      messages.forEach(msg => {
        if (msg.role === 'user') {
          if (typeof msg.content === 'string') {
            parts.push({ text: msg.content });
          } else {
            parts.push(...msg.content);
          }
        } else if (msg.role === 'assistant') {
          if (typeof msg.content === 'string') {
            parts.push({ text: msg.content });
          } else {
            parts.push(...msg.content);
          }
        }
      });

      // Adiciona arquivos pendentes
      for (const file of pendingFiles) {
        const base64Data = await readFileAsBase64(file);
        const mimeType = file.type;

        parts.push({
          inlineData: { mimeType, data: base64Data },
        });
      }

      // Adiciona a mensagem do usuário
      if (input.trim()) {
        parts.push({ text: input });
      }

      const result = await model.generateContent(parts);
      const response = await result.response;

      setMessages(prev => [
        ...prev,
        { role: 'user', content: pendingFiles.length > 0 ? parts.slice(-pendingFiles.length) : input },
        { role: 'assistant', content: response.text() },
      ]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
      setInput('');
      setPendingFiles([]); // Limpa os arquivos pendentes
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPendingFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="h-[500px] overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded-lg ${
              message.role === 'user'
                ? 'ml-auto bg-blue-100 max-w-[80%]'
                : 'mr-auto bg-gray-100 max-w-[80%]'
            }`}
          >
            {typeof message.content === 'string'
              ? message.content
              : message.content.map((part, partIndex) => {
                  if (part.text) {
                    return <span key={partIndex}>{part.text}</span>;
                  } else if (part.inlineData) {
                    return (
                      <img
                        key={partIndex}
                        src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                        alt="Uploaded file"
                        className="max-w-full"
                      />
                    );
                  }
                  return null;
                })}
          </div>
        ))}
        {loading && (
          <div className="text-center text-gray-500">
            <div className="animate-pulse">Carregando...</div>
          </div>
        )}
      </div>

      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-4 mb-4 cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center">Solte os arquivos aqui...</p>
        ) : (
          <p className="text-center">Arraste e solte alguns arquivos aqui, ou clique para selecionar arquivos</p>
        )}
        {pendingFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Arquivos selecionados:</p>
            <ul className="space-y-1">
              {pendingFiles.map((file, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default GeminiChat;