import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Documents from './pages/Documents';
import Workflows from './pages/Workflows';
import SmartSearch from './pages/SmartSearch';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-100">
          <div className="p-4 md:p-8">
            <div className="bg-white rounded-lg shadow-lg p-6 min-h-[calc(100vh-8rem)]">
              <Routes>
                <Route path="/documentos" element={<Documents />} />
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/busca" element={<SmartSearch />} />
                <Route path="/" element={<Navigate to="/documentos" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;