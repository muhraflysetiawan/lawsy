package main

import (
	"time"

	"gorm.io/gorm"
)

type EventLog struct {
	ID        uint           `gorm:"primaryKey"`
	EventType string         `gorm:"index;not null" json:"event_type"`
	Timestamp time.Time      `gorm:"index" json:"timestamp"`
	UserID    *uint          `json:"user_id"`
	Payload   map[string]any `gorm:"type:jsonb" json:"payload"`
	CreatedAt time.Time      `json:"created_at"`
}

func persistEvent(db *gorm.DB, env EventEnvelope) error {
	e := EventLog{
		EventType: env.EventType,
		Timestamp: env.Timestamp.UTC(),
		UserID:    nil,
		Payload:   map[string]any{},
	}
	if env.UserID != 0 {
		uid := env.UserID
		e.UserID = &uid
	}
	// Best-effort payload serialization is handled by gin->interface{}; assume payload is either map or nil
	if env.Payload != nil {
		if m, ok := env.Payload.(map[string]any); ok {
			e.Payload = m
		}
	}
	return db.Create(&e).Error
}
