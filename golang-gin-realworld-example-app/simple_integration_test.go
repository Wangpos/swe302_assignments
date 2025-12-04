package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"realworld-backend/articles"
	"realworld-backend/users"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// setupTestApp creates a test application with all routes
func setupTestApp() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	v1 := r.Group("/api")
	users.UsersRegister(v1.Group("/users"))
	v1.Use(users.AuthMiddleware(false))
	articles.ArticlesAnonymousRegister(v1.Group("/articles"))
	articles.TagsAnonymousRegister(v1.Group("/tags"))

	v1.Use(users.AuthMiddleware(true))
	users.UserRegister(v1.Group("/user"))
	users.ProfileRegister(v1.Group("/profiles"))
	articles.ArticlesRegister(v1.Group("/articles"))

	return r
}

// Test 1: User Registration
func TestUserRegistrationIntegration(t *testing.T) {
	testApp := setupTestApp()

	requestBody := `{
		"user": {
			"username": "testuser1",
			"email": "test1@example.com",
			"password": "testpassword"
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBufferString(requestBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "user")
}

// Test 2: User Login
func TestUserLoginIntegration(t *testing.T) {
	testApp := setupTestApp()

	// First register
	registerBody := `{
		"user": {
			"username": "testuser2",
			"email": "test2@example.com",
			"password": "testpassword"
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBufferString(registerBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Then login
	loginBody := `{
		"user": {
			"email": "test2@example.com",
			"password": "testpassword"
		}
	}`

	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/users/login", bytes.NewBufferString(loginBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// Test 3: Invalid Login
func TestInvalidLoginIntegration(t *testing.T) {
	testApp := setupTestApp()

	requestBody := `{
		"user": {
			"email": "invalid@example.com",
			"password": "wrongpassword"
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users/login", bytes.NewBufferString(requestBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// Test 4: Get Articles
func TestGetArticlesIntegration(t *testing.T) {
	testApp := setupTestApp()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/articles", nil)
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "articles")
}

// Test 5: Get Tags
func TestGetTagsIntegration(t *testing.T) {
	testApp := setupTestApp()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/tags", nil)
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "tags")
}

// Test 6: Create Article with Authentication
func TestCreateArticleIntegration(t *testing.T) {
	testApp := setupTestApp()

	// Register user first
	registerBody := `{
		"user": {
			"username": "articleuser",
			"email": "articleuser@example.com",
			"password": "password123"
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBufferString(registerBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Extract token
	var registerResponse map[string]map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &registerResponse)
	assert.NoError(t, err)

	token := registerResponse["user"]["token"].(string)

	// Create article
	articleBody := `{
		"article": {
			"title": "Test Article",
			"description": "Test Description",
			"body": "Test Body",
			"tagList": ["test"]
		}
	}`

	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/articles", bytes.NewBufferString(articleBody))
	req.Header.Set("Authorization", "Token "+token)
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
}

// Test 7: Unauthorized Article Creation
func TestUnauthorizedArticleCreationIntegration(t *testing.T) {
	testApp := setupTestApp()

	articleBody := `{
		"article": {
			"title": "Unauthorized Article",
			"description": "Should fail",
			"body": "No auth",
			"tagList": ["fail"]
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/articles", bytes.NewBufferString(articleBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// Test 8: Get Current User
func TestGetCurrentUserIntegration(t *testing.T) {
	testApp := setupTestApp()

	// Register user
	registerBody := `{
		"user": {
			"username": "currentuser",
			"email": "current@example.com",
			"password": "password123"
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBufferString(registerBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Extract token
	var registerResponse map[string]map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &registerResponse)
	assert.NoError(t, err)

	token := registerResponse["user"]["token"].(string)

	// Get current user
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/user", nil)
	req.Header.Set("Authorization", "Token "+token)
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// Test 9: Update User Profile
func TestUpdateUserProfileIntegration(t *testing.T) {
	testApp := setupTestApp()

	// Register user
	registerBody := `{
		"user": {
			"username": "updateuser",
			"email": "update@example.com",
			"password": "password123"
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBufferString(registerBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Extract token
	var registerResponse map[string]map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &registerResponse)
	assert.NoError(t, err)

	token := registerResponse["user"]["token"].(string)

	// Update profile
	updateBody := `{
		"user": {
			"bio": "Updated bio"
		}
	}`

	w = httptest.NewRecorder()
	req, _ = http.NewRequest("PUT", "/api/user", bytes.NewBufferString(updateBody))
	req.Header.Set("Authorization", "Token "+token)
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// Test 10: Get User Profile
func TestGetUserProfileIntegration(t *testing.T) {
	testApp := setupTestApp()

	// Register user
	registerBody := `{
		"user": {
			"username": "profileuser",
			"email": "profile@example.com",
			"password": "password123"
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBufferString(registerBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Extract token
	var registerResponse map[string]map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &registerResponse)
	assert.NoError(t, err)

	token := registerResponse["user"]["token"].(string)

	// Get profile
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/profiles/profileuser", nil)
	req.Header.Set("Authorization", "Token "+token)
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// Test 11: Follow User
func TestFollowUserIntegration(t *testing.T) {
	testApp := setupTestApp()

	// Register first user
	registerBody1 := `{
		"user": {
			"username": "followee",
			"email": "followee@example.com",
			"password": "password123"
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBufferString(registerBody1))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	// Register second user
	registerBody2 := `{
		"user": {
			"username": "follower",
			"email": "follower@example.com",
			"password": "password123"
		}
	}`

	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/users", bytes.NewBufferString(registerBody2))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	// Extract token
	var registerResponse map[string]map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &registerResponse)
	assert.NoError(t, err)

	token := registerResponse["user"]["token"].(string)

	// Follow user
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/profiles/followee/follow", nil)
	req.Header.Set("Authorization", "Token "+token)
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// Test 12: Invalid User Registration
func TestInvalidUserRegistrationIntegration(t *testing.T) {
	testApp := setupTestApp()

	requestBody := `{
		"user": {
			"username": "test",
			"email": "invalidemail",
			"password": "short"
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBufferString(requestBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnprocessableEntity, w.Code)
}

// Test 13: Unauthorized Access to Protected Endpoint
func TestUnauthorizedAccessIntegration(t *testing.T) {
	testApp := setupTestApp()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/user", nil)
	testApp.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// Test 14: Complete User-Article Workflow
func TestCompleteWorkflowIntegration(t *testing.T) {
	testApp := setupTestApp()

	// Register user
	registerBody := `{
		"user": {
			"username": "workflowuser",
			"email": "workflow@example.com",
			"password": "password123"
		}
	}`

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBufferString(registerBody))
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	// Extract token
	var registerResponse map[string]map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &registerResponse)
	assert.NoError(t, err)
	token := registerResponse["user"]["token"].(string)

	// Create article
	articleBody := `{
		"article": {
			"title": "Workflow Article",
			"description": "Workflow test",
			"body": "Complete workflow",
			"tagList": ["workflow"]
		}
	}`

	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/articles", bytes.NewBufferString(articleBody))
	req.Header.Set("Authorization", "Token "+token)
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	// Get article slug
	var articleResponse map[string]map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &articleResponse)
	assert.NoError(t, err)
	slug := articleResponse["article"]["slug"].(string)

	// Get the article
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/articles/"+slug, nil)
	testApp.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	// Add comment
	commentBody := `{
		"comment": {
			"body": "Test comment"
		}
	}`

	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/articles/"+slug+"/comments", bytes.NewBufferString(commentBody))
	req.Header.Set("Authorization", "Token "+token)
	req.Header.Set("Content-Type", "application/json")
	testApp.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	// Get comments
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/articles/"+slug+"/comments", nil)
	testApp.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

// Test 15: Multiple Endpoints Response Format
func TestMultipleEndpointsResponseFormat(t *testing.T) {
	testApp := setupTestApp()

	endpoints := []struct {
		method       string
		path         string
		expectedCode int
	}{
		{"GET", "/api/articles", http.StatusOK},
		{"GET", "/api/tags", http.StatusOK},
	}

	for _, endpoint := range endpoints {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest(endpoint.method, endpoint.path, nil)
		testApp.ServeHTTP(w, req)

		assert.Equal(t, endpoint.expectedCode, w.Code, "Failed for %s %s", endpoint.method, endpoint.path)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err, "Response should be valid JSON for %s %s", endpoint.method, endpoint.path)
	}
}
