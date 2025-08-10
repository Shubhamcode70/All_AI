"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Upload, Home, CheckCircle, XCircle } from "lucide-react"

const Admin = () => {
  const [file, setFile] = useState(null)
  const [adminSecret, setAdminSecret] = useState("")
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const allowedTypes = [
        "text/csv",
        "application/json",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ]

      if (
        allowedTypes.includes(selectedFile.type) ||
        selectedFile.name.endsWith(".csv") ||
        selectedFile.name.endsWith(".xlsx")
      ) {
        setFile(selectedFile)
        setMessage("")
      } else {
        setMessage("Please select a valid CSV, JSON, or XLSX file.")
        setMessageType("error")
        setFile(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setMessage("Please select a file to upload.")
      setMessageType("error")
      return
    }

    if (!adminSecret.trim()) {
      setMessage("Please enter the admin secret.")
      setMessageType("error")
      return
    }

    setUploading(true)
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/add_tools", {
        method: "POST",
        headers: {
          "X-Admin-Secret": adminSecret,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Success! Added ${data.added_count} tools to the database.`)
        setMessageType("success")
        setFile(null)
        setAdminSecret("")
        document.getElementById("file-input").value = ""
      } else {
        setMessage(data.detail || "Failed to upload tools.")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("Network error. Please try again.")
      setMessageType("error")
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home size={20} />
            Home
          </Link>
        </div>
        <p className="text-gray-600">Upload AI tools in bulk using CSV, JSON, or XLSX files.</p>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="admin-secret" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Secret
            </label>
            <input
              id="admin-secret"
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter admin secret"
              required
            />
          </div>

          <div>
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-input"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-input"
                      type="file"
                      className="sr-only"
                      accept=".csv,.json,.xlsx"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV, JSON, or XLSX files only</p>
                {file && <p className="text-sm text-green-600 font-medium">Selected: {file.name}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !file || !adminSecret}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              "Upload Tools"
            )}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 p-4 rounded-md flex items-center gap-2 ${
              messageType === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            {messageType === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {message}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-3">File Format Requirements</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Required fields:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>name (string, required)</li>
                <li>link (string, must start with https://, required)</li>
                <li>description (string, max 300 characters, required)</li>
                <li>category (string, required)</li>
              </ul>
            </div>
            <div>
              <strong>Supported formats:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>CSV with header row</li>
                <li>JSON array of objects</li>
                <li>XLSX with header row in first sheet</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
