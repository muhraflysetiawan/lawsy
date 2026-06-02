package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

type Client struct {
	id       string
	userID   *uint
	conn     *websocket.Conn
	channels map[string]struct{}
	mu       sync.Mutex
	lastPong time.Time
}

type WSHub struct {
	mu      sync.RWMutex
	clients map[*Client]struct{}
	byUser  map[uint]map[*Client]struct{}
}

func NewHub() *WSHub {
	return &WSHub{
		clients: make(map[*Client]struct{}),
		byUser:  make(map[uint]map[*Client]struct{}),
	}
}

func (h *WSHub) addClient(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[c] = struct{}{}
	if c.userID != nil {
		uid := *c.userID
		if h.byUser[uid] == nil {
			h.byUser[uid] = make(map[*Client]struct{})
		}
		h.byUser[uid][c] = struct{}{}
	}
}

func (h *WSHub) removeClient(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, c)
	if c.userID != nil {
		uid := *c.userID
		if h.byUser[uid] != nil {
			delete(h.byUser[uid], c)
			if len(h.byUser[uid]) == 0 {
				delete(h.byUser, uid)
			}
		}
	}
}

type WSEvent struct {
	EventType string      `json:"event_type"`
	Timestamp time.Time   `json:"timestamp"`
	Data      interface{} `json:"data"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Simple auth/subscription query parsing.
// Clients may connect to:
//
//	ws://host/ws?userId=123
//
// and then send:
//
//	{"action":"subscribe","channels":["support"]}
func serveWS(hub *WSHub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("ws upgrade error:", err)
		return
	}

	c := &Client{conn: conn, channels: make(map[string]struct{}), lastPong: time.Now()}
	if sid := r.URL.Query().Get("sessionId"); sid != "" {
		c.id = sid
	} else {
		c.id = fmt.Sprintf("session-%d", time.Now().UnixNano())
	}

	uidQ := r.URL.Query().Get("userId")
	if uidQ != "" {
		if uid, err := strconv.ParseUint(uidQ, 10, 64); err == nil {
			u := uint(uid)
			c.userID = &u
		}
	}

	hub.addClient(c)
	defer func() {
		hub.removeClient(c)
		_ = c.conn.Close()
	}()

	// ping/pong keepalive
	_ = c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		_ = c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		c.lastPong = time.Now()
		return nil
	})

	// read loop for subscription changes
	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var cmd struct {
			Action   string   `json:"action"`
			Channels []string `json:"channels"`
			UserID   *uint    `json:"userId"`
			ClientID string   `json:"clientId"`
		}
		if err := json.Unmarshal(msg, &cmd); err != nil {
			continue
		}

		if cmd.Action == "subscribe" {
			for _, ch := range cmd.Channels {
				c.channels[ch] = struct{}{}
			}
		}
		if cmd.Action == "unsubscribe" {
			for _, ch := range cmd.Channels {
				delete(c.channels, ch)
			}
		}
		if cmd.UserID != nil {
			c.userID = cmd.UserID
		}
	}
}

func (h *WSHub) broadcastEvent(eventType string, payload interface{}) {
	msg := WSEvent{
		EventType: eventType,
		Timestamp: time.Now().UTC(),
		Data:      payload,
	}

	bytes, _ := json.Marshal(msg)

	h.mu.RLock()
	clients := make([]*Client, 0, len(h.clients))
	for c := range h.clients {
		clients = append(clients, c)
	}
	h.mu.RUnlock()

	for _, c := range clients {
		// channel mapping: support
		if _, ok := c.channels[channelForEvent(eventType)]; !ok {
			continue
		}
		c.mu.Lock()
		_ = c.conn.WriteMessage(websocket.TextMessage, bytes)
		c.mu.Unlock()
	}
}

func channelForEvent(eventType string) string {
	switch eventType {
	case "support.message.created":
		return "support"
	case "notification.created":
		return "notifications"
	case "analytics.updated":
		return "dashboard"
	case "case.created", "case.updated":
		return "dashboard"
	default:
		return "support"
	}
}

// Hook to satisfy future domain service use.
func broadcastFromEvent(hub *WSHub, db *gorm.DB, env EventEnvelope) {
	// Minimal: only broadcast event envelope for now.
	hub.broadcastEvent(env.EventType, map[string]any{
		"event": env,
	})
}
