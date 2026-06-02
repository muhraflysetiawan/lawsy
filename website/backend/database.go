package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB
var eventRouter *EventRouter

func InitDB() {
	// Load .env from root directory
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println("Warning: No .env file found in root")
	}

	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "127.0.0.1"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}
	user := os.Getenv("DB_USERNAME")
	if user == "" {
		user = "postgres"
	}
	pass := os.Getenv("DB_PASSWORD")
	if pass == "" {
		pass = "postgres"
	}
	dbname := os.Getenv("DB_DATABASE_POSTGRES")
	if dbname == "" {
		dbname = os.Getenv("DB_DATABASE")
		// Fallback if DB_DATABASE is empty or looks like a file path (SQLite)
		if dbname == "" || len(dbname) > 3 && dbname[1:3] == ":\\" {
			dbname = "lawsy"
		}
	}

	// 1. Connect to 'postgres' default database first to ensure 'lawsy' exists
	dsnRoot := fmt.Sprintf("host=%s user=%s password=%s dbname=postgres port=%s sslmode=disable", host, user, pass, port)
	dbRoot, err := gorm.Open(postgres.Open(dsnRoot), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to postgres default db: %v", err)
	}

	// 2. Create database if not exists
	var exists int
	dbRoot.Raw("SELECT 1 FROM pg_database WHERE datname = ?", dbname).Scan(&exists)
	if exists == 0 {
		fmt.Printf("Database %s does not exist, creating...\n", dbname)
		dbRoot.Exec(fmt.Sprintf("CREATE DATABASE %s", dbname))
	}

	// Close root connection
	sqlDB, _ := dbRoot.DB()
	sqlDB.Close()

	// 3. Connect to the actual 'lawsy' database
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", host, user, pass, dbname, port)
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database %s: %v", dbname, err)
	}

	fmt.Printf("Database connection established to %s\n", dbname)

	// 4. Auto Migrate models
	err = DB.AutoMigrate(&Case{}, &Lawyer{}, &Document{}, &User{}, &EventLog{}, &SupportMessage{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	if !DB.Migrator().HasTable(&SupportMessage{}) {
		if err := DB.Migrator().CreateTable(&SupportMessage{}); err != nil {
			log.Fatalf("Failed to create support_messages table: %v", err)
		}
	}
}
