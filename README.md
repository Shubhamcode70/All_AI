# All-in-One AI Tools Hub

A complete, production-ready AI tools directory web application built with React frontend and Python FastAPI backend, deployed as Netlify serverless functions with MongoDB Atlas database.

## Features

- **Public Tool Directory**: Browse, search, filter, and sort AI tools
- **Favorites System**: Save up to 5 favorite tools (persisted in localStorage)
- **Admin Panel**: Bulk upload tools via CSV, JSON, or XLSX files
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Search**: Debounced search with instant results
- **Category Filtering**: Dynamic category filter populated from database
- **Pagination**: 20 tools per page with navigation controls

## Tech Stack

- **Frontend**: React 18 + TailwindCSS + Vite
- **Backend**: Python FastAPI (Netlify Functions)
- **Database**: MongoDB Atlas
- **Deployment**: Netlify
- **Icons**: Lucide React

## Project Structure

\`\`\`
/
├── frontend/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json        # Frontend dependencies only
│   ├── vite.config.js
│   └── tailwind.config.js
├── netlify/
│   └── functions/          # Python serverless functions
│       ├── get_tools.py
│       ├── get_categories.py
│       ├── add_tools.py
│       └── requirements.txt
├── netlify.toml           # Netlify configuration
├── package.json          # Root package.json (minimal)
└── README.md
\`\`\`

## Environment Variables

Set these environment variables in your Netlify project settings:

\`\`\`ini
MONGODB_URI=mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority
ADMIN_SECRET=MySuperSecureSecret
NODE_VERSION=18
PYTHON_VERSION=3.9
\`\`\`

## Database Configuration

- **Cluster**: MongoDB Atlas (Cloud)
- **Database Name**: `ai_tools_db`
- **Collection Name**: `tools`
- **Connection URI**: `mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority`

### Database Schema

\`\`\`json
{
  "name": "Tool name (string, required)",
  "link": "Tool URL starting with https:// (string, required)",
  "description": "Tool description (string, max 300 chars, required)",
  "category": "Category name (string, required)",
  "createdAt": "ISO 8601 UTC timestamp (string, required)"
}
\`\`\`

## Deployment to Netlify

### Step-by-Step Deployment

1. **Push code to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Clean package.json and fix workspace dependencies"
   git push origin main
   \`\`\`

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your repository

3. **Configure Build Settings**
   - **Build command**: `cd frontend && npm ci && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Functions directory**: `netlify/functions`

4. **Set Environment Variables**
   Go to Site Settings → Environment Variables and add:
   \`\`\`
   MONGODB_URI=mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority
   ADMIN_SECRET=MySuperSecureSecret
   NODE_VERSION=18
   PYTHON_VERSION=3.9
   \`\`\`

5. **Deploy**
   - Click "Deploy site"
   - Your site will be available at `https://your-site-name.netlify.app`

### Alternative Build Configuration

If you still encounter issues, try these build settings in Netlify:

**Option 1 (Recommended):**
- Build command: `cd frontend && npm ci && npm run build`
- Publish directory: `frontend/dist`

**Option 2 (If Option 1 fails):**
- Build command: `npm run build`
- Publish directory: `frontend/dist`

**Option 3 (Manual approach):**
- Build command: `cd frontend && rm -rf node_modules package-lock.json && npm install && npm run build`
- Publish directory: `frontend/dist`

### Troubleshooting Build Issues

1. **Clear Build Cache**
   - In Netlify dashboard: Site Settings → Build & Deploy → Clear cache and retry deploy

2. **Check Node.js Version**
   - Ensure `NODE_VERSION=18` is set in environment variables

3. **Workspace Dependencies Error**
   - This should be fixed with the cleaned package.json files
   - If it persists, try Option 3 build command above

4. **Local Build Test**
   \`\`\`bash
   cd frontend
   npm ci
   npm run build
   ls -la dist/  # Should show built files
   \`\`\`

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Netlify CLI

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd ai-tools-hub
   \`\`\`

2. **Install frontend dependencies**
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

3. **Install Python dependencies for functions**
   \`\`\`bash
   pip install -r netlify/functions/requirements.txt
   \`\`\`

4. **Create environment file**
   Create a `.env` file in the root directory:
   \`\`\`ini
   MONGODB_URI=mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority
   ADMIN_SECRET=MySuperSecureSecret
   \`\`\`

5. **Start development server**
   \`\`\`bash
   # Install Netlify CLI if not already installed
   npm install -g netlify-cli
   
   # Start the development server
   netlify dev
   \`\`\`

## API Endpoints

### GET /api/get_tools
Retrieve paginated, filtered, and sorted tools.

### GET /api/get_categories
Get all unique categories from the database.

### POST /api/add_tools
Upload tools in bulk (Admin only).

## Admin Panel Usage

1. **Access**: Navigate to `/admin` on your deployed site
2. **Authentication**: Enter the admin secret (from environment variables)
3. **File Upload**: Supports CSV, JSON, and XLSX files

### File Format Examples

**CSV:**
\`\`\`csv
name,link,description,category
ChatGPT,https://chat.openai.com,AI-powered conversational assistant,Chatbot
DALL-E,https://openai.com/dall-e-2,AI image generation tool,Image Generation
\`\`\`

**JSON:**
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

## Key Features

- **Responsive Grid**: 4 columns (desktop), 2 (tablet), 1 (mobile)
- **Tool Cards**: Name (bold, 18px), truncated descriptions, color-coded categories
- **Favorites**: Up to 5 favorites stored in localStorage
- **Search**: Real-time, debounced search
- **Filters**: Dynamic category filtering and sorting
- **Pagination**: 20 tools per page
- **MongoDB Integration**: Motor async driver for optimal performance
- **File Upload**: Support for CSV, JSON, XLSX formats
- **Validation**: Comprehensive data validation

## License

This project is ready for production use. Modify as needed for your specific requirements.
