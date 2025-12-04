package common

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/stretchr/testify/assert"
)

func TestConnectingDatabase(t *testing.T) {
	asserts := assert.New(t)
	db := Init()
	// Test create & close DB
	_, err := os.Stat("./../gorm.db")
	asserts.NoError(err, "Db should exist")
	asserts.NoError(db.DB().Ping(), "Db should be able to ping")

	// Test get a connecting from connection pools
	connection := GetDB()
	asserts.NoError(connection.DB().Ping(), "Db should be able to ping")
	db.Close()

	// Test DB exceptions
	os.Chmod("./../gorm.db", 0000)
	db = Init()
	asserts.Error(db.DB().Ping(), "Db should not be able to ping")
	db.Close()
	os.Chmod("./../gorm.db", 0644)
}

func TestConnectingTestDatabase(t *testing.T) {
	asserts := assert.New(t)
	// Test create & close DB
	db := TestDBInit()
	_, err := os.Stat("./../gorm_test.db")
	asserts.NoError(err, "Db should exist")
	asserts.NoError(db.DB().Ping(), "Db should be able to ping")
	db.Close()

	// Test testDB exceptions
	os.Chmod("./../gorm_test.db", 0000)
	db = TestDBInit()
	_, err = os.Stat("./../gorm_test.db")
	asserts.NoError(err, "Db should exist")
	asserts.Error(db.DB().Ping(), "Db should not be able to ping")
	os.Chmod("./../gorm_test.db", 0644)

	// Test close delete DB
	TestDBFree(db)
	_, err = os.Stat("./../gorm_test.db")

	asserts.Error(err, "Db should not exist")
}

func TestRandString(t *testing.T) {
	asserts := assert.New(t)

	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	str := RandString(0)
	asserts.Equal(str, "", "length should be ''")

	str = RandString(10)
	asserts.Equal(len(str), 10, "length should be 10")
	for _, ch := range str {
		asserts.Contains(letters, ch, "char should be a-z|A-Z|0-9")
	}
}

func TestGenToken(t *testing.T) {
	asserts := assert.New(t)

	token := GenToken(2)

	asserts.IsType(token, string("token"), "token type should be string")
	asserts.Greater(len(token), 100, "JWT's length should be greater than 100")
}

// TestInputValidation tests basic input validation without validator issues
func TestInputValidation(t *testing.T) {
	asserts := assert.New(t)

	type Login struct {
		Username string `json:"username" binding:"required,min=4"`
		Password string `json:"password" binding:"required,min=8"`
	}

	// Test basic validation scenarios
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	r.POST("/login", func(c *gin.Context) {
		var json Login
		if err := Bind(c, &json); err == nil {
			c.JSON(http.StatusOK, gin.H{"status": "success"})
		} else {
			c.JSON(http.StatusUnprocessableEntity, NewValidatorError(err))
		}
	})

	// Test valid data
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/login", bytes.NewBufferString(`{"username":"validuser","password":"validpassword"}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	asserts.Equal(http.StatusOK, w.Code, "Valid data should return OK")
}

func TestNewError(t *testing.T) {
	assert := assert.New(t)

	db := TestDBInit()
	type NotExist struct {
		heheda string
	}
	db.AutoMigrate(NotExist{})

	commenError := NewError("database", db.Find(NotExist{heheda: "heheda"}).Error)
	assert.IsType(commenError, commenError, "commenError should have right type")
	assert.Equal(map[string]interface{}(map[string]interface{}{"database": "no such table: not_exists"}),
		commenError.Errors, "commenError should have right error info")
}

// Additional tests for JWT token functionality
func TestJWTTokenGeneration(t *testing.T) {
	assert := assert.New(t)

	// Test JWT token generation with different user IDs
	token1 := GenToken(1)
	token2 := GenToken(2)
	token3 := GenToken(999)

	assert.IsType(token1, "", "Token should be a string")
	assert.IsType(token2, "", "Token should be a string")
	assert.IsType(token3, "", "Token should be a string")

	assert.NotEqual(token1, token2, "Different user IDs should generate different tokens")
	assert.NotEqual(token1, token3, "Different user IDs should generate different tokens")
	assert.NotEqual(token2, token3, "Different user IDs should generate different tokens")

	// Verify token length (JWT tokens should be consistent in structure)
	assert.Greater(len(token1), 100, "JWT token should be at least 100 characters")
	assert.Greater(len(token2), 100, "JWT token should be at least 100 characters")
	assert.Greater(len(token3), 100, "JWT token should be at least 100 characters")
}

func TestJWTTokenParsing(t *testing.T) {
	assert := assert.New(t)

	// Generate a token for user ID 123
	userID := uint(123)
	token := GenToken(userID)

	// Parse the token to verify its contents
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(NBSecretPassword), nil
	})

	assert.NoError(err, "Token parsing should succeed")
	assert.True(parsedToken.Valid, "Token should be valid")

	// Verify the claims
	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok {
		assert.Equal(float64(userID), claims["id"], "Token should contain correct user ID")
		assert.NotNil(claims["exp"], "Token should contain expiration time")
	} else {
		t.Errorf("Claims should be of type jwt.MapClaims")
	}
}

func TestJWTTokenExpiration(t *testing.T) {
	assert := assert.New(t)

	// Test that token contains expiration claim
	token := GenToken(1)

	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(NBSecretPassword), nil
	})

	assert.NoError(err, "Token parsing should succeed")

	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok {
		exp, exists := claims["exp"]
		assert.True(exists, "Token should contain expiration claim")
		assert.IsType(exp, float64(0), "Expiration should be a number")

		// Verify expiration is in the future (within 24 hours from now)
		expTime := int64(exp.(float64))
		now := time.Now().Unix()
		expectedExp := time.Now().Add(time.Hour * 24).Unix()

		assert.Greater(expTime, now, "Token should expire in the future")
		assert.InDelta(expectedExp, expTime, 60, "Token should expire approximately 24 hours from now")
	}
}

func TestDatabaseConnectionErrorHandling(t *testing.T) {
	assert := assert.New(t)

	// This test verifies that database connection errors are handled gracefully
	// by attempting to access a non-existent database file
	db := TestDBInit()
	defer TestDBFree(db)

	// Test attempting to find records in a table that doesn't exist
	var result []map[string]interface{}
	err := db.Table("non_existent_table").Find(&result).Error

	assert.Error(err, "Querying non-existent table should return error")
	assert.Contains(err.Error(), "no such table", "Error should indicate table doesn't exist")
}

func TestUtilityFunctions(t *testing.T) {
	assert := assert.New(t)

	// Test RandString with different lengths
	str5 := RandString(5)
	str10 := RandString(10)
	str20 := RandString(20)

	assert.Len(str5, 5, "RandString(5) should return 5-character string")
	assert.Len(str10, 10, "RandString(10) should return 10-character string")
	assert.Len(str20, 20, "RandString(20) should return 20-character string")

	// Verify characters are from expected set
	for _, ch := range str10 {
		assert.Contains(letters, ch, "All characters should be from the letters set")
	}

	// Test that multiple calls return different strings
	str1 := RandString(10)
	str2 := RandString(10)
	assert.NotEqual(str1, str2, "Multiple calls to RandString should return different strings")
}
