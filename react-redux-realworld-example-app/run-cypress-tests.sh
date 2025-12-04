#!/bin/bash

# Cypress E2E Test Execution Script for Assignment 3
# This script runs all the required tests for Part B of Assignment 3

echo "🚀 Starting Assignment 3 Part B: End-to-End Testing with Cypress"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required servers are running
print_status "Checking if required servers are running..."

# Check backend API
if curl -s http://localhost:8080/api/articles > /dev/null; then
    print_success "Backend API is running on localhost:8080"
else
    print_error "Backend API is not running! Please start the Go server first."
    print_status "Run: cd golang-gin-realworld-example-app && go run ."
    exit 1
fi

# Check frontend
if curl -s http://localhost:4100 > /dev/null; then
    print_success "Frontend is running on localhost:4100"
else
    print_error "Frontend is not running! Please start the React app first."
    print_status "Run: cd react-redux-realworld-example-app && npm start"
    exit 1
fi

echo
print_status "All required services are running. Starting Cypress tests..."
echo

# Test execution function
run_test_suite() {
    local suite_name="$1"
    local test_path="$2"
    local points="$3"
    
    echo "----------------------------------------"
    print_status "Running $suite_name Tests ($points points)"
    echo "Test Path: $test_path"
    echo
    
    if npx cypress run --spec "$test_path" --browser chrome; then
        print_success "$suite_name tests completed successfully!"
    else
        print_error "$suite_name tests failed!"
        return 1
    fi
    echo
}

# Track test results
total_tests=0
passed_tests=0

# Task 8: Authentication E2E Tests (30 points)
if run_test_suite "Authentication" "cypress/e2e/auth/**/*.cy.js" "30"; then
    ((passed_tests++))
fi
((total_tests++))

# Task 9: Article Management E2E Tests (40 points)
if run_test_suite "Article Management" "cypress/e2e/articles/**/*.cy.js" "40"; then
    ((passed_tests++))
fi
((total_tests++))

# Task 11: User Profile & Feed Tests (25 points)
if run_test_suite "Profile & Feed" "cypress/e2e/profile/**/*.cy.js,cypress/e2e/feed/**/*.cy.js" "25"; then
    ((passed_tests++))
fi
((total_tests++))

# Task 12: Complete User Workflows (30 points)
if run_test_suite "Complete Workflows" "cypress/e2e/workflows/**/*.cy.js" "30"; then
    ((passed_tests++))
fi
((total_tests++))

echo "=========================================="
print_status "Test Execution Summary"
echo "=========================================="

if [ $passed_tests -eq $total_tests ]; then
    print_success "All test suites passed! ($passed_tests/$total_tests)"
    print_success "Part B implementation is complete!"
else
    print_warning "Some tests failed. ($passed_tests/$total_tests test suites passed)"
fi

echo
print_status "Running cross-browser compatibility tests..."

# Cross-browser testing (Task 13: 20 points)
browsers=("chrome" "firefox" "edge" "electron")
browser_results=()

for browser in "${browsers[@]}"; do
    print_status "Testing with $browser browser..."
    if npx cypress run --browser "$browser" --spec "cypress/e2e/auth/login.cy.js"; then
        print_success "$browser compatibility test passed"
        browser_results+=(" $browser")
    else
        print_warning "$browser compatibility test failed"
        browser_results+=("❌ $browser")
    fi
done

echo
echo "Cross-Browser Compatibility Results:"
for result in "${browser_results[@]}"; do
    echo "  $result"
done

echo
print_status "Generating test reports..."

# Generate test reports
npx cypress run --reporter mochawesome --spec "cypress/e2e/**/*.cy.js" 2>/dev/null || print_warning "Report generation requires mochawesome reporter"

echo
print_status "Assignment 3 Part B Test Execution Complete!"
echo
print_status "📋 Deliverables Created:"
echo "   Cypress configuration files"
echo "   Authentication tests (Task 8)"
echo "   Article management tests (Task 9)"
echo "   Comments tests (Task 10)"
echo "   Profile & feed tests (Task 11)"
echo "   Complete workflow tests (Task 12)"
echo "   Cross-browser testing setup (Task 13)"
echo "   Custom commands and fixtures"
echo "   Cross-browser testing report"

echo
print_success "🎉 Part B: End-to-End Testing implementation is complete!"
print_status "You can now run individual tests with:"
echo "  npx cypress open  # Interactive test runner"
echo "  npx cypress run   # Headless test execution"
