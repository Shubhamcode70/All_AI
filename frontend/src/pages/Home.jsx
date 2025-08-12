"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import ToolCard from "../components/ToolCard"
import SearchBar from "../components/SearchBar"
import Filters from "../components/Filters"
import Favorites from "../components/Favorites"
import { ChevronLeft, ChevronRight, Settings } from "lucide-react"

const Home = () => {
  const [tools, setTools] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [favorites, setFavorites] = useState([])
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    setFavorites(savedFavorites)

    const savedDarkMode = localStorage.getItem("darkMode")
    const defaultDarkMode = savedDarkMode !== null ? savedDarkMode === "true" : true
    setDarkMode(defaultDarkMode)

    // Apply dark mode immediately
    if (defaultDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchTools()
  }, [searchTerm, selectedCategory, sortBy, currentPage])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/get_categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const fetchTools = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        sort: sortBy,
      })

      const response = await fetch(`/api/get_tools?${params}`)
      if (!response.ok) throw new Error("Failed to fetch tools")

      const data = await response.json()
      setTools(data.tools || [])
      setTotalPages(data.total_pages || 1)
      setError(null)
    } catch (err) {
      setError("Failed to load tools. Please try again.")
      console.error("Error fetching tools:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSortChange = (sort) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const toggleFavorite = (tool) => {
    const newFavorites = [...favorites]
    const existingIndex = newFavorites.findIndex((fav) => fav.name === tool.name)

    if (existingIndex >= 0) {
      newFavorites.splice(existingIndex, 1)
    } else if (newFavorites.length < 5) {
      newFavorites.push(tool)
    } else {
      alert("You can only have 5 favorites. Remove one to add another.")
      return
    }

    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const isFavorite = (tool) => {
    return favorites.some((fav) => fav.name === tool.name)
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", newDarkMode.toString())

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              AI Orbit - All AI Apps Hub
            </h1>
            <div className="flex items-center gap-3">
              {/* <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span className="hidden sm:inline">{darkMode ? "Light" : "Dark"}</span>
              </button> */}
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Settings size={20} />
                Add Tools
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="flex gap-4">
              <Filters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
            </div>
          </div>

          <Favorites favorites={favorites} onToggleFavorite={toggleFavorite} />
        </header>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6 shadow-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 animate-pulse shadow-lg"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {tools.map((tool, index) => (
                <ToolCard
                  key={`${tool.name}-${index}`}
                  tool={tool}
                  isFavorite={isFavorite(tool)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {tools.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No tools found matching your criteria.</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-lg"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-lg"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home
