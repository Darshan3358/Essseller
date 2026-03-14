'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Shell from '@/components/layout/Shell';
import {
    FileText, Image as ImageIcon, Video, Folder, Search,
    MoreVertical, Download, ExternalLink, Plus, HardDrive,
    Trash2, Loader2, Upload, RefreshCw, File, AlertCircle, CheckCircle
} from 'lucide-react';

interface UploadedFile {
    name: string;
    url: string;
    type: 'image' | 'video' | 'doc' | 'other';
    ext: string;
    size: string;
    sizeBytes: number;
    createdAt: string;
    mtime: string;
}

interface Stats {
    total: number;
    images: number;
    videos: number;
    docs: number;
    other: number;
    totalSize: string;
    totalSizeBytes: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || '/backend';

export default function UploadsPage() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'doc' | 'other'>('all');
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [deletingFile, setDeletingFile] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/uploads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setFiles(data.files);
                setStats(data.stats);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadMsg(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/uploads`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setUploadMsg({ type: 'success', text: `"${file.name}" uploaded successfully!` });
                fetchFiles();
            } else {
                setUploadMsg({ type: 'error', text: data.message || 'Upload failed.' });
            }
        } catch {
            setUploadMsg({ type: 'error', text: 'Upload failed. Please try again.' });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;
        setDeletingFile(filename);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/uploads/${filename}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setFiles(prev => prev.filter(f => f.name !== filename));
                setUploadMsg({ type: 'success', text: `"${filename}" deleted.` });
            }
        } catch {
            setUploadMsg({ type: 'error', text: 'Delete failed.' });
        } finally {
            setDeletingFile(null);
        }
    };

    const filtered = files.filter(f => {
        const matchType = filter === 'all' || f.type === filter;
        const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
    });

    const FileIcon = ({ type }: { type: string }) => {
        if (type === 'image') return <ImageIcon className="w-10 h-10 text-primary-400" />;
        if (type === 'video') return <Video className="w-10 h-10 text-purple-400" />;
        if (type === 'doc') return <FileText className="w-10 h-10 text-indigo-400" />;
        return <File className="w-10 h-10 text-gray-400" />;
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hrs < 24) return `${hrs}h ago`;
        return `${days}d ago`;
    };

    return (
        <Shell>
            <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-black uppercase tracking-widest">
                            <Folder className="w-3 h-3" />
                            Media Library
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Uploaded Files</h2>
                        <p className="text-gray-500 font-medium max-w-xl">
                            Manage your product assets, documents, and shipment proofs.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchFiles}
                            className="px-4 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="*/*"
                            onChange={handleUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="btn-primary flex items-center gap-2 shadow-xl shadow-primary-500/25 disabled:opacity-60"
                        >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            {uploading ? 'Uploading...' : 'Upload File'}
                        </button>
                    </div>
                </div>

                {/* Upload Message */}
                {uploadMsg && (
                    <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${uploadMsg.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        {uploadMsg.type === 'success'
                            ? <CheckCircle className="w-5 h-5 shrink-0" />
                            : <AlertCircle className="w-5 h-5 shrink-0" />}
                        {uploadMsg.text}
                    </div>
                )}

                {/* Storage Stats */}
                {stats && (
                    <div className="glass-card p-1">
                        <div className="p-8 flex flex-col md:flex-row items-center gap-10">
                            <div className="shrink-0">
                                <div className="relative w-24 h-24">
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray="251.2"
                                            strokeDashoffset={251.2 - (Math.min(stats.totalSizeBytes / (500 * 1024 * 1024), 1) * 251.2)}
                                            className="text-primary-600" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-gray-900">
                                        {stats.total} files
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        <HardDrive className="w-5 h-5 text-gray-400" />
                                        File Storage
                                    </h4>
                                    <p className="text-sm font-bold text-gray-500">{stats.totalSize} total</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Images', val: stats.images, color: 'bg-primary-500' },
                                        { label: 'Videos', val: stats.videos, color: 'bg-purple-500' },
                                        { label: 'Docs', val: stats.docs, color: 'bg-indigo-500' },
                                        { label: 'Other', val: stats.other, color: 'bg-gray-300' },
                                    ].map((item, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <span>{item.label}</span>
                                                <span>{item.val} files</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${item.color}`}
                                                    style={{ width: stats.total > 0 ? `${(item.val / stats.total) * 100}%` : '0%' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter + Search Bar */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center gap-2 bg-white p-1.5 border border-gray-100 rounded-2xl shadow-sm flex-1">
                            <div className="relative flex-1 group pl-3">
                                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search files..."
                                    className="w-full pl-9 pr-4 py-2.5 bg-transparent border-none rounded-xl focus:ring-0 font-medium text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'image', 'video', 'doc', 'other'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border ${filter === f
                                            ? 'bg-primary-600 text-white border-primary-600'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* File Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-24 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading files...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-24 text-gray-400">
                            <Folder className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="font-semibold text-lg">{search ? 'No files match your search' : 'No files uploaded yet'}</p>
                            <p className="text-sm mt-1">
                                {!search && (
                                    <button onClick={() => fileInputRef.current?.click()} className="text-primary-600 font-bold hover:underline">
                                        Upload your first file →
                                    </button>
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map((file, i) => (
                                <div key={i} className="glass-card p-5 group cursor-default hover:border-primary-100 transition-all relative">
                                    {/* Thumbnail / Icon Area */}
                                    <div className="w-full aspect-square bg-gray-50 rounded-2xl mb-5 flex items-center justify-center relative overflow-hidden group-hover:bg-primary-50 transition-colors">
                                        {file.type === 'image' ? (
                                            <img
                                                src={`http://localhost:5001${file.url}`}
                                                alt={file.name}
                                                className="w-full h-full object-cover rounded-2xl"
                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : (
                                            <FileIcon type={file.type} />
                                        )}

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-primary-600/90 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 rounded-2xl">
                                            <div className="flex gap-2">
                                                <a
                                                    href={`http://localhost:5001${file.url}`}
                                                    download={file.name}
                                                    className="p-3 bg-white text-primary-600 rounded-xl hover:scale-110 transition-transform"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <a
                                                    href={`http://localhost:5001${file.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-white text-primary-600 rounded-xl hover:scale-110 transition-transform"
                                                    title="Open"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(file.name)}
                                                disabled={deletingFile === file.name}
                                                className="flex items-center gap-1.5 text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                            >
                                                {deletingFile === file.name
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : <Trash2 className="w-3.5 h-3.5" />}
                                                {deletingFile === file.name ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* File Info */}
                                    <div className="space-y-1">
                                        <h5 className="font-black text-gray-900 truncate text-sm" title={file.name}>{file.name}</h5>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{file.size}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{timeAgo(file.mtime)}</span>
                                        </div>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${file.type === 'image' ? 'bg-primary-100 text-primary-700' :
                                                file.type === 'video' ? 'bg-purple-100 text-purple-700' :
                                                    file.type === 'doc' ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>{file.ext || file.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Shell>
    );
}
