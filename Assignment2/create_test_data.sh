#!/bin/bash

# Create test user for ZAP security testing
# Test Credentials for ZAP Context:
# Email: security-test@example.com
# Password: SecurePass123!
# Username: securitytest

BASE_URL="http://localhost:8081"

echo "=== Creating Test User for ZAP Security Testing ==="

# Register test user
echo "Registering test user..."
REGISTER_RESPONSE=$(curl -X POST $BASE_URL/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "security-test@example.com",
      "password": "SecurePass123!",
      "username": "securitytest"
    }
  }' -s -w "%{http_code}")

echo "Registration response: $REGISTER_RESPONSE"

# Login to get token
echo "Logging in to get authentication token..."
LOGIN_RESPONSE=$(curl -X POST $BASE_URL/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "security-test@example.com",
      "password": "SecurePass123!"
    }
  }' -s)

echo "Login response: $LOGIN_RESPONSE"

# Extract token 
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data['user']['token'])
except:
    print('Failed to extract token')
")

echo "Authentication token: $TOKEN"

if [ "$TOKEN" != "Failed to extract token" ] && [ -n "$TOKEN" ]; then
    echo "=== Creating Sample Articles ==="
    
    # Create article 1
    echo "Creating article 1..."
    curl -X POST $BASE_URL/api/articles/ \
      -H "Content-Type: application/json" \
      -H "Authorization: Token $TOKEN" \
      -d '{
        "article": {
          "title": "Security Testing Article 1",
          "description": "This is a test article for security testing with ZAP",
          "body": "This article contains test content for DAST security testing. It includes various elements that might be vulnerable to XSS or other attacks. <script>alert('\''test'\'')</script>",
          "tagList": ["security", "testing", "zap", "dast"]
        }
      }' -s

    echo -e "\n"

    # Create article 2
    echo "Creating article 2..."
    curl -X POST $BASE_URL/api/articles/ \
      -H "Content-Type: application/json" \
      -H "Authorization: Token $TOKEN" \
      -d '{
        "article": {
          "title": "API Security Analysis",
          "description": "Testing API endpoints for security vulnerabilities",
          "body": "This article tests API security including authentication, authorization, and input validation. Test data: '\''DROP TABLE users;--",
          "tagList": ["api", "security", "sql-injection", "test"]
        }
      }' -s

    echo -e "\n"

    # Create article 3
    echo "Creating article 3..."
    curl -X POST $BASE_URL/api/articles/ \
      -H "Content-Type: application/json" \
      -H "Authorization: Token $TOKEN" \
      -d '{
        "article": {
          "title": "XSS Testing Article",
          "description": "Article designed to test XSS vulnerabilities",
          "body": "Testing XSS: <img src=x onerror=alert('\''XSS'\'')> and other payloads like <iframe src=javascript:alert('\''iframe-xss'\'')></iframe>",
          "tagList": ["xss", "testing", "javascript", "security"]
        }
      }' -s

    echo -e "\n"
    echo "=== Sample articles created successfully ==="
else
    echo "Failed to get authentication token. Using existing data."
fi

echo ""
echo "=== ZAP TESTING CREDENTIALS ==="
echo "Email: security-test@example.com"
echo "Password: SecurePass123!"
echo "Username: securitytest"
echo "Token: $TOKEN"
echo ""
echo "=== ENDPOINTS FOR TESTING ==="
echo "Frontend URL: http://localhost:4100"
echo "Backend API: http://localhost:8080/api"
echo "Login Endpoint: http://localhost:8080/api/users/login"
echo "Articles Endpoint: http://localhost:8080/api/articles/"
echo "Tags Endpoint: http://localhost:8080/api/tags/"
