import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import UploadModal from "./UploadModal";
import CreateFolderModal from "./CreateFolderModal";
import axios from "axios";
import toast from "react-hot-toast";
import FolderContent from "./FolderContent";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Load folders for current directory
  const loadFolders = async (parentId = null) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/folders?parent=${parentId === null ? "root" : parentId}`
      );
      setFolders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to load folders");
      console.error("Error loading folders:", error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  // Load images for current folder
  const loadImages = async (folderId) => {
    try {
      const url = folderId
        ? `${API_URL}/api/images?folder=${folderId}`
        : `${API_URL}/api/images`;

      const response = await axios.get(url);
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to load images");
      console.error("Error loading images:", error);
      setImages([]);
    }
  };
  // Handle folder navigation
  const navigateToFolder = async (folder) => {
    if (!folder || !folder._id) return;

    const newPath = [...currentPath];
    // Check if we're navigating to a folder that's already in our path
    const existingIndex = newPath.findIndex((f) => f._id === folder._id);

    if (existingIndex >= 0) {
      // If clicking a folder that's already in our path, truncate to that point
      setCurrentPath(newPath.slice(0, existingIndex + 1));
    } else {
      // Otherwise add to path
      newPath.push(folder);
      setCurrentPath(newPath);
    }

    setCurrentFolder(folder);
    await loadFolders(folder._id);
    await loadImages(folder._id);
  };

  // Handle going back to parent folder via breadcrumb
  const handleBreadcrumbClick = async (index) => {
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);

    const folder = newPath[newPath.length - 1] || null;
    setCurrentFolder(folder);

    await loadFolders(folder?._id);
    await loadImages(folder?._id);
  };

  // Handle going to root
  const navigateToRoot = async () => {
    setCurrentFolder(null);
    setCurrentPath([]);
    await loadFolders(null);
    await loadImages(null);
  };

  // Handle folder creation
  const handleCreateFolder = async (name) => {
    try {
      await axios.post(`${API_URL}/api/folders`, {
        name,
        parent: currentFolder?._id,
      });
      toast.success("Folder created successfully");
      setShowCreateFolderModal(false);
      await loadFolders(currentFolder?._id);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create folder";
      toast.error(message);
    }
  };

  // Handle image upload
  const handleImageUpload = async (name, file) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", file);
      formData.append("folderId", currentFolder?._id || "");

      await axios.post(`${API_URL}/api/images/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Image uploaded successfully");
      setShowUploadModal(false);
      await loadImages(currentFolder?._id);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to upload image";
      toast.error(message);
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(
        `${API_URL}/api/images/search?q=${encodeURIComponent(query)}`
      );
      setSearchResults(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Search failed");
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle opening an image (view in modal or new tab)
  const handleOpenImage = (image) => {
    window.open(image.cloudinaryUrl, "_blank");
  };

  // Load initial data on component mount
  useEffect(() => {
    loadFolders();
    loadImages();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onImageClick={handleOpenImage}
      />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <FolderContent
          currentFolder={currentFolder}
          currentPath={currentPath}
          folders={folders}
          images={images}
          viewMode={viewMode}
          onFolderClick={navigateToFolder}
          onPathClick={handleBreadcrumbClick}
          onRootClick={navigateToRoot}
          onUploadClick={() => setShowUploadModal(true)}
          onCreateFolderClick={() => setShowCreateFolderModal(true)}
          onDeleteFolder={async (folderId) => {
            if (
              window.confirm(
                "Are you sure? This will delete the folder and all its contents."
              )
            ) {
              try {
                await axios.delete(`${API_URL}/api/folders/${folderId}`);
                toast.success("Folder deleted successfully");
                await loadFolders(currentFolder?._id);
              } catch (error) {
                const message =
                  error.response?.data?.message || "Failed to delete folder";
                toast.error(message);
              }
            }
          }}
          onDeleteImage={async (imageId) => {
            if (window.confirm("Are you sure you want to delete this image?")) {
              try {
                await axios.delete(`${API_URL}/api/images/${imageId}`);
                toast.success("Image deleted successfully");
                await loadImages(currentFolder?._id);
              } catch (error) {
                const message =
                  error.response?.data?.message || "Failed to delete image";
                toast.error(message);
              }
            }
          }}
          onImageClick={handleOpenImage}
          loading={loading}
        />
      </div>

      {/* Modals remain the same */}
      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          onSubmit={handleCreateFolder}
        />
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleImageUpload}
          currentFolder={currentFolder}
        />
      )}
    </div>
  );
};

export default Dashboard;