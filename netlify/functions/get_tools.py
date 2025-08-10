import json
import os
from urllib.parse import parse_qs
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime
import re

# MongoDB connection - using standard environment variable names
MONGODB_URI = os.environ.get('MONGODB_URI') or os.environ.get('MONGO_URI', 'mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority')
client = None

async def get_db_client():
    global client
    if client is None:
        client = AsyncIOMotorClient(MONGODB_URI)
    return client

async def handler(event, context):
    try:
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS'
                },
                'body': ''
            }

        # Parse query parameters
        query_string = event.get('queryStringParameters') or {}
        
        # Extract parameters with defaults
        page = int(query_string.get('page', 1))
        search = (query_string.get('search') or '').strip()
        category = (query_string.get('category') or '').strip()
        sort_by = query_string.get('sort', 'recent')
        
        # Pagination settings
        per_page = 20
        skip = (page - 1) * per_page
        
        # Get database client
        client = await get_db_client()
        db = client.ai_tools_db
        collection = db.tools
        
        # Build query filter
        query_filter = {}
        
        if search:
            # Case-insensitive search in name and description
            search_regex = re.compile(re.escape(search), re.IGNORECASE)
            query_filter['$or'] = [
                {'name': search_regex},
                {'description': search_regex}
            ]
        
        if category:
            query_filter['category'] = category
        
        # Build sort criteria
        sort_criteria = []
        if sort_by == 'name':
            sort_criteria = [('name', 1)]  # A-Z
        else:  # recent
            sort_criteria = [('createdAt', -1)]  # Most recent first
        
        # Get total count for pagination
        total_count = await collection.count_documents(query_filter)
        total_pages = max(1, (total_count + per_page - 1) // per_page)
        
        # Get tools with pagination
        cursor = collection.find(query_filter).sort(sort_criteria).skip(skip).limit(per_page)
        tools = await cursor.to_list(length=per_page)
        
        # Convert ObjectId to string and format dates
        for tool in tools:
            if '_id' in tool:
                del tool['_id']
            if 'createdAt' in tool and isinstance(tool['createdAt'], str):
                try:
                    # Ensure createdAt is in ISO format
                    dt = datetime.fromisoformat(tool['createdAt'].replace('Z', '+00:00'))
                    tool['createdAt'] = dt.isoformat()
                except:
                    tool['createdAt'] = datetime.utcnow().isoformat()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({
                'tools': tools,
                'total_count': total_count,
                'total_pages': total_pages,
                'current_page': page,
                'per_page': per_page
            })
        }
        
    except Exception as e:
        print(f"Error in get_tools: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'detail': str(e)
            })
        }

def lambda_handler(event, context):
    return asyncio.run(handler(event, context))
