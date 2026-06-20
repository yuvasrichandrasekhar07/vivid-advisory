-- Vivid Advisory - Full Database Schema
-- PostgreSQL 14+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- optional, for geo queries

-- ============================================================
-- USERS & ROLES
-- ============================================================
CREATE TYPE user_role AS ENUM ('aggregator', 'investor', 'developer', 'buyer', 'consultant', 'admin');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  authorization_letter_url VARCHAR(500), -- for MNCs
  gstin VARCHAR(20),
  pan VARCHAR(20),
  kyc_status kyc_status DEFAULT 'pending',
  profile_complete BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- Common
  city VARCHAR(100),
  state VARCHAR(100) DEFAULT 'Karnataka',
  bio TEXT,
  website VARCHAR(500),
  -- Aggregator specific
  total_area_aggregated_acres DECIMAL(12,2),
  districts_operating TEXT[], -- array of districts
  years_experience INTEGER,
  -- Investor specific
  investment_range_min BIGINT, -- in INR
  investment_range_max BIGINT,
  preferred_land_types TEXT[],
  -- Developer specific
  projects_completed INTEGER,
  developer_type VARCHAR(100), -- industrial, residential, commercial, mixed
  -- Buyer/Tenant specific
  required_area_min_acres DECIMAL(10,2),
  required_area_max_acres DECIMAL(10,2),
  budget_min BIGINT,
  budget_max BIGINT,
  land_use_type VARCHAR(100),
  -- Consultant
  rera_number VARCHAR(100),
  ipc_license VARCHAR(100)
);

-- ============================================================
-- LAND PARCELS
-- ============================================================
CREATE TYPE land_listing_status AS ENUM ('draft', 'pending_verification', 'verified', 'listed', 'under_negotiation', 'sold', 'suspended');
CREATE TYPE land_use_category AS ENUM ('industrial', 'residential', 'commercial', 'institutional', 'agricultural', 'mixed', 'other');
CREATE TYPE ownership_type AS ENUM ('freehold', 'leasehold', 'government', 'trust', 'company', 'joint');

CREATE TABLE land_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aggregator_id UUID NOT NULL REFERENCES users(id),

  -- Basic Info
  title VARCHAR(500) NOT NULL,
  description TEXT,
  listing_status land_listing_status DEFAULT 'draft',
  land_use_category land_use_category,

  -- Location
  state VARCHAR(100) DEFAULT 'Karnataka',
  district VARCHAR(100) NOT NULL,
  taluk VARCHAR(100),
  hobli VARCHAR(100),
  village VARCHAR(200),
  survey_numbers TEXT[] NOT NULL, -- array of survey numbers
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,

  -- Area
  total_area_acres DECIMAL(12,4) NOT NULL,
  road_frontage_meters DECIMAL(10,2),

  -- Ownership
  ownership_type ownership_type,
  number_of_owners INTEGER DEFAULT 1,
  ownership_acquired_via VARCHAR(200), -- inheritance, purchase, grant, etc.

  -- Pricing
  asking_price_total BIGINT, -- in INR
  asking_price_per_acre BIGINT,
  price_negotiable BOOLEAN DEFAULT true,

  -- Land Characteristics
  water_logging BOOLEAN DEFAULT false,
  electricity_available BOOLEAN,
  water_source VARCHAR(200), -- borewell, canal, municipal, none
  soil_type VARCHAR(100),
  terrain VARCHAR(100), -- flat, undulating, sloped
  current_land_use VARCHAR(200), -- farming, barren, plantation

  -- Govt Verification (auto-populated from scraping)
  cdp_zone VARCHAR(200),
  cdp_color_code VARCHAR(50),
  cdp_status TEXT,
  under_acquisition_scheme BOOLEAN,
  acquisition_scheme_details TEXT,
  govt_check_done_at TIMESTAMPTZ,

  -- Documents
  title_deed_url VARCHAR(500),
  encumbrance_certificate_url VARCHAR(500),
  mutation_extract_url VARCHAR(500),
  survey_sketch_url VARCHAR(500),
  due_diligence_report_url VARCHAR(500),
  market_value_report_url VARCHAR(500),

  -- Verification
  legal_firm_name VARCHAR(300),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  field_executive_id UUID REFERENCES users(id),

  -- Aggregation Progress
  aggregation_progress_percent INTEGER DEFAULT 0, -- 0-100
  total_landowners_approached INTEGER,
  landowners_agreed INTEGER,

  -- Timestamps
  listed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Landmarks near the land parcel
