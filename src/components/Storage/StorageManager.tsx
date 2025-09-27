import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Upload, Download, Search, Filter, FileText, Image, Video, Archive, Folder, Save, Trash2, AlertTriangle } from 'lucide-react';

interface StorageManagerProps {
  projectId?: string;
}

export function StorageManager({ projectId }: StorageManagerProps) {
  const { user } = useAuth();
  const { 
    files, 
    projects, 
    stages, 
    uploadFileFromInput,
    deleteFile,
    saveProjectFiles
  } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUploader, setFilterUploader] = useState('all');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="w-5 h-5 text-orange-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if user has access to this project
  const hasProjectAccess = (project: any) => {
    if (!user || !project) return false;
    
    // Manager has access to all projects
    if (user.role === 'manager') return true;
    
    // Client has access if they own the project
    if (user.role === 'client' && project.client_id === user.id) return true;
    
    // Employee has access if assigned to the project
    if (user.role === 'employee' && project.assigned_employees.includes(user.id)) return true;
    
    return false;
  };

  const getProjectFiles = () => {
    let filteredFiles = files;
    
    // Filter by project access
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (!hasProjectAccess(project)) return [];
      filteredFiles = files.filter(f => f.project_id === projectId);
    } else {
      // Filter files based on user role and project access
      filteredFiles = files.filter(file => {
        const project = projects.find(p => p.id === file.project_id);
        return hasProjectAccess(project);
      });
    }
    
    return filteredFiles;
  };

  const filteredFiles = getProjectFiles().filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.uploader_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.file_type === filterType;
    const matchesUploader = filterUploader === 'all' || file.uploaded_by === filterUploader;
    return matchesSearch && matchesType && matchesUploader;
  });

  const uniqueUploaders = [...new Set(getProjectFiles().map(f => f.uploader_name))];
  const uniqueFileTypes = [...new Set(getProjectFiles().map(f => f.file_type))];

  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList) return;
    
    // Add files to pending list for batch save
    setPendingFiles(prev => [...prev, ...Array.from(fileList)]);
  };

  const handleSaveFiles = async () => {
    if (pendingFiles.length === 0 || !projectId) return;
    
    setIsSaving(true);
    try {
      await saveProjectFiles(projectId, pendingFiles, user?.name || 'Unknown');
      setPendingFiles([]);
    } catch (error) {
      console.error('Error saving files:', error);
      alert('Error saving files. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again.');
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileLocation = (file: any) => {
    const project = projects.find(p => p.id === file.project_id);
    if (file.stage_id) {
      const stage = stages.find(s => s.id === file.stage_id);
      return `${project?.title} / ${stage?.name}`;
    }
    return project?.title || 'Unknown Project';
  };

  // Check if current user can manage files (upload/delete)
  const canManageFiles = () => {
    if (!user || !projectId) return false;
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    
    // Manager can manage all files
    if (user.role === 'manager') return true;
    
    // Client can manage files in their own project
    if (user.role === 'client' && project.client_id === user.id) return true;
    
    // Employee can manage files in assigned projects
    if (user.role === 'employee' && project.assigned_employees.includes(user.id)) return true;
    
    return false;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shared Storage</h2>
          <p className="text-gray-600">All project files and documents in one place</p>
        </div>
        <div className="flex items-center space-x-3">
          {pendingFiles.length > 0 && (
            <button
              onClick={handleSaveFiles}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : `Save ${pendingFiles.length} File(s)`}</span>
            </button>
          )}
          {canManageFiles() && (
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Files</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>

      {/* Pending Files Section */}
      {pendingFiles.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Pending Files ({pendingFiles.length})</h3>
          <div className="space-y-2">
            {pendingFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <button
                  onClick={() => removePendingFile(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-yellow-700">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Click "Save" to upload these files to the project storage.
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All File Types</option>
          {uniqueFileTypes.map(type => (
            <option key={type} value={type}>{type.toUpperCase()}</option>
          ))}
        </select>

        <select
          value={filterUploader}
          onChange={(e) => setFilterUploader(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Uploaders</option>
          {uniqueUploaders.map(uploader => (
            <option key={uploader} value={uploader}>{uploader}</option>
          ))}
        </select>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map(file => (
          <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getFileIcon(file.file_type)}
                <span className="font-medium text-gray-900 truncate">{file.filename}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = file.file_url;
                    link.download = file.filename;
                    link.click();
                  }}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>
                {canManageFiles() && (
                  <button
                    onClick={() => setDeleteConfirm(file.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Folder className="w-4 h-4" />
                <span className="truncate">{getFileLocation(file)}</span>
              </div>
              <div>
                <strong>Size:</strong> {formatFileSize(file.size)}
              </div>
              <div>
                <strong>Uploaded by:</strong> {file.uploader_name}
              </div>
              <div>
                <strong>Date:</strong> {new Date(file.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete File</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this file? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteFile(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}