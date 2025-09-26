import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useData } from '../../context/DataContext';
import { BrochurePage } from '../../types';
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  FileText,
  Loader2,
  Download
} from 'lucide-react';

interface BrochurePageEditorProps {
  projectId: string;
  pageNumber: number;
  pageData: BrochurePage['content'];
  onDataChange: (data: BrochurePage['content']) => void;
  debouncedOnDataChange: (data: BrochurePage['content']) => void;
  isEditable?: boolean;
}

export function BrochurePageEditor({ 
  projectId, 
  pageNumber, 
  pageData, 
  onDataChange,
  debouncedOnDataChange,
  isEditable = true
}: BrochurePageEditorProps) {
  const { uploadBrochureImage } = useData();
  const [editorValue, setEditorValue] = useState<string>((pageData.body_content as string) || '');
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());
  const [lastPageNumber, setLastPageNumber] = useState(pageNumber);
  const [tempImages, setTempImages] = useState<Record<number, string>>({});
  const [localImages, setLocalImages] = useState<string[]>(Array.isArray(pageData.images) ? (pageData.images as string[]) : []);
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});

  // Only update editor value when page changes or when content is significantly different
  useEffect(() => {
    const newContent = (pageData.body_content as string) || '';
    
    // Update if page number changed (new page loaded) or if content is significantly different
    if (pageNumber !== lastPageNumber || (newContent !== editorValue && !editorValue)) {
      setEditorValue(newContent);
      setLastPageNumber(pageNumber);
    }
  }, [pageData, pageNumber, lastPageNumber, editorValue]);

  // Keep localImages in sync with persisted images when not uploading
  useEffect(() => {
    if (uploadingImages.size === 0) {
      const serverImages = Array.isArray(pageData.images) ? (pageData.images as string[]) : [];
      setLocalImages(serverImages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageData.images]);

  // Cleanup any created object URLs to avoid broken previews/memory leaks
  useEffect(() => {
    return () => {
      Object.values(tempImages).forEach((url) => {
        try { URL.revokeObjectURL(url); } catch { /* noop */ }
      });
    };
  }, [tempImages]);

  const handleNonTextChange = (field: string, value: any) => {
    if (!isEditable) return;
    const newData = { ...pageData, [field]: value };
    onDataChange(newData);
  };

  const handleEditorChange = (html: string) => {
    if (!isEditable) return;
    // Immediately update local editor state for smooth typing
    setEditorValue(html);
    // Use debounced save for text content to avoid conflicts
    const newData = { ...pageData, body_content: html };
    debouncedOnDataChange(newData);
  };

  const handleFileUpload = (file: File) => {
    if (!isEditable) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Show a local preview immediately to avoid flicker and compute a stable index
    const localUrl = URL.createObjectURL(file);
    let imageIndex = -1;
    setLocalImages(prev => {
      imageIndex = prev.length;
      const next = [...prev, localUrl];
      // Keep parent content in sync immediately so indices remain stable
      handleNonTextChange('images', next);
      return next;
    });
    // Apply related state using the computed index
    setTempImages(prev => ({ ...prev, [imageIndex]: localUrl }));
    setImageLoadStatus(prev => ({ ...prev, [imageIndex]: 'loading' }));
    setUploadingImages(prev => new Set(prev).add(imageIndex));
    
    // Upload to Supabase
    uploadBrochureImage(file, projectId)
      .then((url: string) => {
        // Replace temp image with real URL
        setLocalImages(prev => {
          const next = [...prev];
          next[imageIndex] = url;
          // Persist the new array to parent state
          handleNonTextChange('images', next);
          return next;
        });
        setTempImages(prev => {
          const copy = { ...prev };
          const oldUrl = copy[imageIndex];
          delete copy[imageIndex];
          if (oldUrl) {
            try { URL.revokeObjectURL(oldUrl); } catch { /* noop */ }
          }
          return copy;
        });
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageIndex);
          return newSet;
        });
        setImageLoadStatus(prev => ({ ...prev, [imageIndex]: 'loaded' }));
      })
      .catch((error: unknown) => {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageIndex);
          return newSet;
        });
        // Remove the temp preview on error
        setLocalImages(prev => prev.filter((_, i) => i !== imageIndex));
        setTempImages(prev => {
          const copy = { ...prev };
          const oldUrl = copy[imageIndex];
          delete copy[imageIndex];
          if (oldUrl) {
            try { URL.revokeObjectURL(oldUrl); } catch { /* noop */ }
          }
          return copy;
        });
        setImageLoadStatus(prev => {
          const next = { ...prev };
          delete next[imageIndex];
          return next;
        });
      });
  };

  const removeImage = (index: number) => {
    if (!isEditable) return;
    const newImages = localImages.filter((_, i) => i !== index);
    handleNonTextChange('images', newImages);
    setTempImages(prev => {
      const copy = { ...prev };
      const oldUrl = copy[index];
      delete copy[index];
      if (oldUrl) {
        try { URL.revokeObjectURL(oldUrl); } catch { /* noop */ }
      }
      return copy;
    });
    setLocalImages(newImages);
    setImageLoadStatus(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `image-${index + 1}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${!isEditable ? 'opacity-60 pointer-events-none' : ''}`} data-project-id={projectId}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-red-600" />
        Page {pageNumber}
        {!isEditable && <span className="ml-2 text-sm text-yellow-600">(🔒 Locked)</span>}
      </h3>

      <div className="space-y-6">
        {/* Text Content Section */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Text Content
          </label>
          <ReactQuill
            theme="snow"
            value={editorValue}
            onChange={handleEditorChange}
            readOnly={!isEditable}
            modules={{
              toolbar: [
                ['bold', 'italic'],
                [{ list: 'bullet' }],
                ['clean']
              ],
              clipboard: {
                matchVisual: false
              }
            }}
            formats={['bold', 'italic', 'list', 'bullet']}
            className="bg-white border border-gray-300 rounded-lg min-h-[160px]"
          />
        </div>

        {/* Images Section */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            Images
          </label>
          
          {/* Existing Images */}
          {localImages.length > 0 && (
            <div className="space-y-3 mb-4">
              {localImages.map((image, index) => (
                <div key={`${image}-${index}`} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="w-16 h-16 rounded overflow-hidden relative bg-white">
                    {(imageLoadStatus[index] !== 'loaded') && (
                      <div className="absolute inset-0 animate-pulse bg-gray-200" />
                    )}
                    <img 
                      src={tempImages[index] || image} 
                      alt={`Image ${index + 1}`} 
                      className="w-16 h-16 object-cover"
                      onLoad={() => setImageLoadStatus(prev => ({ ...prev, [index]: 'loaded' }))}
                      onError={() => setImageLoadStatus(prev => ({ ...prev, [index]: 'error' }))}
                    />
                    {imageLoadStatus[index] === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-red-600 bg-red-50">Failed</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Image {index + 1}</p>
                  </div>
                  <button
                    onClick={() => downloadImage(tempImages[index] || image, index)}
                    className="text-blue-600 hover:text-blue-800 transition-colors p-1 mr-2"
                    title="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {isEditable && (
                    <button
                      onClick={() => removeImage(index)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {isEditable && (
            <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors`}>
              <label className="cursor-pointer">
                {uploadingImages.size > 0 ? (
                  <>
                    <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                    <p className="text-blue-600 mb-1">Uploading image...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-1">Click to upload image</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImages.size > 0}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = ''; // Reset input
                  }}
                />
              </label>
            </div>
          )}

          {!isEditable && localImages.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No images uploaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}