CREATE TABLE land_landmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  land_id UUID NOT NULL REFERENCES land_listings(id) ON DELETE CASCADE,
  landmark_name VARCHAR(300),
  landmark_type VARCHAR(100), -- highway, airport, railway, port, hospital, school, market
  distance_km DECIMAL(8,2),
  direction VARCHAR(50), -- N, NE, E, SE, S, SW, W, NW
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Land images/media
CREATE TABLE land_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  land_id UUID NOT NULL REFERENCES land_listings(id) ON DELETE CASCADE,
  media_url VARCHAR(500) NOT NULL,
  media_type VARCHAR(50) DEFAULT 'image', -- image, video, document
  caption VARCHAR(300),
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Litigation & legal cases on land
CREATE TABLE land_litigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  land_id UUID NOT NULL REFERENCES land_listings(id) ON DELETE CASCADE,
  case_number VARCHAR(200),
  court_name VARCHAR(300),
  case_type VARCHAR(200), -- ownership dispute, acquisition, tax, boundary
  filing_date DATE,
  current_status VARCHAR(200),
  is_pending BOOLEAN DEFAULT true,
  source VARCHAR(200), -- manual, ecourts_scrape
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Govt tax records
CREATE TABLE land_tax_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  land_id UUID NOT NULL REFERENCES land_listings(id) ON DELETE CASCADE,
  survey_number VARCHAR(100),
  khata_number VARCHAR(100),
  assessment_year VARCHAR(20),
  tax_amount BIGINT,
  paid_upto DATE,
  arrears BIGINT DEFAULT 0,
  source VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VERIFICATION TICKETS
-- ============================================================
CREATE TYPE ticket_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_type AS ENUM ('data_mismatch', 'survey_discrepancy', 'litigation_found', 'ownership_dispute', 'cdp_conflict', 'field_verification', 'other');

CREATE TABLE verification_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  land_id UUID NOT NULL REFERENCES land_listings(id),
  raised_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id), -- field executive
  ticket_type ticket_type NOT NULL,
  ticket_status ticket_status DEFAULT 'open',
  description TEXT NOT NULL,
  govt_data_snapshot JSONB, -- what govt portal said
  aggregator_data_snapshot JSONB, -- what aggregator submitted
  proof_requested TEXT,
  proof_url VARCHAR(500),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUYER REQUIREMENTS
-- ============================================================
CREATE TABLE buyer_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(id),

  -- What they need
  land_use_type land_use_category NOT NULL,
  description TEXT,

  -- Location preference
  preferred_districts TEXT[],
  preferred_state VARCHAR(100) DEFAULT 'Karnataka',
  max_distance_from_city_km INTEGER,

  -- Area
  area_min_acres DECIMAL(10,2),
  area_max_acres DECIMAL(10,2),

  -- Budget
  budget_min BIGINT,
  budget_max BIGINT,

  -- Shape & Road
  shape_preference VARCHAR(100), -- rectangular, square, irregular ok
  road_frontage_required_meters DECIMAL(10,2),
  road_type_required VARCHAR(100), -- national highway, state highway, district road

  -- Utilities
  power_required_kva INTEGER,
  water_required_kld INTEGER, -- kiloliters per day
  drainage_required BOOLEAN,

  -- Special requirements
  pollution_zone_required VARCHAR(50), -- green, orange, red, any
  requires_separate_electric_bus BOOLEAN DEFAULT false,
  requires_storage BOOLEAN DEFAULT false,
  storage_area_sqft INTEGER,

  -- Engagement
  engagement_type VARCHAR(50), -- buy, lease, build_to_suit, joint_venture
  preferred_developer_partner BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,
  matched_listing_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRANSACTIONS & SUCCESS FEES
