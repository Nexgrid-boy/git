import React, { useState } from 'react';
import { CVDocument } from '../types/jobpilot';
import { api } from '../services/api';
import { FileText, Upload, Star, AlertCircle, ShieldCheck } from 'lucide-react';

interface CvManagerViewProps {
  documents: CVDocument[];
  onRefreshDocuments: () => void;
}

export const CvManagerView: React.FC<CvManagerViewProps> = ({ documents, onRefreshDocuments }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [rawText, setRawText] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedDoc, setSelectedDoc] = useState<CVDocument | null>(documents[0] || null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !rawText.trim()) {
      setErrorMsg('Please select a PDF/DOCX file or paste CV text.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      if (file) {
        formData.append('cvFile', file);
      } else {
        formData.append('rawText', rawText);
      }

      const result = await api.extractCv(formData);
      setExtractedData(result.extractedData);
      setSelectedDoc(result.cvDocument);
      setFile(null);
      setRawText('');
      onRefreshDocuments();
    } catch (err: any) {
      console.error('CV Upload Error:', err);
      setErrorMsg(err.message || 'Failed to extract CV');
    } finally {
      setUploading(false);
    }
  };

  const handleSetMaster = async (docId: string) => {
    try {
      await api.setMasterCv(docId);
      onRefreshDocuments();
    } catch (err: any) {
      console.error('Failed to set master CV:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">CV & Profile Manager</h1>
            <p className="text-xs text-slate-300 mt-0.5">Upload CV documents, extract verified experience, and configure your Master CV.</p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Truthfulness Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload & Versions */}
        <div className="space-y-6">
          
          {/* Upload Form */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Upload New CV</span>
            </h2>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-3">
              <div className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer bg-black/20 transition">
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt" 
                  onChange={handleFileChange}
                  className="hidden" 
                  id="cv-file-upload" 
                />
                <label htmlFor="cv-file-upload" className="cursor-pointer space-y-2 block">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-white">
                    {file ? file.name : 'Click to select PDF or DOCX'}
                  </p>
                  <p className="text-[11px] text-slate-400">Supports PDF, DOCX or plain text</p>
                </label>
              </div>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="glass-panel px-2 text-slate-400">Or paste raw text</span></div>
              </div>

              <textarea
                rows={3}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste plain CV content here..."
                className="w-full glass-input p-3 text-xs text-white focus:outline-none"
              />

              <button
                type="submit"
                disabled={uploading}
                className="w-full btn-gradient-primary py-2.5 text-xs font-bold transition disabled:opacity-50"
              >
                {uploading ? 'Extracting Text...' : 'Extract & Save Version'}
              </button>
            </form>
          </div>

          {/* Versions */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Saved CV Versions</h2>
            
            <div className="space-y-3">
              {documents.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedDoc?.id === doc.id 
                      ? 'bg-blue-600/20 border-blue-500/60' 
                      : 'glass-panel border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-xs text-white">{doc.title}</h3>
                      <p className="text-[11px] text-slate-300 mt-0.5">{doc.fileName} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>

                    {doc.isMaster ? (
                      <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Master
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetMaster(doc.id);
                        }}
                        className="text-[10px] text-slate-300 hover:text-amber-300 font-bold underline shrink-0"
                      >
                        Set Master
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Document Content */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDoc ? (
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white">{selectedDoc.title}</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Status: {selectedDoc.isMaster ? 'Master CV Version' : 'Secondary CV Version'}</p>
                </div>
                
                {!selectedDoc.isMaster && (
                  <button
                    onClick={() => handleSetMaster(selectedDoc.id)}
                    className="btn-gradient-primary text-white font-bold text-xs px-3.5 py-2 flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-300" />
                    <span>Set as Master CV</span>
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Extracted Core Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDoc.extractedSkills.map((s, i) => (
                    <span key={i} className="bg-white/5 border border-white/10 text-slate-200 text-xs px-3 py-1 rounded-lg font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Extracted Document Content</h3>
                <div className="glass-panel p-4 text-xs font-mono text-slate-200 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed border-white/10">
                  {selectedDoc.rawText}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-300">
              Select a CV version to inspect extracted text and skills.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
