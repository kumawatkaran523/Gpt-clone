import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Info,
} from "lucide-react";

const ImageModal = ({
  image,
  images = [],
  onClose,
  onNext,
  onPrevious,
  onDelete,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentIndex = images.findIndex((img) => img._id === image._id);
  const hasNext = currentIndex < images.length - 1;
  const hasPrevious = currentIndex > 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext) handleNext();
      if (e.key === "ArrowLeft" && hasPrevious) handlePrevious();
      if (e.key === "+") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "r") handleRotate();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [hasNext, hasPrevious, zoom]);

  const handleNext = () => {
    if (hasNext) {
      const nextImage = images[currentIndex + 1];
      onNext(nextImage);
      resetView();
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevImage = images[currentIndex - 1];
      onPrevious(prevImage);
      resetView();
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setLoading(true);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image.cloudinaryUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${image.name}.${image.mimetype?.split("/")[1] || "jpg"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      await onDelete(image._id);

      // Navigate to next/previous image or close modal
      if (hasNext) {
        handleNext();
      } else if (hasPrevious) {
        handlePrevious();
      } else {
        onClose();
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent text-white z-10">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium truncate max-w-md">
            {image.name}
          </h3>
          <span className="text-sm text-gray-300">
            {currentIndex + 1} of {images.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            title="Toggle info"
          >
            <Info className="h-5 w-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-600/20 text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Navigation Buttons */}
        {hasPrevious && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
            title="Previous (←)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {hasNext && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
            title="Next (→)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Image */}
        <div className="max-w-full max-h-full overflow-hidden flex items-center justify-center">
          <img
            src={image.cloudinaryUrl}
            alt={image.name}
            className="max-w-full max-h-full object-contain transition-all duration-300 ease-in-out"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              filter: loading ? "blur(5px)" : "none",
            }}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center space-x-2 bg-black/50 rounded-lg p-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.25}
            className="p-2 text-white rounded hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="text-white text-sm px-2 min-w-[4rem] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-2 text-white rounded hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-white/30 mx-2"></div>

          <button
            onClick={handleRotate}
            className="p-2 text-white rounded hover:bg-white/20 transition-colors"
            title="Rotate (R)"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={resetView}
            className="p-2 text-white rounded hover:bg-white/20 transition-colors"
            title="Reset view"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-20 right-4 bg-black/80 text-white rounded-lg p-4 max-w-xs">
          <h4 className="font-medium mb-3">Image Details</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-300">Name:</span>
              <span className="ml-2">{image.name}</span>
            </div>
            <div>
              <span className="text-gray-300">Size:</span>
              <span className="ml-2">{formatFileSize(image.size)}</span>
            </div>
            <div>
              <span className="text-gray-300">Type:</span>
              <span className="ml-2 capitalize">
                {image.mimetype?.split("/")[1] || "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-gray-300">Uploaded:</span>
              <span className="ml-2">{formatDate(image.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageModal;
