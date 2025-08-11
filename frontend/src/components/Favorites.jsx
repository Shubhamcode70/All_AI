"use client"

import { Heart, ExternalLink } from "lucide-react"

const Favorites = ({ favorites, onToggleFavorite }) => {
  const handleToolClick = (tool) => {
    window.open(tool.link, "_blank", "noopener,noreferrer")
  }

  const handleRemoveFavorite = (e, tool) => {
    e.stopPropagation()
    onToggleFavorite(tool)
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Favorites</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">(0/5)</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Click the heart icon on any tool to add it to your favorites. You can save up to 5 tools.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-red-500 fill-current" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Favorites</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">({favorites.length}/5)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {favorites.map((tool, index) => (
          <div
            key={`fav-${tool.name}-${index}`}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors relative group"
            onClick={() => handleToolClick(tool)}
          >
            <button
              onClick={(e) => handleRemoveFavorite(e, tool)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Remove from favorites"
            >
              <Heart size={14} className="text-red-500 fill-current" />
            </button>

            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 pr-6 truncate">{tool.name}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
              {tool.description.length > 60 ? tool.description.substring(0, 60) + "..." : tool.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{tool.category}</span>
              <ExternalLink size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Favorites
