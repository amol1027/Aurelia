CREATE DATABASE IF NOT EXISTS aurelia;
USE aurelia;

DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS direct_messages;
DROP TABLE IF EXISTS direct_threads;
DROP TABLE IF EXISTS support_messages;
DROP TABLE IF EXISTS support_threads;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('adopter', 'shelter') NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  -- Shelter-specific fields
  shelter_name VARCHAR(200),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100) NOT NULL,
  age VARCHAR(50) NOT NULL,
  personality JSON NOT NULL,
  image VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  owner_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ,FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pet_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, pet_id)
);

CREATE TABLE support_threads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_thread (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE support_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  thread_id INT NOT NULL,
  sender_role ENUM('adopter', 'shelter', 'admin') NOT NULL,
  sender_user_id INT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES support_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE direct_threads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  owner_user_id INT NOT NULL,
  participant_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_pet_chat (pet_id, owner_user_id, participant_user_id),
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE direct_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  thread_id INT NOT NULL,
  sender_user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES direct_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE adoption_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  adopter_id INT NOT NULL,
  status ENUM('pending', 'under_review', 'approved', 'rejected', 'completed', 'withdrawn') DEFAULT 'pending',
  
  -- Home environment
  home_type ENUM('house', 'apartment', 'condo', 'other') NOT NULL,
  home_ownership ENUM('own', 'rent') NOT NULL,
  has_yard BOOLEAN DEFAULT FALSE,
  yard_fenced BOOLEAN DEFAULT FALSE,
  
  -- Other pets
  has_other_pets BOOLEAN DEFAULT FALSE,
  other_pets_details TEXT,
  
  -- Children
  has_children BOOLEAN DEFAULT FALSE,
  children_ages VARCHAR(255),
  
  -- Experience
  pet_experience TEXT NOT NULL,
  previous_pets TEXT,
  
  -- References
  vet_reference VARCHAR(255),
  vet_phone VARCHAR(20),
  personal_reference_name VARCHAR(100),
  personal_reference_phone VARCHAR(20),
  personal_reference_relationship VARCHAR(100),
  
  -- Application details
  reason_for_adoption TEXT NOT NULL,
  special_accommodations TEXT,
  hours_alone_per_day INT,
  exercise_plan TEXT,
  
  -- Emergency contact
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  FOREIGN KEY (adopter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE application_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INT NOT NULL,
  notes TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES adoption_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

