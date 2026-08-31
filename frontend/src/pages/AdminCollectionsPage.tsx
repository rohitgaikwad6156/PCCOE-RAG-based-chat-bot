import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Plus, Trash2, Folder, BookOpen, Database } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Modal } from '../components/common/Modal';
import { collectionApi } from '../services/collectionApi';
import { CollectionItem } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminCollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('All Departments');

  const { showToast } = useToast();

  const loadCollections = async () => {
    try {
      setIsLoading(true);
      const res = await collectionApi.getCollections();
      setCollections(res.collections);
      setDepartments(res.departments);
    } catch (err) {
      showToast('Could not fetch collections', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await collectionApi.createCollection({ name: name.trim(), description, department });
      showToast('Collection created successfully', 'success');
      setIsCreateOpen(false);
      setName('');
      setDescription('');
      loadCollections();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create collection', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await collectionApi.deleteCollection(id);
      showToast('Collection deleted', 'info');
      loadCollections();
    } catch (err) {
      showToast('Failed to delete collection', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/admin" className="text-slate-400 hover:text-white text-xs font-semibold">
                Admin
              </Link>
              <span className="text-slate-600">/</span>
              <h1 className="text-xl font-bold text-white tracking-tight">Knowledge Collections & Departments</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Structure knowledge topics to allow scoped retrieval across college faculties.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Collection</span>
          </button>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col._id}
              className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                    <Folder className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    {col.department}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{col.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {col.description || 'General college knowledge collection.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <Link
                  to={`/admin/documents?collection=${encodeURIComponent(col.name)}`}
                  className="hover:text-brand-400 text-slate-400 font-medium transition-colors flex items-center gap-1.5"
                  title="View documents in this collection"
                >
                  <span className="font-bold text-white px-1.5 py-0.5 rounded-md bg-slate-800 text-[11px]">
                    {col.documentCount || 0}
                  </span>
                  <span>{col.documentCount === 1 ? 'document' : 'documents'} linked</span>
                </Link>
                <button
                  onClick={() => handleDelete(col._id)}
                  title="Delete collection"
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Knowledge Collection">
        <form onSubmit={handleCreate} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Collection Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Placement Guidelines & Statistics"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department Scope</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-medium"
            >
              {departments.map((d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the topics in this collection..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md"
            >
              Save Collection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
