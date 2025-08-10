import json
import os
import base64
import csv
import io
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime
import re
import cgi # Import the cgi module
import sys # Import sys for stdin redirection

# MongoDB connection - using standard environment variable names
MONGODB_URI = os.environ.get('MONGODB_URI') or os.environ.get('MONGO_URI', 'mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority')
ADMIN_SECRET = os.environ.get('ADMIN_SECRET', 'MySuperSecureSecret')
client = None

async def get_db_client():
    global client
    if client is None:
        print("Attempting to connect to MongoDB...")
        client = AsyncIOMotorClient(MONGODB_URI)
        print("MongoDB client initialized.")
    return client

def validate_tool(tool):
    """Validate a single tool object"""
    errors = []
    
    # Check required fields
    if not tool.get('name', '').strip():
        errors.append('Name is required')
    
    if not tool.get('link', '').strip():
        errors.append('Link is required')
    elif not tool['link'].startswith('https://'):
        errors.append('Link must start with https://')
    
    if not tool.get('description', '').strip():
        errors.append('Description is required')
    elif len(tool['description']) > 300:
        errors.append('Description must be 300 characters or less')
    
    if not tool.get('category', '').strip():
        errors.append('Category is required')
    
    return errors

def parse_csv(file_content):
    """Parse CSV file content"""
    try:
        csv_reader = csv.DictReader(io.StringIO(file_content))
        tools = []
        for row in csv_reader:
            tool = {key.strip(): value.strip() for key, value in row.items() if key}
            if tool:
                tools.append(tool)
        return tools
    except Exception as e:
        raise ValueError(f"Invalid CSV format: {str(e)}")

def parse_json(file_content):
    """Parse JSON file content"""
    try:
        data = json.loads(file_content)
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return [data]
        else:
            raise ValueError("JSON must be an array of objects or a single object")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format: {str(e)}")

async def handler(event, context):
    print("add_tools function started.")
    try:
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            print("Handling OPTIONS request.")
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': ''
            }

        # Check admin secret
        headers = event.get('headers', {})
        admin_secret = headers.get('x-admin-secret') or headers.get('X-Admin-Secret')
        print(f"Received X-Admin-Secret: {admin_secret}")
        print(f"Expected ADMIN_SECRET: {ADMIN_SECRET}")
        if admin_secret != ADMIN_SECRET:
            print("Unauthorized: Invalid admin secret.")
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Unauthorized',
                    'detail': 'Invalid admin secret'
                })
            }
        
        # Check if body exists
        if not event.get('body'):
            print("Bad Request: No file uploaded (body is empty).")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Bad Request',
                    'detail': 'No file uploaded'
                })
            }
        
        # Get content type header
        content_type_header = headers.get('content-type') or headers.get('Content-Type')
        print(f"Content-Type header: {content_type_header}")
        if not content_type_header or not content_type_header.startswith('multipart/form-data'):
            print("Bad Request: Content-Type not multipart/form-data.")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Bad Request',
                    'detail': 'Content-Type must be multipart/form-data'
                })
            }

        # Decode body if it's base64 encoded
        if event.get('isBase64Encoded', False):
            print("Body is base64 encoded, decoding...")
            body_bytes = base64.b64decode(event['body'])
        else:
            print("Body is not base64 encoded, encoding to bytes...")
            body_bytes = event['body'].encode('utf-8') # Ensure it's bytes
        
        print(f"Body bytes length: {len(body_bytes)}")

        # Use cgi.FieldStorage to parse the multipart data
        body_stream = io.BytesIO(body_bytes)

        environ = {
            'REQUEST_METHOD': 'POST',
            'CONTENT_TYPE': content_type_header,
            'CONTENT_LENGTH': str(len(body_bytes)),
        }
        
        original_stdin = sys.stdin
        sys.stdin = body_stream

        file_item = None
        try:
            print("Attempting to parse multipart form data with cgi.FieldStorage...")
            form = cgi.FieldStorage(fp=body_stream, environ=environ, keep_blank_values=1)
            file_item = form.get('file')
            if file_item:
                print(f"File item found. Filename: {file_item.filename}, Content-Type: {file_item.type}")
            else:
                print("No file item found with name 'file'.")
        except Exception as e:
            print(f"Error during cgi.FieldStorage parsing: {str(e)}")
            raise # Re-raise to be caught by outer exception handler
        finally:
            sys.stdin = original_stdin # Restore stdin

        if not file_item or not file_item.file:
            print("Bad Request: No file content found in upload after parsing.")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Bad Request',
                    'detail': 'No file content found in upload'
                })
            }
        
        file_content = file_item.file.read().decode('utf-8')
        filename = file_item.filename
        print(f"Successfully extracted file: {filename}")
        
        # Parse file based on extension
        tools = []
        filename_lower = filename.lower()
        
        try:
            if filename_lower.endswith('.csv'):
                print("Parsing as CSV.")
                tools = parse_csv(file_content)
            elif filename_lower.endswith('.json'):
                print("Parsing as JSON.")
                tools = parse_json(file_content)
            else:
                print(f"Unsupported file format: {filename_lower}")
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Bad Request',
                        'detail': 'Unsupported file format. Use CSV or JSON.'
                    })
                }
        except ValueError as e:
            print(f"File parsing error: {str(e)}")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Bad Request',
                    'detail': str(e)
                })
            }
        
        if not tools:
            print("No valid tools found in file after parsing.")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Bad Request',
                    'detail': 'No valid tools found in file'
                })
            }
        
        # Validate tools
        valid_tools = []
        validation_errors = []
        
        print(f"Validating {len(tools)} tools...")
        for i, tool in enumerate(tools):
            errors = validate_tool(tool)
            if errors:
                validation_errors.append(f"Row {i+1}: {', '.join(errors)}")
            else:
                tool['createdAt'] = datetime.utcnow().isoformat()
                valid_tools.append(tool)
        
        if validation_errors:
            print(f"Validation errors found: {len(validation_errors)}")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Validation Error',
                    'detail': 'Validation errors found',
                    'errors': validation_errors
                })
            }
        
        # Get database client
        print("Connecting to database...")
        client = await get_db_client()
        db = client.ai_tools_db
        collection = db.tools
        
        # Insert tools (skip duplicates by name)
        added_count = 0
        skipped_count = 0
        
        print(f"Inserting {len(valid_tools)} valid tools into MongoDB...")
        for tool in valid_tools:
            existing = await collection.find_one({'name': tool['name']})
            if not existing:
                await collection.insert_one(tool)
                added_count += 1
            else:
                skipped_count += 1
        
        print(f"Tools processed successfully. Added: {added_count}, Skipped: {skipped_count}")
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Tools processed successfully',
                'added_count': added_count,
                'skipped_count': skipped_count,
                'total_processed': len(valid_tools)
            })
        }
        
    except Exception as e:
        print(f"Error in add_tools: {str(e)}")
        import traceback
        traceback.print_exc() # Print full traceback to logs
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
