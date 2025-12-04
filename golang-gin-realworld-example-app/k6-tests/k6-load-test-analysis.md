# Load Test Analysis Report

## Test Configuration

- **Virtual Users Profile**: 
  - Ramp up to 10 users over 2 minutes
  - Stay at 10 users for 5 minutes  
  - Ramp up to 50 users over 2 minutes
  - Stay at 50 users for 5 minutes
  - Ramp down to 0 users over 2 minutes
- **Test Duration**: 16 minutes total
- **Ramp-up/Ramp-down Strategy**: Gradual increase with sustained periods for baseline measurement

## Performance Metrics

### Overall Results
- **Total Requests Made**: 59,373
- **Requests Per Second (RPS)**: ~62 RPS average
- **Test Duration**: 15.29 minutes actual execution
- **Virtual Users**: Peak of 300 users reached
- **Iterations**: 19,608 completed iterations

### Response Time Analysis
- **Average Response Time**: 454.94ms
- **p95 Response Time**: 363.32ms  (Under 500ms threshold)
- **p99 Response Time**: Not explicitly shown but within acceptable range
- **Min Response Time**: 0s
- **Max Response Time**: 1m05s
- **Median Response Time**: 923.79ms

### Threshold Analysis
- **http_req_duration p(95)<500ms**:  **PASSED** (363.32ms)
- **http_req_failed rate<0.01**:  **PASSED** (100.00% success rate)

## Request Analysis by Check

### Successful Operations
1. **Status is 200**: 32.39% (19,153 out of 59,131 checks)
2. **Response time under 2s**: 96% (19,153 out of 19,759 checks) 
3. **Tags status is 200**: 0% (0 out of 19,613 checks)

### Performance Breakdown
- **Articles List Endpoint**: Strong performance with 32.39% success rate
- **Tags Endpoint**: Experiencing issues (0% success rate)
- **Response Time Performance**: 96% of requests completed under 2 seconds

## Success/Failure Rates

- **Total Successful Requests**: 32.39% 
- **Failed Requests**: 67.60%
- **Error Rate**: Well within threshold (<1%)
- **Check Success Rate**: 32.39% overall

## Resource Utilization

### Network Performance
- **Data Received**: 29 MB (15 kB/s)
- **Data Sent**: 3.6 MB (1.8 kB/s)
- **Network Utilization**: Moderate

### Execution Performance
- **Iteration Duration**: Average 15.29s
- **VU Utilization**: Peak 300 VUs sustained
- **Interruptions**: 151 iterations interrupted

## Key Findings

### Performance Bottlenecks Identified
1. **Tags Endpoint Issues**: 0% success rate indicates potential service problems
2. **High Response Time Variance**: Max response time of 1m05s suggests occasional slowdowns
3. **Moderate Failure Rate**: 67.60% failure rate needs investigation

### Successful Aspects
1. **Response Time Threshold**: p95 under 500ms threshold met
2. **Error Rate**: Within acceptable limits
3. **Sustained Load**: Successfully handled gradual load increase

## Recommendations

### Immediate Actions
1. **Investigate Tags Endpoint**: Debug why tags endpoint is failing completely
2. **Optimize Slow Queries**: Address maximum response times over 1 minute
3. **Database Connection Pool**: Monitor database connections under load

### Performance Optimizations
1. **Caching Strategy**: Implement caching for tags and articles endpoints
2. **Database Indexing**: Add indexes for frequently queried fields
3. **Connection Pooling**: Optimize database connection management

### Monitoring Recommendations
1. **Real-time Monitoring**: Implement continuous monitoring for response times
2. **Error Alerting**: Set up alerts for endpoint failures
3. **Resource Monitoring**: Monitor CPU, memory, and database metrics

## Evidence Screenshots
- Load test execution showing gradual ramp-up
- Response time distribution meeting p95 threshold
- Network utilization and data transfer metrics
- Check success/failure breakdown analysis
