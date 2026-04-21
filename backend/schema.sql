-- ==============================================
-- LAWSY PROJECT: POSTGRES DB SCHEMA
-- Includes PostGIS extensions for spatial mapping
-- ==============================================

-- Enable extension for distance calculation
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash TEXT,
  role VARCHAR(20) DEFAULT 'client', -- New (client, lawyer)
  photo_url TEXT,                    -- New
  online_status BOOLEAN DEFAULT false, -- New
  last_seen TIMESTAMP,                -- New
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Lawyers Table (with Geometry Column)
CREATE TABLE IF NOT EXISTS lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- New Link
  name VARCHAR(100) NOT NULL,
  photo_url TEXT,
  title VARCHAR(150),                -- New ("SENIOR LEGAL PARTNER")
  address VARCHAR(200),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  location GEOGRAPHY(POINT, 4326),
  is_verified BOOLEAN DEFAULT false,
  verification_badge_color VARCHAR(15) DEFAULT '#F97316', -- New
  rating DECIMAL(2,1) DEFAULT 0,
  open_hours INTEGER DEFAULT 8,
  specialization TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Establish generic index on purely geographic radius functions
CREATE INDEX IF NOT EXISTS lawyers_location_idx ON lawyers USING GIST(location);

-- 3. Chat Session Framework (Conversations)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES lawyers(id) ON DELETE CASCADE,
  last_message TEXT,                 -- New
  last_message_time TIMESTAMP,       -- New
  unread_count INTEGER DEFAULT 0,    -- New
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lawyer_id)
);

-- 4. Messages Frameowrk
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_role VARCHAR(10) CHECK (sender_role IN ('user', 'lawyer')),
  type VARCHAR(20) DEFAULT 'text',    -- New: ('text', 'file', 'image')
  content TEXT,
  file_url TEXT,                      -- New
  file_size VARCHAR(50),              -- New
  file_type VARCHAR(50),              -- New
  is_read BOOLEAN DEFAULT false,      -- New
  read_at TIMESTAMP,                  -- New
  sent_at TIMESTAMP DEFAULT NOW()
);

-- 5. Review Ecosystem
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID REFERENCES lawyers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexing heavily sorted properties
CREATE INDEX IF NOT EXISTS idx_lawyers_rating ON lawyers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_lawyers_name ON lawyers(name);

-- 6. Document Generator Engine
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id VARCHAR(50) NOT NULL CHECK (template_id IN ('contract', 'statement', 'poa')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated')),
  form_data JSONB, -- Stores {fullName, nik, ktpAddress, currentResidence, docDescription, notes}
  document_url TEXT, -- populated upon generation completion
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
