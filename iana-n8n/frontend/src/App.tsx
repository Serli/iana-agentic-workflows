import React, { useState, useRef } from 'react';
import { ingestFiles, queryDocuments, clearDatabase, setApiUrl, getApiUrl, REMOTE_API_URL, LOCAL_API_URL } from './services/api';
import type { FileIngestResult } from './services/api';
import { Upload, Search, FileText, CheckCircle, AlertCircle, Loader2, Link2, Server, Trash2, X, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChunkResponse {
  content: string;
  metadata: Record<string, any>;
  score: number;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo

function App() {
  const [apiUrl, setApiUrlState] = useState(getApiUrl());
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [ingestDetails, setIngestDetails] = useState<FileIngestResult[]>([]);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ChunkResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (url: string) => {
    setApiUrl(url);
    setApiUrlState(url);
  };

  // Ajoute des fichiers à la sélection en filtrant les PDF et en dédoublonnant par nom+taille.
  const addFiles = (incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.name.toLowerCase().endsWith('.pdf') && f.size <= MAX_FILE_SIZE
    );
    if (pdfs.length === 0) return;
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const merged = [...prev];
      for (const f of pdfs) {
        const key = `${f.name}-${f.size}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(f);
        }
      }
      return merged;
    });
    setIngestStatus(null);
    setIngestDetails([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
    // Reset pour permettre de re-sélectionner les mêmes fichiers après suppression
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const onIngest = async () => {
    if (files.length === 0) return;
    setIngesting(true);
    setIngestStatus(null);
    setIngestDetails([]);

    try {
      const data = await ingestFiles(files);
      const failed = data.results.filter((r) => !r.success);
      setIngestDetails(data.results);
      setIngestStatus({
        type: failed.length === 0 ? 'success' : 'error',
        msg: failed.length === 0
          ? `Succès : ${data.total_files} fichier(s), ${data.total_chunks} segments indexés.`
          : `${data.total_files - failed.length}/${data.total_files} fichier(s) indexés (${data.total_chunks} segments). ${failed.length} en échec.`,
      });
      if (failed.length === 0) {
        setFiles([]);
      } else {
        // On ne garde que les fichiers en échec pour permettre un nouvel essai
        const failedNames = new Set(failed.map((r) => r.filename));
        setFiles((prev) => prev.filter((f) => failedNames.has(f.name)));
      }
    } catch (err: any) {
      setIngestStatus({ type: 'error', msg: err.response?.data?.detail || "Erreur lors de l'ingestion." });
    } finally {
      setIngesting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
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

  const onClearDatabase = async () => {
    setIsClearing(true);
    try {
      await clearDatabase();
      // Reset all states
      setResults([]);
      setQuery('');
      setFiles([]);
      setIngestStatus(null);
      setIngestDetails([]);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la suppression de la base.");
    } finally {
      setIsClearing(false);
      setShowClearConfirm(false);
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
            
            <button 
              onClick={() => setShowClearConfirm(true)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#fca5a5',
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
            >
              <Trash2 size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Purger</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="card"
              style={{ maxWidth: '400px', width: '90%', margin: '0 auto' }}
            >
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--maif-red)', marginBottom: '1rem' }}>
                <AlertCircle size={24} />
                Attention
              </h2>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Êtes-vous sûr de vouloir supprimer tous les documents de la base ? Cette action est irréversible et supprimera également les fichiers originaux.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowClearConfirm(false)} 
                  disabled={isClearing}
                  style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button 
                  onClick={onClearDatabase} 
                  disabled={isClearing}
                  style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: 'var(--maif-red)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isClearing ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  border: dragActive ? '2px dashed var(--maif-blue)' : '2px dashed var(--border)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: dragActive ? '#e0f2fe' : (files.length > 0 ? '#f0f9ff' : 'transparent'),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  multiple
                  style={{ display: 'none' }}
                />
                <FileUp
                  size={32}
                  style={{ margin: '0 auto 0.75rem', color: dragActive ? 'var(--maif-blue)' : 'var(--text-secondary)', opacity: dragActive ? 1 : 0.5 }}
                />
                <p style={{ color: dragActive ? 'var(--maif-blue)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: dragActive ? 600 : 400 }}>
                  {dragActive
                    ? 'Déposez vos fichiers PDF ici'
                    : 'Glissez-déposez vos PDF ici, ou cliquez pour les choisir'}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                  Plusieurs fichiers acceptés (PDF, max 50 Mo chacun)
                </p>
              </div>

              <AnimatePresence>
                {files.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex-col gap-2"
                    style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0' }}
                  >
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${f.size}-${i}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: '#f8fafc',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <FileText size={16} style={{ color: 'var(--maif-blue)', flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>
                          {f.name}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', flexShrink: 0 }}>
                          {formatSize(f.size)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          disabled={ingesting}
                          title="Retirer"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: ingesting ? 'not-allowed' : 'pointer',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            padding: 0,
                            flexShrink: 0
                          }}
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

              <button
                className="primary w-full mt-4 flex items-center justify-center gap-2"
                disabled={files.length === 0 || ingesting}
                onClick={onIngest}
              >
                {ingesting ? <Loader2 className="animate-spin" size={18} /> : null}
                {ingesting
                  ? 'Indexation...'
                  : files.length > 1
                    ? `Lancer l'ingestion (${files.length} fichiers)`
                    : "Lancer l'ingestion"}
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

              <AnimatePresence>
                {ingestDetails.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 flex-col gap-1"
                    style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}
                  >
                    {ingestDetails.map((r, i) => (
                      <li
                        key={`${r.filename}-${i}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.78rem',
                          color: r.success ? '#065f46' : '#991b1b'
                        }}
                        title={r.error || undefined}
                      >
                        {r.success ? <CheckCircle size={14} style={{ flexShrink: 0 }} /> : <AlertCircle size={14} style={{ flexShrink: 0 }} />}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.filename}
                        </span>
                        <span style={{ flexShrink: 0 }}>
                          {r.success ? `${r.num_chunks} segments` : (r.error || 'échec')}
                        </span>
                      </li>
                    ))}
                  </motion.ul>
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
