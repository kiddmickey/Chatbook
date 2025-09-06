import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>📚 Chatbook Study Hub</h1>
        <p>AI-powered learning platform coming soon!</p>
        <div className="status-cards">
          <div className="status-card">
            <h3>Frontend</h3>
            <span className="status-ok">✅ Ready</span>
          </div>
          <div className="status-card">
            <h3>Backend</h3>
            <span className="status-pending">🔄 Connecting...</span>
          </div>
          <div className="status-card">
            <h3>Database</h3>
            <span className="status-pending">🔄 Supabase</span>
          </div>
          <div className="status-card">
            <h3>AI</h3>
            <span className="status-pending">🔄 Gemini</span>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;