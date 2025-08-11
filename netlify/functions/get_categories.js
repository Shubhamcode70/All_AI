const { MongoClient } = require("mongodb")

// MongoDB connection - established outside handler for reuse
const uri =
  process.env.MONGODB_URI || "mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority"
const client = new MongoClient(uri)
const clientPromise = client.connect()

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

    // Connect to database
    const client = await clientPromise
    const db = client.db("ai_tools_db")
    const collection = db.collection("tools")

    // Get distinct categories
    const categories = await collection.distinct("category")

    // Sort categories alphabetically
    categories.sort()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: JSON.stringify({
        categories: categories,
      }),
    }
  } catch (error) {
    console.error("Error in get_categories:", error)
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
