import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { useState } from "react";

const ImageModal = ({ image, onClose, onDelete }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image.cloudinaryUrl;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col w-full max-w-4xl max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">{image.name}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
          <img
            src={image.cloudinaryUrl}
            alt={image.name}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease-in-out",
            }}
          />
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t flex items-center justify-between bg-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded"
              title="Rotate"
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
              title="Reset"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
