package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type EventEnvelope struct {
	EventType string      `json:"event_type"`
	Timestamp time.Time   `json:"timestamp"`
	UserID    uint        `json:"user_id"`
	Payload   interface{} `json:"payload"`
}

func postEvents(c *gin.Context) {
	var env EventEnvelope
	if err := c.ShouldBindJSON(&env); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if env.EventType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_type is required"})
		return
	}
	if env.Timestamp.IsZero() {
		env.Timestamp = time.Now().UTC()
	}

	// persist event
	if err := persistEvent(DB, env); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to persist event"})
		return
	}

	if eventRouter == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "event router unavailable"})
		return
	}

	if err := eventRouter.Route(env); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"event_type": env.EventType,
		"timestamp":  env.Timestamp,
	})
}
