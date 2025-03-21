import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Documents from './pages/Documents';
import Workflows from './pages/Workflows';
import SmartSearch from './pages/SmartSearch';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className="flex-1 w-full px-4 py-8">
          <Routes>
            <Route path="/documentos" element={<Documents />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/busca" element={<SmartSearch />} />
            <Route path="/" element={<Navigate to="/documentos" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;