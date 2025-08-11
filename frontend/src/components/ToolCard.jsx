"use client"

import { ExternalLink, Heart } from "lucide-react"

const categoryColors = {
  "AI Writing":
    "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200",
  "Image Generation":
    "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900 dark:to-purple-800 dark:text-purple-200",
  "Code Assistant":
    "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200",
  "Data Analysis":
    "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900 dark:to-yellow-800 dark:text-yellow-200",
  Chatbot: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200",
  Video:
    "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 dark:from-indigo-900 dark:to-indigo-800 dark:text-indigo-200",
  Audio:
    "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 dark:from-pink-900 dark:to-pink-800 dark:text-pink-200",
  Productivity:
    "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200",
  Research:
    "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900 dark:to-orange-800 dark:text-orange-200",
  Design:
    "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 dark:from-teal-900 dark:to-teal-800 dark:text-teal-200",
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
      className="gradient-card-light dark:gradient-card-dark rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 p-6 cursor-pointer relative group"
      onClick={handleCardClick}
    >
      <button
        className="favorite-btn absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          size={20}
          className={
            isFavorite
              ? "text-red-500 fill-current"
              : "text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
          }
        />
      </button>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pr-8">{tool.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {truncateDescription(tool.description)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tool.category)} shadow-sm`}
        >
          {tool.category}
        </span>

        <ExternalLink
          size={16}
          className="text-gray-400 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400 transition-colors"
        />
      </div>
    </div>
  )
}

export default ToolCard
