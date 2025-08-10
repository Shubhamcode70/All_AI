import json
import os
import base64
import csv
import io
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime
import re

# MongoDB connection - using standard environment variable names
MONGODB_URI = os.environ.get('MONGODB_URI') or os.environ.get('MONGO_URI', 'mongodb+srv://root:root12345@cluster0.mongodb.net/ai_tools_db?retryWrites=true&w=majority')
ADMIN_SECRET = os.environ.get('ADMIN_SECRET', 'MySuperSecureSecret')
client = None

async def get_db_client():
    global client
    if client is None:
        client = AsyncIOMotorClient(MONGODB_URI)
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
            # Clean up the row data
            tool = {key.strip(): value.strip() for key, value in row.items() if key}
            if tool:  # Skip empty rows
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

def parse_xlsx(file_content):
    """Parse XLSX file content"""
    try:
        import openpyxl
        from io import BytesIO
        
        workbook = openpyxl.load_workbook(BytesIO(file_content))
        sheet = workbook.active
        
        # Get header row
        headers = []
        for cell in sheet[1]:
            if cell.value:
                headers.append(str(cell.value).strip())
        
        if not headers:
            raise ValueError("No headers found in XLSX file")
        
        # Get data rows
        tools = []
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if any(cell is not None for cell in row):  # Skip empty rows
                tool = {}
                for i, value in enumerate(row):
                    if i < len(headers) and value is not None:
                        tool[headers[i]] = str(value).strip()
                if tool:
                    tools.append(tool)
        
        return tools
    except ImportError:
        raise ValueError("openpyxl library not available for XLSX parsing")
    except Exception as e:
        raise ValueError(f"Invalid XLSX format: {str(e)}")

async def handler(event, context):
    try:
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
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
        if admin_secret != ADMIN_SECRET:
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
        
        # Decode base64 body
        try:
            body = base64.b64decode(event['body'])
        except:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Bad Request',
                    'detail': 'Invalid request body'
                })
            }
        
        # Simple multipart parsing (for basic file upload)
        body_str = body.decode('utf-8', errors='ignore')
        
        # Extract file content and filename
        file_content = None
        filename = None
        
        # Look for file content between boundaries
        parts = body_str.split('------')
        for part in parts:
            if 'filename=' in part and 'Content-Type:' in part:
                lines = part.split('\n')
                for i, line in enumerate(lines):
                    if 'filename=' in line:
                        # Extract filename
                        filename_match = re.search(r'filename="([^"]+)"', line)
                        if filename_match:
                            filename = filename_match.group(1)
                    elif line.strip() == '' and i < len(lines) - 1:
                        # Content starts after empty line
                        file_content = '\n'.join(lines[i+1:]).strip()
                        # Remove trailing boundary markers
                        file_content = re.sub(r'------.*$', '', file_content, flags=re.MULTILINE).strip()
                        break
                break
        
        if not file_content or not filename:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Bad Request',
                    'detail': 'Could not extract file content'
                })
            }
        
        # Parse file based on extension
        tools = []
        filename_lower = filename.lower()
        
        try:
            if filename_lower.endswith('.csv'):
                tools = parse_csv(file_content)
            elif filename_lower.endswith('.json'):
                tools = parse_json(file_content)
            elif filename_lower.endswith('.xlsx'):
                # For XLSX, we need binary content
                file_content_binary = base64.b64decode(event['body'])
                # Extract binary content from multipart
                boundary_start = file_content_binary.find(b'\r\n\r\n')
                boundary_end = file_content_binary.rfind(b'\r\n------')
                if boundary_start != -1 and boundary_end != -1:
                    binary_content = file_content_binary[boundary_start+4:boundary_end]
                    tools = parse_xlsx(binary_content)
                else:
                    raise ValueError("Could not extract XLSX binary content")
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Bad Request',
                        'detail': 'Unsupported file format. Use CSV, JSON, or XLSX.'
                    })
                }
        except ValueError as e:
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
        
        for i, tool in enumerate(tools):
            errors = validate_tool(tool)
            if errors:
                validation_errors.append(f"Row {i+1}: {', '.join(errors)}")
            else:
                # Add timestamp
                tool['createdAt'] = datetime.utcnow().isoformat()
                valid_tools.append(tool)
        
        if validation_errors:
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
        client = await get_db_client()
        db = client.ai_tools_db
        collection = db.tools
        
        # Insert tools (skip duplicates by name)
        added_count = 0
        skipped_count = 0
        
        for tool in valid_tools:
            existing = await collection.find_one({'name': tool['name']})
            if not existing:
                await collection.insert_one(tool)
                added_count += 1
            else:
                skipped_count += 1
        
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
