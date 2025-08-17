import {
  ChevronRight,
  Home,
  Folder,
  Upload,
  Plus,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const FolderContent = ({
  currentFolder,
  currentPath = [],
  folders = [],
  images = [],
  viewMode,
  onFolderClick,
  onPathClick,
  onRootClick,
  onUploadClick,
  onCreateFolderClick,
  onDeleteFolder,
  onDeleteImage,
  onImageClick,
  loading,
}) => {
  const [showActionMenu, setShowActionMenu] = useState(null);
  const actionMenuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target)
      ) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteFolder = (folderId, e) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to delete this folder and all its contents?"
      )
    ) {
      onDeleteFolder(folderId);
      setShowActionMenu(null); // Close menu after deletion
    }
  };
  const toggleActionMenu = (folderId, e) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === folderId ? null : folderId);
  };
  return (
    <div className="py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-700">
        <button
          onClick={onRootClick}
          className="flex items-center hover:text-gray-900 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="ml-1">Home</span>
        </button>

        {currentPath.map((folder, index) => (
          <div key={folder._id} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <button
              onClick={() => onPathClick(index)}
              className="hover:text-gray-900 transition-colors"
            >
              {folder.name}
            </button>
          </div>
        ))}
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {currentFolder ? currentFolder.name : "My Folders"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {folders.length} {folders.length === 1 ? "folder" : "folders"},{" "}
            {images.length} {images.length === 1 ? "image" : "images"}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCreateFolderClick}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
          {currentFolder && (
            <button
              onClick={onUploadClick}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md bg-gray-800 text-white hover:bg-gray-700"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {loading ? (
          // Loading state
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : folders.length === 0 && images.length === 0 ? (
          // Empty state
          <div className="text-center py-12 border border-gray-200 rounded-lg">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentFolder ? "This folder is empty" : "No folders yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentFolder
                ? "Upload images or create subfolders to get started"
                : "Create your first folder to organize your images"}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={onCreateFolderClick}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Create Folder
              </button>
              {currentFolder && (
                <button
                  onClick={onUploadClick}
                  className="px-4 py-2 bg-gray-800 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                >
                  Upload Image
                </button>
              )}
            </div>
          </div>
        ) : (
          // Content display
          <div className="space-y-6">
            {/* Folders section */}
            {folders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Folders
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {folders.map((folder) => (
                    <div
                      key={folder._id}
                      className="group relative p-4 border border-gray-200 rounded-md hover:border-gray-300 cursor-pointer"
                      onClick={() => onFolderClick(folder)}
                    >
                      <div className="flex items-center space-x-3">
                        <Folder className="h-5 w-5 text-gray-600" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {folder.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Created {formatDate(folder.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-opacity"
                        onClick={(e) => toggleActionMenu(folder._id, e)}
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </button>
                      {showActionMenu === folder._id && (
                        <div
                          ref={actionMenuRef}
                          className="absolute top-8 right-2 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                        >
                          <button
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={(e) => handleDeleteFolder(folder._id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images section */}
            {images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Images
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div
                      key={image._id}
                      className="group relative border border-gray-200 rounded-md overflow-hidden hover:border-gray-300"
                      onClick={() => onImageClick(image)}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={image.cloudinaryUrl}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {image.name}
                        </h4>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>{Math.round(image.size / 1024)} KB</span>
                          <span>
                            {new Date(image.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderContent;
