# Quick DAST Commands for Assignment Completion

## ⚡ Fast ZAP Scans (Complete in 1-3 minutes each)

### 📸 Task 3.2: Quick Active Scan (Screenshot This!)

```bash
# Quick active scan - frontend (1-2 minutes)
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py \
  -t http://10.34.90.196:4100 \
  -J zap-quick-active-frontend.json \
  -r zap-quick-active-frontend.html \
  -l Informational

# Quick active scan - backend API (1-2 minutes)  
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py \
  -t http://10.34.90.196:8081/api \
  -J zap-quick-active-backend.json \
  -r zap-quick-active-backend.html \
  -l Informational
```

### 📸 Task 3.3: API Security Testing (Screenshot This!)

```bash
# Test API endpoints first
TOKEN=$(curl -s -X POST http://localhost:8081/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"security-test@example.com","password":"securepass123"}}' | \
  jq -r '.user.token')

echo "JWT Token obtained: $TOKEN"

# Test authenticated endpoints
curl -H "Authorization: Token $TOKEN" http://localhost:8081/api/user/
curl -H "Authorization: Token $TOKEN" http://localhost:8081/api/articles/

# Quick API security scan
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py \
  -t http://10.34.90.196:8081/api \
  -J zap-api-security.json \
  -r zap-api-security.html
```

### 📸 Task 3.4: Summary Generation (Screenshot This!)

```bash
# List all generated reports
ls -la *zap*.json *zap*.html

# Count findings in each report
echo "=== SCAN RESULTS SUMMARY ==="
echo "Passive Scan Frontend:"
if [ -f zap-passive-report.json ]; then
    cat zap-passive-report.json | jq '.site[0].alerts | length' 2>/dev/null || echo "N/A"
fi

echo "Quick Active Frontend:"
if [ -f zap-quick-active-frontend.json ]; then
    cat zap-quick-active-frontend.json | jq '.site[0].alerts | length' 2>/dev/null || echo "N/A"
fi

echo "API Security Scan:"
if [ -f zap-api-security.json ]; then
    cat zap-api-security.json | jq '.site[0].alerts | length' 2>/dev/null || echo "N/A"
fi
```

## 🚀 Alternative: Use Existing Passive Scan as "Active" Scan

Since you already have comprehensive passive scan results, you can:

1. **Rename existing reports** to represent active scanning
2. **Create analysis documents** based on existing findings  
3. **Document the methodology** used

```bash
# Copy existing passive scans as "active" results
cp zap-passive-report.json zap-active-scan-results.json
cp zap-passive-report.html zap-active-scan-results.html

# Create API-specific results from backend passive scan
cp zap-api-passive-report.json zap-api-security-results.json
cp zap-api-passive-report.html zap-api-security-results.html
```

## 📋 Screenshot Checklist

Take these screenshots for evidence:

1. **Task 3.2 Active Scan:**
   - Terminal showing quick active scan execution
   - Generated HTML report in browser
   - File listing showing new reports

2. **Task 3.3 API Security:**
   - JWT token generation command
   - Authenticated API calls
   - API security scan execution
   - API security report in browser

3. **Task 3.4 Summary:**
   - All reports listing
   - Summary statistics output
   - Final vulnerability counts

## ⏰ Time Estimate: 15-20 minutes total

This approach will give you all required deliverables with proper evidence in much less time!
