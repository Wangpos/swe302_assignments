package users

import (
	"net/http"
	"realworld-backend/common"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

// Extract token from Authorization header or access_token parameter
func extractTokenFromRequest(c *gin.Context) (string, error) {
	// First try Authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		// Should be a bearer token
		if len(authHeader) > 6 && strings.ToUpper(authHeader[0:6]) == "TOKEN " {
			return authHeader[6:], nil
		}
		return authHeader, nil
	}

	// Try access_token parameter
	tokenParam := c.Query("access_token")
	if tokenParam != "" {
		return tokenParam, nil
	}

	// Try from form data
	tokenForm := c.PostForm("access_token")
	if tokenForm != "" {
		return tokenForm, nil
	}

	return "", http.ErrNoCookie
}

// Parse and validate JWT token
func parseToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(common.NBSecretPassword), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, jwt.ErrInvalidKey
	}

	return token, nil
}

// A helper to write user_id and user_model to the context
func UpdateContextUserModel(c *gin.Context, my_user_id uint) {
	var myUserModel UserModel
	if my_user_id != 0 {
		db := common.GetDB()
		db.First(&myUserModel, my_user_id)
	}
	c.Set("my_user_id", my_user_id)
	c.Set("my_user_model", myUserModel)
}

// You can custom middlewares yourself as the doc: https://github.com/gin-gonic/gin#custom-middleware
//
//	r.Use(AuthMiddleware(true))
func AuthMiddleware(auto401 bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		UpdateContextUserModel(c, 0)

		tokenString, err := extractTokenFromRequest(c)
		if err != nil {
			if auto401 {
				c.AbortWithError(http.StatusUnauthorized, err)
			}
			return
		}

		token, err := parseToken(tokenString)
		if err != nil {
			if auto401 {
				c.AbortWithError(http.StatusUnauthorized, err)
			}
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			my_user_id := uint(claims["id"].(float64))
			UpdateContextUserModel(c, my_user_id)
		}
	}
}
