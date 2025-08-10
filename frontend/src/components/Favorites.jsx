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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Favorites</h2>
          <span className="text-sm text-gray-500">(0/5)</span>
        </div>
        <p className="text-gray-500 text-sm">
          Click the heart icon on any tool to add it to your favorites. You can save up to 5 tools.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-red-500 fill-current" />
        <h2 className="text-lg font-semibold text-gray-900">Favorites</h2>
        <span className="text-sm text-gray-500">({favorites.length}/5)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {favorites.map((tool, index) => (
          <div
            key={`fav-${tool.name}-${index}`}
            className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors relative group"
            onClick={() => handleToolClick(tool)}
          >
            <button
              onClick={(e) => handleRemoveFavorite(e, tool)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Remove from favorites"
            >
              <Heart size={14} className="text-red-500 fill-current" />
            </button>

            <h3 className="font-medium text-gray-900 text-sm mb-1 pr-6 truncate">{tool.name}</h3>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {tool.description.length > 60 ? tool.description.substring(0, 60) + "..." : tool.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 truncate">{tool.category}</span>
              <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Favorites
