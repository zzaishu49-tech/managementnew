import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { File, DownloadHistory } from '../../types';
import { 
  Download, 
  Search, 
  Filter, 
  FileText, 
  Image, 
  Video, 
  Archive, 
  Eye,
  Calendar,
  User,
  Tag,
  CheckSquare,
  FolderOpen,
  History,
  BarChart3,
  Settings,
  Trash2,
  Edit3
} from 'lucide-react';

export function DocumentDownloadCenter() {
  const { user } = useAuth();
  const { 
    files, 
    projects, 
    downloadFile, 
    downloadMultipleFiles, 
    getDownloadHistory,
    updateFileMetadata 
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showHistory, setShowHistory] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editMetadata, setEditMetadata] = useState({ description: '', tags: '', category: '' });

  // Get accessible files based on user role
  const accessibleFiles = useMemo(() => {
    let filteredFiles = files.filter(file => !file.is_archived);

    if (user?.role === 'employee') {
      const assignedProjects = projects.filter(p => p.assigned_employees.includes(user.id));
      filteredFiles = filteredFiles.filter(f => assignedProjects.some(p => p.id === f.project_id));
    }

    return filteredFiles;
  }, [files, projects, user]);

  // Apply filters
  const filteredFiles = useMemo(() => {
    return accessibleFiles.filter(file => {
      const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
      const matchesFileType = selectedFileType === 'all' || file.file_type === selectedFileType;
      const matchesProject = selectedProject === 'all' || file.project_id === selectedProject;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const fileDate = new Date(file.timestamp);
        const now = new Date();
        const daysAgo = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        matchesDate = fileDate >= cutoffDate;
      }

      return matchesSearch && matchesCategory && matchesFileType && matchesProject && matchesDate;
    });
  }, [accessibleFiles, searchTerm, selectedCategory, selectedFileType, selectedProject, dateRange]);

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

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'reference': return 'bg-blue-100 text-blue-800';
      case 'content': return 'bg-green-100 text-green-800';
      case 'assets': return 'bg-purple-100 text-purple-800';
      case 'requirements': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(f => f.id));
    }
  };

  const handleBulkDownload = () => {
    if (selectedFiles.length > 0) {
      downloadMultipleFiles(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const handleEditMetadata = (file: File) => {
    setEditingFile(file);
    setEditMetadata({
      description: file.description || '',
      tags: file.tags?.join(', ') || '',
      category: file.category || 'other'
    });
  };

  const saveMetadata = () => {
    if (!editingFile) return;
    
    updateFileMetadata(editingFile.id, {
      description: editMetadata.description,
      tags: editMetadata.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      category: editMetadata.category as any
    });
    
    setEditingFile(null);
  };

  const downloadHistory = getDownloadHistory();
  const uniqueCategories = [...new Set(accessibleFiles.map(f => f.category).filter(Boolean))];
  const uniqueFileTypes = [...new Set(accessibleFiles.map(f => f.file_type))];
  const accessibleProjects = user?.role === 'manager' 
    ? projects 
    : projects.filter(p => p.assigned_employees.includes(user?.id || ''));

  const getThemeColors = () => {
    switch (user?.role) {
      case 'manager': return {
        primary: 'bg-blue-600 hover:bg-blue-700',
        secondary: 'bg-blue-50 border-blue-200',
        text: 'text-blue-600',
        border: 'border-blue-600'
      };
      case 'employee': return {
        primary: 'bg-green-600 hover:bg-green-700',
        secondary: 'bg-green-50 border-green-200',
        text: 'text-green-600',
        border: 'border-green-600'
      };
      default: return {
        primary: 'bg-gray-600 hover:bg-gray-700',
        secondary: 'bg-gray-50 border-gray-200',
        text: 'text-gray-600',
        border: 'border-gray-600'
      };
    }
  };

  const theme = getThemeColors();

  if (showHistory) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Download History</h2>
            <p className="text-gray-600">Track your document download activity</p>
          </div>
          <button
            onClick={() => setShowHistory(false)}
            className={`${theme.primary} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            Back to Documents
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloaded By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {downloadHistory.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{entry.file_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entry.downloader_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(entry.download_date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatFileSize(entry.file_size)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Download Center</h2>
          <p className="text-gray-600">Access and download client-provided documents for design work</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <History className="w-4 h-4" />
            <span>Download History</span>
          </button>
          {selectedFiles.length > 0 && (
            <button
              onClick={handleBulkDownload}
              className={`${theme.primary} text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2`}
            >
              <Download className="w-4 h-4" />
              <span>Download Selected ({selectedFiles.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900">{accessibleFiles.length}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-3xl font-bold text-green-600">
                {accessibleFiles.reduce((sum, f) => sum + f.download_count, 0)}
              </p>
            </div>
            <Download className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">File Categories</p>
              <p className="text-3xl font-bold text-purple-600">{uniqueCategories.length}</p>
            </div>
            <Tag className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Downloads</p>
              <p className="text-3xl font-bold text-orange-600">
                {downloadHistory.filter(h => {
                  const downloadDate = new Date(h.download_date);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return downloadDate >= weekAgo;
                }).length}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>
                {category?.charAt(0).toUpperCase() + category?.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All File Types</option>
            {uniqueFileTypes.map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            {accessibleProjects.map(project => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <CheckSquare className="w-4 h-4" />
              <span>{selectedFiles.length === filteredFiles.length ? 'Deselect All' : 'Select All'}</span>
            </button>
            {selectedFiles.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedFiles.length} file(s) selected
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? theme.secondary : 'hover:bg-gray-100'}`}
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? theme.secondary : 'hover:bg-gray-100'}`}
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFiles.map(file => {
                  const project = projects.find(p => p.id === file.project_id);
                  return (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleFileSelect(file.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getFileIcon(file.file_type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                            {file.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{file.description}</div>
                            )}
                            {file.tags && file.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {file.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {tag}
                                  </span>
                                ))}
                                {file.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">+{file.tags.length - 3} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                          {file.category?.charAt(0).toUpperCase() + file.category?.slice(1) || 'Other'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {project?.title || 'Unknown Project'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {file.download_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>{new Date(file.timestamp).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">by {file.uploader_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadFile(file.id)}
                            className={`${theme.text} hover:opacity-75 transition-colors`}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {user?.role === 'manager' && (
                            <button
                              onClick={() => handleEditMetadata(file)}
                              className="text-gray-600 hover:text-gray-900 transition-colors"
                              title="Edit Metadata"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map(file => {
            const project = projects.find(p => p.id === file.project_id);
            return (
              <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleFileSelect(file.id)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadFile(file.id)}
                      className={`${theme.text} hover:opacity-75 transition-colors`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {getFileIcon(file.file_type)}
                  <span className="ml-2 font-medium text-gray-900 truncate">{file.filename}</span>
                </div>

                {file.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{file.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Category:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(file.category)}`}>
                      {file.category?.charAt(0).toUpperCase() + file.category?.slice(1) || 'Other'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Size:</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Downloads:</span>
                    <span>{file.download_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Project:</span>
                    <span className="truncate max-w-24">{project?.title || 'Unknown'}</span>
                  </div>
                </div>

                {file.tags && file.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {file.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{file.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewFile.filename}</h3>
                <p className="text-sm text-gray-600">{formatFileSize(previewFile.size)} • {previewFile.file_type.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                {getFileIcon(previewFile.file_type)}
                <p className="mt-4 text-gray-600">File preview not available</p>
                <p className="text-sm text-gray-500">Click download to view the file</p>
                <button
                  onClick={() => {
                    downloadFile(previewFile.id);
                    setPreviewFile(null);
                  }}
                  className={`mt-4 ${theme.primary} text-white px-6 py-2 rounded-lg font-medium transition-colors`}
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit File Metadata</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editMetadata.description}
                    onChange={(e) => setEditMetadata(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editMetadata.tags}
                    onChange={(e) => setEditMetadata(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="design, reference, assets"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editMetadata.category}
                    onChange={(e) => setEditMetadata(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="reference">Reference</option>
                    <option value="content">Content</option>
                    <option value="assets">Assets</option>
                    <option value="requirements">Requirements</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingFile(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveMetadata}
                  className={`flex-1 ${theme.primary} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}