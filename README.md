# All-in-One AI Tools Hub

A complete, production-ready AI tools directory web application built with React frontend and Python FastAPI backend, deployed as Netlify serverless functions with MongoDB Atlas database.

## 🚀 Quick Deploy to Netlify

### 1. Push to GitHub
\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

### 2. Deploy to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Build settings will be auto-detected from `netlify.toml`
5. Set environment variables (see below)
6. Click "Deploy site"

### 3. Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables, add:

\`\`\`
MONGODB_URI=mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority
ADMIN_SECRET=MySuperSecureSecret
NODE_VERSION=18
PYTHON_VERSION=3.9
\`\`\`

## ✅ What's Included

- **Frontend**: React 18 + TailwindCSS + Vite
- **Backend**: Python FastAPI (Netlify Functions)
- **Database**: MongoDB Atlas integration
- **Features**: Search, filters, pagination, favorites, admin upload
- **Responsive**: Works on desktop, tablet, mobile
- **Production Ready**: No placeholders, complete functionality

## 📁 Project Structure

\`\`\`
/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Home and Admin pages
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── netlify/
│   └── functions/          # Python serverless functions
│       ├── get_tools.py
│       ├── get_categories.py
│       ├── add_tools.py
│       └── requirements.txt
├── netlify.toml           # Netlify configuration
└── README.md
\`\`\`

## 🔧 Local Development

\`\`\`bash
# Clone repository
git clone <your-repo-url>
cd ai-tools-hub

# Install frontend dependencies
cd frontend
npm install

# Install Python dependencies
pip install -r netlify/functions/requirements.txt

# Create .env file in root
echo "MONGODB_URI=mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority" > .env
echo "ADMIN_SECRET=MySuperSecureSecret" >> .env

# Start development server
npm install -g netlify-cli
netlify dev
\`\`\`

## 📊 Database Schema

\`\`\`json
{
  "name": "Tool name (string, required)",
  "link": "Tool URL starting with https:// (string, required)", 
  "description": "Tool description (string, max 300 chars, required)",
  "category": "Category name (string, required)",
  "createdAt": "ISO 8601 UTC timestamp (string, required)"
}
\`\`\`

## 📤 Admin Upload

1. Navigate to `/admin` on your deployed site
2. Enter admin secret (from environment variables)
3. Upload CSV or JSON files

### CSV Example:
\`\`\`csv
name,link,description,category
ChatGPT,https://chat.openai.com,AI-powered conversational assistant,Chatbot
DALL-E,https://openai.com/dall-e-2,AI image generation tool,Image Generation
\`\`\`

### JSON Example:
\`\`\`json
[
  {
    "name": "ChatGPT",
    "link": "https://chat.openai.com",
    "description": "AI-powered conversational assistant",
    "category": "Chatbot"
  }
]
\`\`\`

## 🎯 Features

- **Tool Directory**: Browse all AI tools with responsive grid
- **Search**: Real-time search by name and description
- **Filters**: Category filter and sorting options
- **Favorites**: Save up to 5 favorite tools (localStorage)
- **Pagination**: 20 tools per page
- **Admin Panel**: Bulk upload tools via CSV/JSON
- **Responsive**: 4 columns (desktop), 2 (tablet), 1 (mobile)

## 🔗 API Endpoints

- `GET /api/get_tools` - Get paginated, filtered tools
- `GET /api/get_categories` - Get all categories
- `POST /api/add_tools` - Upload tools (admin only)

## 📝 License

This project is ready for production use. Modify as needed for your requirements.
