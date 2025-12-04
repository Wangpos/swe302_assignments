# DAST CLI Commands for Screenshot Evidence

## Prerequisites - Start Applications First

```bash
# Terminal 1: Start Go Backend
cd /home/namgaywangchuk/Desktop/Fifth-Semester/swe302_assignments/golang-gin-realworld-example-app
go run main.go

# Terminal 2: Start React Frontend  
cd /home/namgaywangchuk/Desktop/Fifth-Semester/swe302_assignments/react-redux-realworld-example-app
npm start
```

**Verify applications are running:**
```bash
# Check backend
curl http://localhost:8080/api/health

# Check frontend
curl http://localhost:4100
```

---

## Task 3.1: Passive Scan Analysis  COMPLETED

```bash
cd /home/namgaywangchuk/Desktop/Fifth-Semester/swe302_assignments/Assignment2

# Frontend Passive Scan
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py \
  -t http://10.2.28.178:4100 \
  -J zap-passive-report.json \
  -H zap-passive-report.html

# Backend API Passive Scan
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py \
  -t http://10.2.28.178:8080 \
  -J zap-api-passive-report.json \
  -H zap-api-passive-report.html
```

**Screenshots to take:**
1. Terminal showing scan execution output
2. Generated HTML reports in browser
3. JSON report contents
4. File listing showing generated reports

---

## Task 3.2: Active Scan Analysis

### Step 1: Create Test User and Sample Data
```bash
cd /home/namgaywangchuk/Desktop/Fifth-Semester/swe302_assignments/Assignment2

# Make script executable
chmod +x create_test_data.sh

# Create test user and sample articles
./create_test_data.sh
```

### Step 2: Run Active Scan
```bash
# Active scan with authentication context
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-full-scan.py \
  -t http://10.2.28.178:4100 \
  -J zap-active-report.json \
  -H zap-active-report.html \
  -a

# Active scan for API endpoints
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-full-scan.py \
  -t http://10.2.28.178:8080/api \
  -J zap-api-active-report.json \
  -H zap-api-active-report.html \
  -a
```

**Screenshots to take:**
1. Test data creation script output
2. Active scan execution (will take 10-15 minutes)
3. Scan completion summary
4. Generated active scan reports

---

## Task 3.3: API Security Assessment

### Step 1: Test API Endpoints
```bash
# Get JWT token first
TOKEN=$(curl -s -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"security-test@example.com","password":"securepass123"}}' | \
  jq -r '.user.token')

echo "JWT Token: $TOKEN"

# Test authenticated endpoints
curl -H "Authorization: Token $TOKEN" http://localhost:8080/api/user
curl -H "Authorization: Token $TOKEN" http://localhost:8080/api/articles
curl -H "Authorization: Token $TOKEN" http://localhost:8080/api/articles/feed
```

### Step 2: API-Specific ZAP Scan
```bash
# Create OpenAPI/Swagger spec if available, or use direct API scanning
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py \
  -t http://10.2.28.178:8080/api \
  -J zap-api-security-report.json \
  -H zap-api-security-report.html

# Alternative: Full API scan with authentication
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py \
  -t http://10.2.28.178:8080/api \
  -J zap-api-baseline-report.json \
  -H zap-api-baseline-report.html
```

**Screenshots to take:**
1. JWT token generation
2. Authenticated API calls
3. API security scan execution
4. API-specific vulnerability reports

---

## Task 3.4: Complete DAST Implementation

### View All Generated Reports
```bash
# List all ZAP reports
ls -la *.html *.json

# View report summaries
echo "=== PASSIVE SCAN RESULTS ==="
grep -i "FAIL\|WARN\|PASS" zap-passive-report.html | head -5

echo "=== ACTIVE SCAN RESULTS ==="
grep -i "FAIL\|WARN\|PASS" zap-active-report.html | head -5

echo "=== API SCAN RESULTS ==="
grep -i "FAIL\|WARN\|PASS" zap-api-security-report.html | head -5
```

### Generate Summary Statistics
```bash
# Count vulnerabilities by type
echo "=== VULNERABILITY SUMMARY ==="
echo "Passive Scan Findings:"
cat zap-passive-report.json | jq '.site[0].alerts | length'

echo "Active Scan Findings:"
cat zap-active-report.json | jq '.site[0].alerts | length' 2>/dev/null || echo "No active scan completed yet"

echo "API Security Findings:"
cat zap-api-security-report.json | jq '.site[0].alerts | length' 2>/dev/null || echo "No API scan completed yet"
```

**Screenshots to take:**
1. File listing of all reports
2. Summary statistics output
3. Browser views of all HTML reports
4. Terminal showing scan completion confirmations

---

## Screenshot Organization

Create screenshots in this order:

### Task 3.1 Evidence:
- `task3.1-passive-scan-execution.png`
- `task3.1-frontend-report.png`
- `task3.1-backend-report.png`
- `task3.1-generated-files.png`

### Task 3.2 Evidence:
- `task3.2-test-data-creation.png`
- `task3.2-active-scan-start.png`
- `task3.2-active-scan-completion.png`
- `task3.2-active-reports.png`

### Task 3.3 Evidence:
- `task3.3-api-authentication.png`
- `task3.3-api-endpoints-test.png`
- `task3.3-api-security-scan.png`
- `task3.3-api-reports.png`

### Task 3.4 Evidence:
- `task3.4-all-reports-listing.png`
- `task3.4-vulnerability-summary.png`
- `task3.4-final-statistics.png`

---

## Commands to Execute in Order:

1. **Start both applications** (backend + frontend)
2. **Task 3.2**: Run active scans (since 3.1 is already done)
3. **Task 3.3**: Run API security tests
4. **Task 3.4**: Generate final summary
5. **Take screenshots** at each major step
6. **Update documentation** with findings

Run these commands and take screenshots as evidence for your assignment completion!
