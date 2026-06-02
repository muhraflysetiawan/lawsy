package main

import (
	"time"
)

type Case struct {
	InternalID     uint      `gorm:"primaryKey;column:id" json:"internal_id"`
	ID             string    `gorm:"unique;not null;column:case_id" json:"id"`
	Name           string    `json:"name"`
	Photo          string    `json:"photo"`
	LawFirm        string    `json:"law_firm"`
	Specialization string    `json:"specialization"`
	ReportsCount   int       `json:"reports_count"`
	Category       string    `json:"category"`
	RiskLevel      string    `json:"risk_level"`
	RiskColor      string    `json:"risk_color"`
	Status         string    `json:"status"`
	AssignedAdmin  string    `json:"assigned_admin"`
	LastActivity   string    `json:"last_activity"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type Lawyer struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Name           string    `json:"name"`
	Avatar         string    `json:"avatar"`
	Initials       string    `json:"initials"`
	Education      string    `json:"education"`
	Firm           string    `json:"firm"`
	Specialization string    `json:"specialization"`
	Experience     string    `json:"experience"`
	Status         string    `json:"status"` // Pending, Approved, Rejected, Revision Required
	JoinedDate     string    `json:"date"`   // Joined Date
	InternalNotes  string    `json:"internal_notes"`
	RiskLevel      string    `json:"risk_level"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type Document struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	LawyerID   uint      `json:"lawyer_id"`
	Name       string    `json:"name"`
	Type       string    `json:"type"`
	Path       string    `json:"path"`
	Status     string    `json:"status"` // valid, revision, rejected
	UploadedAt time.Time `json:"uploaded_at"`
}

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name" binding:"required"`
	Email     string    `gorm:"unique;not null" json:"email" binding:"required,email"`
	Password  string    `json:"password" binding:"required"`
	Role      string    `json:"role" binding:"required"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
