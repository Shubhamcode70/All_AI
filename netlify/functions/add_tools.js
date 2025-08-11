const { MongoClient } = require("mongodb")
const multiparty = require("multiparty")

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
          "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: "",
      }
    }

    // Check admin secret
    const adminSecret = event.headers["x-admin-secret"] || event.headers["X-Admin-Secret"]
    const expectedSecret = process.env.ADMIN_SECRET || "MySuperSecureSecret"

    if (!adminSecret || adminSecret !== expectedSecret) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Unauthorized" }),
      }
    }

    // Parse multipart form data
    const form = new multiparty.Form()
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(event, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    if (!files.file || !files.file[0]) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "No file uploaded" }),
      }
    }

    const file = files.file[0]
    const fileContent = require("fs").readFileSync(file.path, "utf8")

    let tools = []

    // Parse file based on type
    if (file.originalFilename.endsWith(".json")) {
      tools = JSON.parse(fileContent)
    } else if (file.originalFilename.endsWith(".csv")) {
      const lines = fileContent.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim())

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        const tool = {}
        headers.forEach((header, index) => {
          tool[header] = values[index] || ""
        })
        if (tool.name && tool.link) {
          tools.push(tool)
        }
      }
    }

    if (!Array.isArray(tools) || tools.length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "No valid tools found in file" }),
      }
    }

    // Connect to database
    const client = await clientPromise
    const db = client.db("ai_tools_db")
    const collection = db.collection("tools")

    // Add createdAt timestamp to each tool
    const toolsWithTimestamp = tools.map((tool) => ({
      ...tool,
      createdAt: new Date().toISOString(),
    }))

    // Insert tools
    const result = await collection.insertMany(toolsWithTimestamp)

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Successfully added ${result.insertedCount} tools`,
        count: result.insertedCount,
      }),
    }
  } catch (error) {
    console.error("Error in add_tools:", error)
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
