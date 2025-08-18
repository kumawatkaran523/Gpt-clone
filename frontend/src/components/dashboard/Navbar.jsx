import { useState, useRef, useEffect } from "react";
import {
  Search,
  User,
  LogOut,
  X,
  Image as ImageIcon,
  Folder,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({
  user,
  onSearch,
  searchQuery,
  searchResults = [],
  isSearching,
  onNavigateToFolder,
  onImageClick,
}) => {
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "");
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        onSearch(localSearchQuery);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [localSearchQuery, searchQuery, onSearch]);

  useEffect(() => {
    setShowSearchResults(
      (searchQuery.length > 0 && (searchResults.length > 0 || isSearching)) ||
        (localSearchQuery.length > 0 && localSearchQuery !== searchQuery)
    );
  }, [searchQuery, searchResults, isSearching, localSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (!event.target.closest(".user-menu")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearchQuery);
  };

  const clearSearch = () => {
    setLocalSearchQuery("");
    onSearch("");
    setShowSearchResults(false);
  };

  const handleImageResultClick = (image, event) => {
    console.log("Image result clicked:", image);

    const clickedElement = event.target.closest("[data-action]");
    const action = clickedElement?.getAttribute("data-action");

    if (action === "navigate-to-folder") {
      console.log("Navigating to folder for image:", image);
      if (onNavigateToFolder) {
        onNavigateToFolder(image);
      } else {
        console.error("onNavigateToFolder prop is not provided");
      }
    } else {
      console.log("Opening image:", image);
      if (onImageClick) {
        onImageClick(image);
      }
    }

    setShowSearchResults(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-white"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-3.5-3.5L12 18l-3.5-3.5L3 15" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PicStore
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Visual Asset Manager
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.length > 0) setShowSearchResults(true);
                  }}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
                {localSearchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {showSearchResults && (
              <div
                ref={resultsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto z-50"
              >
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {searchResults.length} image
                      {searchResults.length !== 1 ? "s" : ""} found
                    </div>
                    {searchResults.map((image) => (
                      <div
                        key={image._id}
                        className="flex items-center space-x-3 px-3 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <button
                          onClick={(e) => handleImageResultClick(image, e)}
                          className="flex items-center space-x-3 flex-1 text-left"
                        >
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                              <img
                                src={image.cloudinaryUrl}
                                alt={image.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {image.name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{formatFileSize(image.size)}</span>
                              <span>•</span>
                              <span className="capitalize">
                                {image.mimetype?.split("/")[1] || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </button>

                        {(image.folderName || image.folderId) && (
                          <button
                            onClick={(e) => handleImageResultClick(image, e)}
                            data-action="navigate-to-folder"
                            className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title={`Go to folder: ${
                              image.folderName || "Folder"
                            }`}
                          >
                            <Folder className="h-3 w-3" />
                            <span>{image.folderName || "Go to folder"}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length > 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <ImageIcon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">
                      No images found for "{searchQuery}"
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.name || user?.email}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
