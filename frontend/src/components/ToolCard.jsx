"use client"
import { ExternalLink, Heart } from "lucide-react"

const categoryColors = {
  "AI Writing": "bg-blue-100 text-blue-800",
  "Image Generation": "bg-purple-100 text-purple-800",
  "Code Assistant": "bg-green-100 text-green-800",
  "Data Analysis": "bg-yellow-100 text-yellow-800",
  Chatbot: "bg-red-100 text-red-800",
  Video: "bg-indigo-100 text-indigo-800",
  Audio: "bg-pink-100 text-pink-800",
  Productivity: "bg-gray-100 text-gray-800",
  Research: "bg-orange-100 text-orange-800",
  Design: "bg-teal-100 text-teal-800",
}

const ToolCard = ({ tool, isFavorite, onToggleFavorite }) => {
  const truncateDescription = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + "..."
  }

  const getCategoryColor = (category) => {
    return categoryColors[category] || "bg-gray-100 text-gray-800"
  }

  const handleCardClick = (e) => {
    if (e.target.closest(".favorite-btn")) return
    window.open(tool.link, "_blank", "noopener,noreferrer")
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    onToggleFavorite(tool)
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer relative group"
      onClick={handleCardClick}
    >
      <button
        className="favorite-btn absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart size={20} className={isFavorite ? "text-red-500 fill-current" : "text-gray-400 hover:text-red-500"} />
      </button>

      <div className="mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2 pr-8">{tool.name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{truncateDescription(tool.description)}</p>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tool.category)}`}
        >
          {tool.category}
        </span>

        <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </div>
  )
}

export default ToolCard
