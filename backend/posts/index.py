import json
import os
import jwt
import psycopg2
import boto3
import base64
import uuid
from typing import Dict, Any

def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, os.environ['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except:
        return None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API постов: создание, получение, лайки, комментарии
    Args: event - HTTP запрос
          context - контекст функции
    Returns: Данные постов или результат операции
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    token = headers.get('x-auth-token') or headers.get('X-Auth-Token')
    
    user_payload = verify_token(token) if token else None
    
    if not user_payload and method != 'GET':
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            user_id = params.get('user_id')
            limit = int(params.get('limit', '20'))
            offset = int(params.get('offset', '0'))
            
            if user_id:
                cursor.execute("""
                    SELECT p.id, p.caption, p.media_type, p.media_urls, p.likes_count, 
                           p.comments_count, p.shares_count, p.location, p.created_at,
                           u.id, u.username, u.full_name, u.avatar_url
                    FROM posts p
                    JOIN users u ON p.user_id = u.id
                    WHERE p.user_id = %s
                    ORDER BY p.created_at DESC
                    LIMIT %s OFFSET %s
                """, (user_id, limit, offset))
            else:
                cursor.execute("""
                    SELECT p.id, p.caption, p.media_type, p.media_urls, p.likes_count, 
                           p.comments_count, p.shares_count, p.location, p.created_at,
                           u.id, u.username, u.full_name, u.avatar_url
                    FROM posts p
                    JOIN users u ON p.user_id = u.id
                    WHERE p.is_public = TRUE
                    ORDER BY p.created_at DESC
                    LIMIT %s OFFSET %s
                """, (limit, offset))
            
            rows = cursor.fetchall()
            posts = []
            
            for row in rows:
                posts.append({
                    'id': row[0],
                    'caption': row[1],
                    'media_type': row[2],
                    'media_urls': row[3] or [],
                    'likes_count': row[4],
                    'comments_count': row[5],
                    'shares_count': row[6],
                    'location': row[7],
                    'created_at': row[8].isoformat() if row[8] else None,
                    'author': {
                        'id': row[9],
                        'username': row[10],
                        'full_name': row[11],
                        'avatar_url': row[12]
                    }
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'posts': posts}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'create')
            
            if action == 'create':
                caption = body.get('caption', '')
                media_type = body.get('media_type')
                media_files = body.get('media_files', [])
                location = body.get('location', '')
                
                media_urls = []
                
                if media_files:
                    s3 = boto3.client('s3',
                        endpoint_url='https://bucket.poehali.dev',
                        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                    )
                    
                    for media_file in media_files:
                        file_data = base64.b64decode(media_file['data'])
                        file_ext = media_file.get('type', 'image/jpeg').split('/')[-1]
                        file_key = f"posts/{uuid.uuid4()}.{file_ext}"
                        
                        s3.put_object(
                            Bucket='files',
                            Key=file_key,
                            Body=file_data,
                            ContentType=media_file.get('type', 'image/jpeg')
                        )
                        
                        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
                        media_urls.append(cdn_url)
                
                cursor.execute("""
                    INSERT INTO posts (user_id, caption, media_type, media_urls, location)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, created_at
                """, (user_payload['user_id'], caption, media_type, media_urls, location))
                
                post = cursor.fetchone()
                
                cursor.execute("UPDATE users SET posts_count = posts_count + 1 WHERE id = %s", (user_payload['user_id'],))
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'post_id': post[0],
                        'created_at': post[1].isoformat(),
                        'media_urls': media_urls
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'like':
                post_id = body.get('post_id')
                
                cursor.execute(
                    "SELECT id FROM likes WHERE user_id = %s AND post_id = %s",
                    (user_payload['user_id'], post_id)
                )
                existing_like = cursor.fetchone()
                
                if existing_like:
                    cursor.execute("DELETE FROM likes WHERE id = %s", (existing_like[0],))
                    cursor.execute("UPDATE posts SET likes_count = likes_count - 1 WHERE id = %s", (post_id,))
                    liked = False
                else:
                    cursor.execute(
                        "INSERT INTO likes (user_id, post_id) VALUES (%s, %s)",
                        (user_payload['user_id'], post_id)
                    )
                    cursor.execute("UPDATE posts SET likes_count = likes_count + 1 WHERE id = %s", (post_id,))
                    liked = True
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'liked': liked}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()
