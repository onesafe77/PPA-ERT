-- Database Schema for P2H Application (MySQL Version)
-- Updated to fix Foreign Key Error 150

SET FOREIGN_KEY_CHECKS = 0;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    date VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    severity VARCHAR(50),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Chat Logs Table
CREATE TABLE IF NOT EXISTS chat_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- P2H Inspections Table
CREATE TABLE IF NOT EXISTS p2h_inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_number VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(255) NOT NULL,
    operator_name VARCHAR(255),
    shift VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    checklist_data TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    type VARCHAR(50) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Scheduled',
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- APAR Inspection Table
CREATE TABLE IF NOT EXISTS apar_inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    unit_number VARCHAR(255),
    capacity VARCHAR(50),      
    tag_number VARCHAR(50),   
    checklist_data TEXT, 
    condition_status VARCHAR(50), -- Renamed from condition
    notes TEXT,
    pic VARCHAR(255),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Hydrant Inspection Table
CREATE TABLE IF NOT EXISTS hydrant_inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    shift VARCHAR(50),
    checklist_data TEXT, 
    notes TEXT,
    pic VARCHAR(255),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- PICA Reports Table
CREATE TABLE IF NOT EXISTS pica_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_data LONGTEXT,
    deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'OPEN',
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed Data (Only if not duplicate)
INSERT IGNORE INTO users (employee_id, name, role, password)
VALUES ('23001138', 'Saralim', 'user', '12345678');
