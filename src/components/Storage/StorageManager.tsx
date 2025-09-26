import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Upload, Download, Search, Filter, FileText, Image, Video, Archive, Folder } from 'lucide-react';

interface StorageManagerProps {
  projectId?: string;
}

export function StorageManager({ projectId }: StorageManagerProps) {
  const { user } = useAuth();
  const { files, projects, stages, uploadFileFromInput } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUploader, setFilterUploader] = useState('all');

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

  const getProjectFiles = () => {
    // If a projectId is provided, strictly scope to that project
    if (projectId) {
      return files.filter(f => f.project_id === projectId);
    }
    if (user?.role === 'employee') {
      const assignedProjects = projects.filter(p => p.assigned_employees.includes(user.id));
      return files.filter(f => assignedProjects.some(p => p.id === f.project_id));
    }
    if (user?.role === 'client') {
      const clientProjects = projects.filter(p => p.client_id === user.id);
      return files.filter(f => clientProjects.some(p => p.id === f.project_id));
    }
    return files;
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

  const handleFileUpload = (fileList: FileList | null, targetProjectId: string) => {
    if (!fileList) return;
    
    Array.from(fileList).forEach(file => {
      // For storage manager, we'll use the first available stage of the project
      const projectStages = stages.filter(s => s.project_id === targetProjectId);
      const stageId = projectStages.length > 0 ? projectStages[0].id : '';
      if (stageId) {
        uploadFileFromInput(stageId, file, user?.name || 'Unknown');
      }
    });
  };

  const getFileLocation = (file: any) => {
    const project = projects.find(p => p.id === file.project_id);
    if (file.stage_id) {
      const stage = stages.find(s => s.id === file.stage_id);
      return `${project?.title} / ${stage?.name}`;
    }
    return project?.title || 'Unknown Project';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shared Storage</h2>
          <p className="text-gray-600">All project files and documents in one place</p>
        </div>
        {user?.role !== 'client' && (
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files, projectId || projects[0]?.id || '')}
            />
          </label>
        )}
      </div>

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
    </div>
  );
}