-- ============================================================
CREATE TYPE transaction_status AS ENUM ('initiated', 'due_diligence', 'negotiating', 'agreement_signed', 'completed', 'cancelled');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  land_id UUID NOT NULL REFERENCES land_listings(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  consultant_id UUID REFERENCES users(id),

  agreed_price BIGINT,
  success_fee_percent DECIMAL(5,2) DEFAULT 2.0,
  success_fee_amount BIGINT,
  success_fee_paid BOOLEAN DEFAULT false,

  transaction_status transaction_status DEFAULT 'initiated',
  agreement_url VARCHAR(500),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(100), -- new_match, listing_update, ticket_update, news, system
  reference_id UUID, -- land_id, ticket_id, etc.
  reference_type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SERVICE POPUPS & REVENUE
-- ============================================================
CREATE TABLE service_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  service_type VARCHAR(100) NOT NULL, -- legal, financial, licensing, conversion_order, architect, surveyor, interior, facility
  land_id UUID REFERENCES land_listings(id),
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name VARCHAR(300) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  website VARCHAR(500),
  logo_url VARCHAR(500),
  coverage_districts TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NEWS FEED
-- ============================================================
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  url VARCHAR(500) UNIQUE NOT NULL,
  source_name VARCHAR(200),
  image_url VARCHAR(500),
  published_at TIMESTAMPTZ,
  tags TEXT[], -- districts, land types mentioned
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FAQ & CHATBOT
-- ============================================================
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RATE CARDS
-- ============================================================
CREATE TABLE rate_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(300) NOT NULL,
  service_category VARCHAR(100),
  description TEXT,
  base_price BIGINT,
  price_unit VARCHAR(100), -- per acre, per sqft, flat, percentage
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_land_listings_status ON land_listings(listing_status);
CREATE INDEX idx_land_listings_district ON land_listings(district);
CREATE INDEX idx_land_listings_aggregator ON land_listings(aggregator_id);
CREATE INDEX idx_land_listings_use ON land_listings(land_use_category);
CREATE INDEX idx_transactions_land ON transactions(land_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_buyer_requirements_buyer ON buyer_requirements(buyer_id);
CREATE INDEX idx_tickets_land ON verification_tickets(land_id);
CREATE INDEX idx_tickets_status ON verification_tickets(ticket_status);

-- ============================================================
-- SEED: FAQs
-- ============================================================
INSERT INTO faqs (category, question, answer, display_order) VALUES
('navigation', 'How do I list my land on Vivid Advisory?', 'Register as an Aggregator, complete your KYC, then click "List Land" in your dashboard. Fill in all survey details and upload required documents.', 1),
('navigation', 'How does the survey number verification work?', 'We cross-check your survey number against Karnataka government land records portals including Bhoomi and CDP data to validate ownership, zone, and encumbrances.', 2),
('navigation', 'What is the success fee?', 'Vivid Advisory charges a 2% success fee on the total agreed transaction value, payable on deal completion.', 3),
('navigation', 'How do I search for land as a buyer?', 'Use the Search page to filter by district, area, budget, land use type, and other parameters. You can also post your requirement and get matched automatically.', 4),
('legal', 'What documents does an aggregator need to upload?', 'Title deed, Encumbrance Certificate (EC), RTC/Pahani extract, Survey sketch, Mutation extract, and a Due Diligence report from an empanelled legal firm.', 5),
('legal', 'What if the govt data does not match the submitted data?', 'A discrepancy ticket is automatically raised. A field executive is assigned to verify on-ground and the listing is held pending resolution.', 6),
('roles', 'Who is a Consultant (IPC)?', 'An IPC (Industrial Property Consultant) helps buyers find the right land and facilitates deals between buyers, aggregators, and developers. They are registered on Vivid Advisory and work for a commission.', 7),
('roles', 'Can I invest in partial land ownership?', 'Yes. Register as an Investor, browse investment opportunities, and connect with aggregators for partial/co-investment deals.', 8);

-- ============================================================
-- SEED: Rate Cards
-- ============================================================
INSERT INTO rate_cards (service_name, service_category, description, base_price, price_unit, display_order) VALUES
('Land Due Diligence Report', 'legal', 'Comprehensive legal due diligence by empanelled law firm', 25000, 'flat', 1),
('Title Search (7 years)', 'legal', 'Title search and clear title certificate', 15000, 'flat', 2),
('Survey & Boundary Demarcation', 'survey', 'Licensed surveyor field visit and report', 8000, 'per acre', 3),
('Conversion Order (Agricultural to Non-Agricultural)', 'conversion', 'Govt conversion order facilitation', 50000, 'flat', 4),
('CDP Zone Certificate', 'legal', 'Certificate of permitted land use per CDP', 5000, 'flat', 5),
('Facility Management Setup', 'facility', 'Initial facility management consultation', 20000, 'flat', 6),
('Industrial Layout Approval', 'licensing', 'Assistance with industrial layout approval from BDA/LPA', 75000, 'flat', 7),
('Architect Feasibility Report', 'design', 'Feasibility study by empanelled architect', 35000, 'flat', 8);
