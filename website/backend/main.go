package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Database
	InitDB()

	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	hub := NewHub()

	// WebSocket endpoint (Go-owned realtime engine)
	r.GET("/ws", func(c *gin.Context) {
		serveWS(hub, c.Writer, c.Request)
	})

	eventRouter = NewEventRouter(DB, hub)

	// API Routes
	api := r.Group("/api")
	{
		// Events (Event-driven core)
		api.POST("/events", postEvents)

		// Cases
		api.GET("/cases", getCases)
		api.POST("/cases", createCase)
		api.GET("/stats", getStats)

		// Lawyers
		api.GET("/lawyers", getLawyers)
		api.POST("/lawyers/:id/status", updateLawyerStatus)
		api.GET("/lawyers/:id", getLawyerDetail)

		// Users (Admins)
		api.GET("/users", getUsers)
		api.POST("/users", createUser)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Go Backend running on port %s\n", port)
	r.Run(":" + port)
}

// --- Cases Handlers ---

func getCases(c *gin.Context) {
	var cases []Case
	query := DB.Model(&Case{})
	if status := c.Query("status"); status != "" && status != "All" {
		query = query.Where("status = ?", status)
	}
	if risk := c.Query("risk"); risk != "" && risk != "All" {
		query = query.Where("risk_level = ?", risk)
	}
	if category := c.Query("category"); category != "" && category != "All" {
		query = query.Where("category = ?", category)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ? OR case_id ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	query.Order("id desc").Find(&cases)
	c.JSON(http.StatusOK, cases)
}

func createCase(c *gin.Context) {
	var newCase Case
	if err := c.ShouldBindJSON(&newCase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := DB.Create(&newCase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create case"})
		return
	}
	go triggerN8N(newCase)
	c.JSON(http.StatusCreated, newCase)
}

func getStats(c *gin.Context) {
	var total, investigations, critical int64
	DB.Model(&Case{}).Count(&total)
	DB.Model(&Case{}).Where("status IN ?", []string{"Under Review", "Pending Investigation"}).Count(&investigations)
	DB.Model(&Case{}).Where("risk_level = ?", "Critical").Count(&critical)
	c.JSON(http.StatusOK, gin.H{"total": total, "active_investigations": investigations, "critical": critical})
}

// --- Lawyers Handlers ---

func getLawyers(c *gin.Context) {
	var lawyers []Lawyer
	query := DB.Model(&Lawyer{})
	if status := c.Query("status"); status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}
	query.Order("created_at desc").Find(&lawyers)

	// Fetch Stats
	var total, pending, approved, revision int64
	DB.Model(&Lawyer{}).Count(&total)
	DB.Model(&Lawyer{}).Where("status = ?", "Pending").Count(&pending)
	DB.Model(&Lawyer{}).Where("status = ?", "Approved").Count(&approved)
	DB.Model(&Lawyer{}).Where("status = ?", "Revision Required").Count(&revision)

	c.JSON(http.StatusOK, gin.H{
		"data": lawyers,
		"stats": gin.H{
			"total":    total,
			"pending":  pending,
			"approved": approved,
			"revision": revision,
		},
	})
}

func getLawyerDetail(c *gin.Context) {
	id := c.Param("id")
	var lawyer Lawyer
	if err := DB.First(&lawyer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lawyer not found"})
		return
	}
	c.JSON(http.StatusOK, lawyer)
}

func updateLawyerStatus(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status string `json:"status"`
		Notes  string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := DB.Model(&Lawyer{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":         input.Status,
		"internal_notes": input.Notes,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Status updated"})
}

func createUser(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user in Go DB"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func getUsers(c *gin.Context) {
	var users []User
	if err := DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	c.JSON(http.StatusOK, users)
}

// --- Helpers ---

func triggerN8N(data Case) {
	webhookURL := os.Getenv("N8N_WEBHOOK_URL")
	if webhookURL == "" {
		return
	}
	jsonData, _ := json.Marshal(data)
	http.Post(webhookURL, "application/json", bytes.NewBuffer(jsonData))
}

// SeedData intentionally removed to comply with NO DUMMY/HARDCODED DATA policy.
// All data must originate from PostgreSQL only.
