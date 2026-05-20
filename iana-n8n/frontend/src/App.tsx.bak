import React, { useState, useRef } from 'react';
import { ingestFile, queryDocuments, setApiUrl, getApiUrl, REMOTE_API_URL, LOCAL_API_URL } from './services/api';
import { Upload, Search, FileText, CheckCircle, AlertCircle, Loader2, Link2, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChunkResponse {
  content: string;
  metadata: Record<string, any>;
  score: number;
}

function App() {
  const [apiUrl, setApiUrlState] = useState(getApiUrl());
  const [file, setFile] = useState<File | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ChunkResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (url: string) => {
    setApiUrl(url);
    setApiUrlState(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIngestStatus(null);
    }
  };

  const onIngest = async () => {
    if (!file) return;
    setIngesting(true);
    setIngestStatus(null);
    
    try {
      const data = await ingestFile(file);
      setIngestStatus({ type: 'success', msg: `Succès : ${data.num_chunks} segments indexés.` });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setIngestStatus({ type: 'error', msg: err.response?.data?.detail || "Erreur lors de l'ingestion." });
    } finally {
      setIngesting(false);
    }
  };

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setSearching(true);
    setError(null);
    try {
      const data = await queryDocuments(query, 4);
      setResults(data.results);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la recherche.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex-col">
      <header style={{ background: 'var(--maif-blue)', padding: '1.5rem 0', color: 'white', marginBottom: '2rem', boxShadow: 'var(--shadow)' }}>
        <div className="container" style={{ padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FileText size={32} />
            <div>
              <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Atelier IANA</h1>
              <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>RAG API Intelligence Documentaire (Kreuzberg & ChromaDB)</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 0.8rem', borderRadius: '8px' }}>
            <Server size={18} />
            <select 
              value={apiUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <option style={{ color: '#333' }} value={REMOTE_API_URL}>Remote (Clever Cloud)</option>
              <option style={{ color: '#333' }} value={LOCAL_API_URL}>Local (localhost:8000)</option>
            </select>
          </div>
        </div>
      </header>

      <main className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          
          {/* Section Ingest */}
          <aside className="flex-col gap-4">
            <div className="card">
              <h2 className="mb-4" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} /> Ingestion PDF
              </h2>
              <div 
                style={{ 
                  border: '2px dashed var(--border)', 
                  borderRadius: '8px', 
                  padding: '1.5rem', 
                  textAlign: 'center',
                  background: file ? '#f0f9ff' : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  style={{ display: 'none' }} 
                />
                {!file ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cliquez pour choisir un PDF</p>
                ) : (
                  <p style={{ color: 'var(--maif-blue)', fontWeight: 600 }}>{file.name}</p>
                )}
              </div>
              
              <button 
                className="primary w-full mt-4 flex items-center justify-center gap-2"
                disabled={!file || ingesting}
                onClick={onIngest}
              >
                {ingesting ? <Loader2 className="animate-spin" size={18} /> : null}
                {ingesting ? 'Indexation...' : 'Lancer l\'ingestion'}
              </button>

              <AnimatePresence>
                {ingestStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 rounded-lg"
                    style={{ 
                      background: ingestStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
                      border: ingestStatus.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
                      color: ingestStatus.type === 'success' ? '#065f46' : '#991b1b',
                      fontSize: '0.85rem',
                      display: 'flex',
                      gap: '0.5rem'
                    }}
                  >
                    {ingestStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {ingestStatus.msg}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>

          {/* Section Query */}
          <section className="flex-col gap-4">
            <div className="card">
              <form onSubmit={onSearch} className="flex gap-2">
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search 
                    size={20} 
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} 
                  />
                  <input 
                    type="text" 
                    placeholder="Posez une question sur vos documents..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '0.8rem 1rem 0.8rem 40px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border)',
                      fontSize: '1rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <button type="submit" className="primary" disabled={searching || !query.trim()}>
                  {searching ? <Loader2 className="animate-spin" /> : 'Rechercher'}
                </button>
              </form>
            </div>

            {/* Liste des résultats */}
            <div className="flex-col gap-4">
              {searching && (
                <div className="flex items-center justify-center p-8 text-secondary">
                  <Loader2 className="animate-spin mr-2" /> Analyse des documents...
                </div>
              )}

              {error && (
                <div className="card" style={{ borderColor: 'var(--maif-red)', color: 'var(--maif-red)' }}>
                  {error}
                </div>
              )}

              <AnimatePresence>
                {results.map((res, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card mb-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span style={{ 
                         fontSize: '0.7rem', 
                         fontWeight: 700, 
                         color: 'white', 
                         background: 'var(--maif-blue)', 
                         padding: '2px 8px', 
                         borderRadius: '20px' 
                       }}>
                         RÉSULTAT {i + 1}
                       </span>
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                         <Link2 size={14} /> Score: {res.score.toFixed(4)}
                       </span>
                    </div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {res.content}
                    </p>
                    <div 
                      className="mt-4 pt-4" 
                      style={{ 
                        borderTop: '1px solid #f1f5f9', 
                        fontSize: '0.8rem', 
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        gap: '1rem'
                      }}
                    >
                      <span>Source : <strong>{res.metadata.source}</strong></span>
                      {res.metadata.first_page !== 0 && (
                        <span>Page : {res.metadata.first_page}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!searching && results.length === 0 && !error && query === '' && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                  <Search size={48} className="mb-4" style={{ margin: '0 auto', opacity: 0.2 }} />
                  <p>Commencez par indexer un PDF ou posez directement une question si la base est déjà remplie.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
      
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
