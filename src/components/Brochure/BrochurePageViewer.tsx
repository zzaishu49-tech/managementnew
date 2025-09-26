import React from 'react';
import { BrochurePage, BrochureProject } from '../../types';
import { 
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface BrochurePageViewerProps {
  page: BrochurePage;
  project: BrochureProject;
}

export function BrochurePageViewer({ page, project }: BrochurePageViewerProps) {
  const content = page.content;

  const getStatusBadge = () => {
    const statusConfig = {
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200', text: 'Approved' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', text: 'Changes Requested' },
      pending: { icon: Clock, color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Pending Review' }
    };

    const config = statusConfig[page.approval_status || 'pending'];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span>{config.text}</span>
      </div>
    );
  };

  const renderPageContent = () => (
    <div className="bg-white rounded-lg p-8 border border-gray-200">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Page {page.page_number}
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
            <p>No text content provided</p>
          </div>
        )}

        {/* Images */}
        {content.images && content.images.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.images.map((image, index) => (
                <ViewerImage key={`${image}-${index}`} image={image} index={index} />
              ))}
            </div>
          </div>
        ) : content.text_content ? (
        ) : content.body_content ? (
          <div className="text-center py-4 text-gray-400">
            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">No images provided</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderEmptyPage = () => (
    <div className="bg-gray-50 rounded-lg p-12 border-2 border-dashed border-gray-300">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Page {page.page_number} - No Content</h3>
        <p className="text-gray-600">
          This page hasn't been filled out by the client yet
        </p>
      </div>
    </div>
  );

  const hasContent = () => {
    return content.body_content || (content.images && content.images.length > 0);
  };

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Page {page.page_number}
        </h3>
        {getStatusBadge()}
      </div>

      {/* Page Content */}
      <div className="min-h-96">
        {hasContent() ? renderPageContent() : renderEmptyPage()}
      </div>

      {/* Page Metadata */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <span>Last updated: {new Date(page.updated_at).toLocaleString()}</span>
          <span>Client: {project.client_name}</span>
        </div>
      </div>
    </div>
  );
}

function ViewerImage({ image, index }: { image: string; index: number }) {
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