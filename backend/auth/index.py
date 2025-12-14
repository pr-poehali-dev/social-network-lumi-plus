import json
import os
import jwt
import hashlib
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API аутентификации: регистрация, вход, проверка токенов
    Args: event - HTTP запрос с методом и телом
          context - контекст выполнения функции
    Returns: JWT токен или информация о пользователе
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'register':
                username = body.get('username')
                email = body.get('email')
                password = body.get('password')
                full_name = body.get('full_name', '')
                
                if not username or not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Username, email and password required'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                cursor.execute(
                    "INSERT INTO users (username, email, password_hash, full_name) VALUES (%s, %s, %s, %s) RETURNING id, username, email, full_name, role",
                    (username, email, password_hash, full_name)
                )
                user = cursor.fetchone()
                conn.commit()
                
                token = jwt.encode(
                    {
                        'user_id': user[0],
                        'username': user[1],
                        'role': user[4],
                        'exp': datetime.utcnow() + timedelta(days=30)
                    },
                    os.environ['JWT_SECRET_KEY'],
                    algorithm='HS256'
                )
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'token': token,
                        'user': {
                            'id': user[0],
                            'username': user[1],
                            'email': user[2],
                            'full_name': user[3],
                            'role': user[4]
                        }
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'login':
                email = body.get('email')
                password = body.get('password')
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email and password required'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                cursor.execute(
                    "SELECT id, username, email, full_name, role FROM users WHERE email = %s AND password_hash = %s",
                    (email, password_hash)
                )
                user = cursor.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid credentials'}),
                        'isBase64Encoded': False
                    }
                
                token = jwt.encode(
                    {
                        'user_id': user[0],
                        'username': user[1],
                        'role': user[4],
                        'exp': datetime.utcnow() + timedelta(days=30)
                    },
                    os.environ['JWT_SECRET_KEY'],
                    algorithm='HS256'
                )
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'token': token,
                        'user': {
                            'id': user[0],
                            'username': user[1],
                            'email': user[2],
                            'full_name': user[3],
                            'role': user[4]
                        }
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'verify':
                token = body.get('token')
                
                if not token:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Token required'}),
                        'isBase64Encoded': False
                    }
                
                try:
                    payload = jwt.decode(token, os.environ['JWT_SECRET_KEY'], algorithms=['HS256'])
                    
                    cursor.execute(
                        "SELECT id, username, email, full_name, role, avatar_url FROM users WHERE id = %s",
                        (payload['user_id'],)
                    )
                    user = cursor.fetchone()
                    
                    if not user:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'User not found'}),
                            'isBase64Encoded': False
                        }
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'valid': True,
                            'user': {
                                'id': user[0],
                                'username': user[1],
                                'email': user[2],
                                'full_name': user[3],
                                'role': user[4],
                                'avatar_url': user[5]
                            }
                        }),
                        'isBase64Encoded': False
                    }
                except jwt.ExpiredSignatureError:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Token expired'}),
                        'isBase64Encoded': False
                    }
                except jwt.InvalidTokenError:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid token'}),
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
