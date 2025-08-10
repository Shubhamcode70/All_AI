import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

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

        # Get database client
        client = await get_db_client()
        db = client.ai_tools_db
        collection = db.tools
        
        # Get distinct categories
        categories = await collection.distinct('category')
        
        # Sort categories alphabetically
        categories.sort()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({
                'categories': categories
            })
        }
        
    except Exception as e:
        print(f"Error in get_categories: {str(e)}")
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
