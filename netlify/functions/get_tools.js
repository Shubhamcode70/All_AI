const { MongoClient } = require("mongodb")

let cachedClient = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority"
  const client = new MongoClient(uri)

  try {
    await client.connect()
    cachedClient = client
    return client
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

exports.handler = async (event, context) => {
  try {
    // Handle CORS preflight
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
        body: "",
      }
    }

    // Parse query parameters
    const queryParams = event.queryStringParameters || {}
    const page = Number.parseInt(queryParams.page || "1")
    const search = (queryParams.search || "").trim()
    const category = (queryParams.category || "").trim()
    const sortBy = queryParams.sort || "recent"

    // Pagination settings
    const perPage = 20
    const skip = (page - 1) * perPage

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db("ai_tools_db")
    const collection = db.collection("tools")

    // Build query filter
    const queryFilter = {}

    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    if (category) {
      queryFilter.category = category
    }

    // Build sort criteria
    let sortCriteria = {}
    if (sortBy === "name") {
      sortCriteria = { name: 1 }
    } else {
      sortCriteria = { createdAt: -1 }
    }

    // Get total count for pagination
    const totalCount = await collection.countDocuments(queryFilter)
    const totalPages = Math.max(1, Math.ceil(totalCount / perPage))

    // Get tools with pagination
    const tools = await collection.find(queryFilter).sort(sortCriteria).skip(skip).limit(perPage).toArray()

    // Clean up the data
    const cleanTools = tools.map((tool) => {
      const { _id, ...cleanTool } = tool
      return cleanTool
    })

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        tools: cleanTools,
        total_count: totalCount,
        total_pages: totalPages,
        current_page: page,
        per_page: perPage,
      }),
    }
  } catch (error) {
    console.error("Error in get_tools:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        detail: error.message,
      }),
    }
  }
}
