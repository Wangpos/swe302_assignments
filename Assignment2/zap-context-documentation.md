# ZAP Context Configuration - Task 3.2 Setup

## Test User Credentials

**Created for security testing with OWASP ZAP:**

- **Email:** security-test@example.com
- **Password:** SecurePass123!
- **Username:** securitytest
- **Authentication Token:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjQ1MzU1MjMsImlkIjo4NX0.idYMO4XZRv1XIEh8EFzonJ6I-Qv-aej-SWADQNPGCVw

## Sample Articles Created

### 1. Security Testing Article 1
- **Title:** Security Testing Article 1
- **Slug:** security-testing-article-1
- **Description:** This is a test article for security testing with ZAP
- **Content:** Contains potential XSS payloads: `<script>alert('test')</script>`
- **Tags:** security, testing, zap, dast

### 2. API Security Analysis
- **Title:** API Security Analysis  
- **Slug:** api-security-analysis
- **Description:** Testing API endpoints for security vulnerabilities
- **Content:** Contains SQL injection test data: `'DROP TABLE users;--`
- **Tags:** api, security, sql-injection, test

### 3. XSS Testing Article
- **Title:** XSS Testing Article
- **Slug:** xss-testing-article
- **Description:** Article designed to test XSS vulnerabilities
- **Content:** Contains XSS payloads: `<img src=x onerror=alert('XSS')>` and `<iframe src=javascript:alert('iframe-xss')></iframe>`
- **Tags:** xss, testing, javascript, security

## ZAP Authentication Context Configuration

### Context Settings for ZAP:

1. **Context Name:** "Conduit Authenticated"

2. **Include in Context:**
   - `http://localhost:4100.*`
   - `http://localhost:8080/api.*`

3. **Authentication Configuration:**
   - **Method:** JSON-based authentication
   - **Login URL:** `http://localhost:8080/api/users/login`
   - **Login Request Body:**
     ```json
     {
       "user": {
         "email": "security-test@example.com",
         "password": "SecurePass123!"
       }
     }
     ```
   - **Token Extraction:** `user.token`
   - **Authentication Header:** `Authorization: Token {token}`

4. **Session Management:**
   - **Type:** HTTP Authentication Header
   - **Header Name:** Authorization
   - **Header Value Pattern:** `Token .*`

5. **User Configuration:**
   - **Username:** securitytest  
   - **Email:** security-test@example.com
   - **Password:** SecurePass123!

## Test Endpoints Available

### Frontend Endpoints:
- **Home:** http://localhost:4100
- **Login:** http://localhost:4100/login
- **Register:** http://localhost:4100/register
- **Articles:** http://localhost:4100/article/{slug}

### Backend API Endpoints:
- **Base API:** http://localhost:8080/api
- **User Registration:** POST /api/users/
- **User Login:** POST /api/users/login
- **Get Current User:** GET /api/user/ (requires auth)
- **List Articles:** GET /api/articles/
- **Create Article:** POST /api/articles/ (requires auth)
- **Get Article:** GET /api/articles/{slug}
- **Update Article:** PUT /api/articles/{slug} (requires auth)
- **Delete Article:** DELETE /api/articles/{slug} (requires auth)
- **Get Tags:** GET /api/tags/
- **Get Comments:** GET /api/articles/{slug}/comments
- **Create Comment:** POST /api/articles/{slug}/comments (requires auth)

## Security Testing Scenarios

The created test data includes:

1. **XSS Testing Vectors:**
   - Script tags in article content
   - Image onerror events
   - Iframe javascript: protocols

2. **SQL Injection Test Data:**
   - Single quote escaping
   - SQL comment injection
   - Table drop attempts

3. **Authentication Testing:**
   - Valid user credentials
   - JWT token authentication
   - Protected vs public endpoints

## Ready for ZAP Scanning

With this setup, you can now proceed with:

1. **Passive Scanning** - Basic vulnerability detection
2. **Active Scanning** - Authenticated testing with the created user
3. **API Security Testing** - Using the documented endpoints and test data

**Note:** The user account and articles are now ready for comprehensive DAST testing with OWASP ZAP.
