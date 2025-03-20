import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicialize o Gemini API - use uma variável de ambiente para a API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

const Chat = () => {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setLoading(true);

    try {
      // Obtenha o modelo
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Gere a resposta diretamente
      const result = await model.generateContent(input);
      const response = await result.response;
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.text() }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
      setInput('');
    }
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
            {message.content}
          </div>
        ))}
        {loading && (
          <div className="text-center text-gray-500">
            <div className="animate-pulse">Carregando...</div>
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

export default Chat;