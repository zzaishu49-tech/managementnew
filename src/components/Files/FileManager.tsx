import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Upload, Download, FileText, Image, Video, Archive, Trash2 } from 'lucide-react';

interface FileManagerProps {
  stageId: string;
  canUpload?: boolean;
}

export function FileManager({ stageId, canUpload = true }: FileManagerProps) {
  const { user } = useAuth();
  const { files, uploadFileFromInput } = useData();
  const [dragActive, setDragActive] = useState(false);

  const stageFiles = files.filter(file => file.stage_id === stageId);

  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList || !canUpload) return;
    
    Array.from(fileList).forEach(file => {
      uploadFileFromInput(stageId, file, user?.name || 'Unknown');
    });
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
    
    if (e.dataTransfer.files && canUpload) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Files & Documents</h4>
        {canUpload && (
          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>
        )}
      </div>

      {/* Upload Area */}
      {canUpload && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-green-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
          <p className="text-xs text-gray-500">Supports all file types up to 10MB</p>
        </div>
      )}

      {/* Files List */}
      <div className="space-y-3">
        {stageFiles.map(file => (
          <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(file.filename)}
              <div>
                <p className="font-medium text-gray-900">{file.filename}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)} • Uploaded by {file.uploaded_by} • 
                  {new Date(file.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // In a real app, this would trigger file download
                  const link = document.createElement('a');
                  link.href = file.file_url;
                  link.download = file.filename;
                  link.click();
                }}
                className="text-green-600 hover:text-green-800 transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {stageFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No files uploaded yet</p>
            {canUpload && <p className="text-sm">Upload files to get started</p>}
          </div>
        )}
      </div>
    </div>
  );
}