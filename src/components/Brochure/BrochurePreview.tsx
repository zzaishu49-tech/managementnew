import React from 'react';
import { BrochureProject, BrochurePage } from '../../types';
import { 
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface BrochurePreviewProps {
  project: BrochureProject;
  pages: BrochurePage[];
  currentPage: number;
  totalPages?: number;
}

export function BrochurePreview({ project, pages, currentPage, totalPages = 1 }: BrochurePreviewProps) {
  const page = pages.find(p => p.page_number === currentPage);
  const content = page?.content || {};

  const renderPage = () => (
    <div className="bg-white rounded-lg p-8 border border-gray-200 min-h-96">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Page {currentPage}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {project.client_name}'s Brochure
          </p>
        </div>

        {/* Text Content */}
        {content.body_content ? (
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.body_content }}>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No text content added yet</p>
          </div>
        )}

        {/* Images */}
        {content.images && content.images.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.images.map((image, index) => (
                <PreviewImage key={`${image}-${index}`} image={image} index={index} />
              ))}
            </div>
          </div>
        ) : content.body_content ? (
          <div className="text-center py-4 text-gray-400">
            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">No images added</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderEmptyPage = () => (
    <div className="bg-gray-50 rounded-lg p-12 border-2 border-dashed border-gray-300 min-h-96">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Page {currentPage} - Empty</h3>
        <p className="text-gray-600">
          Switch to edit mode to add content to this page
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-96">
      {content.body_content || (content.images && content.images.length > 0) ? renderPage() : renderEmptyPage()}
    </div>
  );
}

function PreviewImage({ image, index }: { image: string; index: number }) {
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);
  return (
    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200 relative">
      {!loaded && !errored && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
      {errored ? (
        <div className="w-full h-48 flex items-center justify-center text-sm text-red-600 bg-red-50">Image failed</div>
      ) : (
        <img
          src={image}
          alt={`Content image ${index + 1}`}
          className="w-full h-48 object-cover"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}