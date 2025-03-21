import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { StorageFile } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

// Função auxiliar para determinar o mimeType
const getMimeType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'txt':
      return 'text/plain';
    case 'doc':
    case 'docx':
      return 'application/msword';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'text/plain';
  }
};

interface ChatPreviewProps {
  file: StorageFile;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ file }) => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; isStreaming?: boolean }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Olá! Estou aqui para ajudar você com o arquivo "${file.name}". O que você gostaria de saber sobre ele?`,
      },
    ]);
  }, [file]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !file.path) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    // Adiciona uma mensagem vazia do assistente que será preenchida com o streaming
    setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    try {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Primeiro, obter a URL assinada do backend
      const previewResponse = await fetch(`http://localhost:8000/api/files/preview/${encodeURIComponent(file.path)}`);
      if (!previewResponse.ok) {
        throw new Error('Failed to get file preview URL');
      }
      const previewData = await previewResponse.json();
      
      if (!previewData.url) {
        throw new Error('No signed URL available for file');
      }

      // Buscar o conteúdo do arquivo usando a URL assinada
      const fileResponse = await fetch(previewData.url);
      if (!fileResponse.ok) {
        throw new Error('Failed to fetch file content');
      }

      let result;

      // Se for um arquivo PDF ou outro tipo binário, usar a abordagem base64
      if (getMimeType(file.name) === 'application/pdf') {
        const fileBlob = await fileResponse.blob();
        const fileArrayBuffer = await fileBlob.arrayBuffer();
        const base64Content = btoa(
          new Uint8Array(fileArrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        const filePart: Part = {
          inlineData: {
            mimeType: getMimeType(file.name),
            data: base64Content
          }
        };

        const geminiParts: Part[] = [
          filePart,
          { text: `Com base neste arquivo, por favor responda à seguinte pergunta: ${userMessage}` }
        ];

        console.log('Sending request to Gemini with binary file...');
        result = await geminiModel.generateContentStream(geminiParts);
      } else {
        // Para arquivos de texto, enviar o conteúdo diretamente
        const fileText = await fileResponse.text();

        const geminiParts: Part[] = [
          { text: fileText },
          { text: `Com base neste arquivo, por favor responda à seguinte pergunta: ${userMessage}` }
        ];

        console.log('Sending request to Gemini with text content...');
        result = await geminiModel.generateContentStream(geminiParts);
      }

      let fullResponse = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
            lastMessage.content = fullResponse;
          }
          return newMessages;
        });
      }

      // Finaliza a mensagem removendo a flag de streaming
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
          lastMessage.content = 'Desculpe, houve um erro ao processar sua mensagem. Por favor, tente novamente.';
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded-lg ${
              message.role === 'user' 
                ? 'ml-auto bg-blue-100 max-w-[80%]' 
                : 'mr-auto bg-gray-100 max-w-[80%]'
            }`}
          >
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-gray-500 animate-pulse" />
            )}
          </div>
        ))}
        {loading && !messages[messages.length - 1]?.isStreaming && (
          <div className="text-center text-gray-500">
            <div className="animate-pulse">Carregando...</div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Faça uma pergunta sobre o documento..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPreview;