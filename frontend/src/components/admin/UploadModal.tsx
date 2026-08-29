import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { documentApi } from '../../services/documentApi';
import { useToast } from '../../context/ToastContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: string[];
  collections: Array<{ name: string }>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  departments,
  collections,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [collectionName, setCollectionName] = useState('Academics');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>('');
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a document file to upload.', 'warning');
      return;
    }

    try {
      setIsUploading(true);
      setUploadStage('Uploading document to server...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('department', department);
      formData.append('collectionName', collectionName);

      setUploadStage('Extracting text & generating vector embeddings...');
      await documentApi.uploadDocument(formData);

      showToast('Document uploaded and queued for processing!', 'success');
      onSuccess();
      onClose();
      // Reset form
      setFile(null);
      setTitle('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setIsUploading(false);
      setUploadStage('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload College Document">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-700 hover:border-brand-500/60 rounded-2xl p-6 text-center bg-slate-900/50 hover:bg-slate-900 transition-all cursor-pointer relative"
        >
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>

            {file ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <FileText className="w-4 h-4" />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <>
                <div className="text-xs font-bold text-slate-200">
                  Click to upload or drag and drop
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Supported: PDF, DOCX, DOC, TXT (Up to 15MB)
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Document Title / Reference Name
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Academic Calendar Winter 2026"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-medium"
          />
        </div>

        {/* Department & Collection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-medium"
            >
              {departments.map((dept, i) => (
                <option key={i} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Knowledge Collection
            </label>
            <select
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-medium"
            >
              {collections.map((col, i) => (
                <option key={i} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ingestion Pipeline Stages visual */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            Automated RAG Ingestion Pipeline:
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>1. Text Extract</span>
            <span>→</span>
            <span>2. Chunking</span>
            <span>→</span>
            <span>3. Embeddings</span>
            <span>→</span>
            <span>4. Vector Index</span>
          </div>
        </div>

        {isUploading && (
          <div className="flex items-center gap-2 text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 p-2.5 rounded-xl font-medium">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{uploadStage}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || !file}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Upload & Process</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
