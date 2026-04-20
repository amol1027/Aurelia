# Aurelia Project Documentation

Last updated: 2026-04-16

## 1. Project Overview

Aurelia is a full-stack pet adoption platform with:
- Public pet browsing
- Role-based authentication (adopter, shelter, admin behavior in API)
- Favorites management
- Adoption application workflow with status history
- In-app support chat (user <-> admin)
- Direct messaging between pet owner and interested user
- Admin management screens and user maintenance endpoints

## 2. Core Functional Modules

### 2.1 Authentication and Accounts
- User registration and login with JWT
- Account roles used in app logic: adopter, shelter, admin
- Profile retrieval via token

### 2.2 Pet Listings
- List all pets
- View single pet details
- Create, edit, delete listings with ownership checks
- Owner linkage via owner_user_id

### 2.3 Favorites
- Add and remove favorite pets
- Fetch favorite pet IDs for signed-in user
- Duplicate favorites prevented by unique DB constraint

### 2.4 Adoption Management
- Submit detailed adoption applications
- Shelter review and status updates
- Applicant withdrawal under rules
- Full status history log for auditability

### 2.5 Messaging
- Support chat threads between user and admin
- Direct chat threads tied to a pet and two participants
- Unread tracking and thread ordering by recent activity

### 2.6 Admin Tools
- User management endpoints (list, update, delete)
- Stats endpoint for user and pet counts

## 3. High-Level Architecture

- Frontend: React + Vite SPA in client
- Backend: Express REST API in server
- Database: MySQL with relational schema and one JSON column (pets.personality)
- Auth: JWT bearer tokens

Data flow:
1. Frontend sends HTTP requests to backend endpoints.
2. Backend validates token (for protected routes) and applies role checks.
3. Backend reads/writes MySQL tables.
4. Frontend updates UI state from API responses.

## 4. Technology Stack

### Frontend
- React 19
- React Router DOM 7
- Tailwind CSS 3
- Framer Motion
- React Icons
- date-fns
- Vite 7

### Backend
- Node.js
- Express 4
- mysql2
- jsonwebtoken
- bcryptjs
- dotenv
- cors

## 5. Repository Structure

Top-level:
- .git
- README.md
- ADOPTION_SYSTEM.md
- QUICK_START_ADOPTION.md
- UI_COMPLIANCE_REPORT.md
- client
- server
- diagrams

Frontend source layout:
- client/src/App.jsx
- client/src/main.jsx
- client/src/components
- client/src/context
- client/src/pages

Backend layout:
- server/index.js
- server/db.js
- server/schema.sql
- server/seed.js
- server/updateSchema.js
- server/addAdmin.js
- server/testAdoption.js
- server/routes/auth.js
- server/routes/users.js
- server/routes/favorites.js
- server/routes/adoptions.js
- server/routes/messages.js

## 6. Setup and Run

### 6.1 Prerequisites
- Node.js 18+
- MySQL server running locally or remotely

### 6.2 Backend Setup
1. Go to server folder.
2. Install dependencies.
3. Configure environment variables.
4. Initialize schema or run seed.
5. Start API server.

Suggested commands:

```bash
cd server
npm install
node updateSchema.js
npm start
```

API default URL:
- http://localhost:5000

### 6.3 Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend default URL:
- http://localhost:5173

## 7. Environment Variables

Backend variables used by code:
- DB_HOST (default: localhost)
- DB_USER (default: root)
- DB_PASSWORD (default: empty string)
- DB_NAME (default: aurelia)
- PORT (default: 5000)
- JWT_SECRET (default: aurelia_secret_key_2024)
- SEED_ADMIN_OWNER_EMAIL (used by seed script)
- SEED_ADMIN_OWNER_PASSWORD (used by seed script)

Example server .env:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aurelia
PORT=5000
JWT_SECRET=change_this_secret
SEED_ADMIN_OWNER_EMAIL=seed-admin-owner@aurelia.local
SEED_ADMIN_OWNER_PASSWORD=AdminOwner@123
```

## 8. Database Schema

Primary schema file: server/schema.sql

### 8.1 users
- id (PK)
- role ENUM(adopter, shelter)
- name
- email (UNIQUE)
- password
- phone
- shelter_name
- address
- created_at

### 8.2 pets
- id (PK)
- name
- breed
- age
- personality JSON
- image
- description
- owner_user_id (FK -> users.id, nullable, ON DELETE SET NULL)
- created_at

### 8.3 favorites
- id (PK)
- user_id (FK -> users.id)
- pet_id (FK -> pets.id)
- created_at
- Unique constraint: (user_id, pet_id)

### 8.4 support_threads
- id (PK)
- user_id (FK -> users.id)
- created_at
- updated_at
- Unique constraint: user_id (one support thread per user)

### 8.5 support_messages
- id (PK)
- thread_id (FK -> support_threads.id)
- sender_role ENUM(adopter, shelter, admin)
- sender_user_id (FK -> users.id, nullable, ON DELETE SET NULL)
- message
- is_read
- created_at

### 8.6 direct_threads
- id (PK)
- pet_id (FK -> pets.id)
- owner_user_id (FK -> users.id)
- participant_user_id (FK -> users.id)
- created_at
- updated_at
- Unique constraint: (pet_id, owner_user_id, participant_user_id)

### 8.7 direct_messages
- id (PK)
- thread_id (FK -> direct_threads.id)
- sender_user_id (FK -> users.id)
- message
- is_read
- created_at

### 8.8 adoption_applications
- id (PK)
- pet_id (FK -> pets.id)
- adopter_id (FK -> users.id)
- status ENUM(pending, under_review, approved, rejected, completed, withdrawn)
- home_type ENUM(house, apartment, condo, other)
- home_ownership ENUM(own, rent)
- has_yard
- yard_fenced
- has_other_pets
- other_pets_details
- has_children
- children_ages
- pet_experience
- previous_pets
- vet_reference
- vet_phone
- personal_reference_name
- personal_reference_phone
- personal_reference_relationship
- reason_for_adoption
- special_accommodations
- hours_alone_per_day
- exercise_plan
- emergency_contact_name
- emergency_contact_phone
- created_at
- updated_at

### 8.9 application_status_history
- id (PK)
- application_id (FK -> adoption_applications.id)
- old_status
- new_status
- changed_by (FK -> users.id)
- notes
- changed_at

## 9. Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USERS {
        INT id PK
        ENUM role
        VARCHAR name
        VARCHAR email UK
        VARCHAR password
        VARCHAR phone
        VARCHAR shelter_name
        TEXT address
        TIMESTAMP created_at
    }

    PETS {
        INT id PK
        VARCHAR name
        VARCHAR breed
        VARCHAR age
        JSON personality
        VARCHAR image
        TEXT description
        INT owner_user_id FK
        TIMESTAMP created_at
    }

    FAVORITES {
        INT id PK
        INT user_id FK
        INT pet_id FK
        TIMESTAMP created_at
    }

    SUPPORT_THREADS {
        INT id PK
        INT user_id FK UK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    SUPPORT_MESSAGES {
        INT id PK
        INT thread_id FK
        ENUM sender_role
        INT sender_user_id FK
        TEXT message
        BOOLEAN is_read
        TIMESTAMP created_at
    }

    DIRECT_THREADS {
        INT id PK
        INT pet_id FK
        INT owner_user_id FK
        INT participant_user_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    DIRECT_MESSAGES {
        INT id PK
        INT thread_id FK
        INT sender_user_id FK
        TEXT message
        BOOLEAN is_read
        TIMESTAMP created_at
    }

    ADOPTION_APPLICATIONS {
        INT id PK
        INT pet_id FK
        INT adopter_id FK
        ENUM status
        ENUM home_type
        ENUM home_ownership
        BOOLEAN has_yard
        BOOLEAN yard_fenced
        BOOLEAN has_other_pets
        TEXT other_pets_details
        BOOLEAN has_children
        VARCHAR children_ages
        TEXT pet_experience
        TEXT previous_pets
        VARCHAR vet_reference
        VARCHAR vet_phone
        VARCHAR personal_reference_name
        VARCHAR personal_reference_phone
        VARCHAR personal_reference_relationship
        TEXT reason_for_adoption
        TEXT special_accommodations
        INT hours_alone_per_day
        TEXT exercise_plan
        VARCHAR emergency_contact_name
        VARCHAR emergency_contact_phone
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    APPLICATION_STATUS_HISTORY {
        INT id PK
        INT application_id FK
        VARCHAR old_status
        VARCHAR new_status
        INT changed_by FK
        TEXT notes
        TIMESTAMP changed_at
    }

    USERS ||--o{ PETS : owns
    USERS ||--o{ FAVORITES : marks
    PETS ||--o{ FAVORITES : is_favorited

    USERS ||--o| SUPPORT_THREADS : opens
    SUPPORT_THREADS ||--o{ SUPPORT_MESSAGES : has
    USERS ||--o{ SUPPORT_MESSAGES : sends

    PETS ||--o{ DIRECT_THREADS : about
    USERS ||--o{ DIRECT_THREADS : owner
    USERS ||--o{ DIRECT_THREADS : participant
    DIRECT_THREADS ||--o{ DIRECT_MESSAGES : has
    USERS ||--o{ DIRECT_MESSAGES : sends

    USERS ||--o{ ADOPTION_APPLICATIONS : submits
    PETS ||--o{ ADOPTION_APPLICATIONS : receives
    ADOPTION_APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORY : history
    USERS ||--o{ APPLICATION_STATUS_HISTORY : changed_by
```

## 10. Backend API Reference

Base URL: http://localhost:5000

### 10.1 Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### 10.2 Pets
- GET /api/pets
- GET /api/pets/:id
- POST /api/pets
- PUT /api/pets/:id
- DELETE /api/pets/:id

### 10.3 Favorites
- GET /api/favorites
- POST /api/favorites
- DELETE /api/favorites/:petId

### 10.4 Adoptions
- POST /api/adoptions/apply
- GET /api/adoptions/user/:userId
- GET /api/adoptions/:id
- GET /api/adoptions/pet/:petId
- GET /api/adoptions/shelter/pending
- GET /api/adoptions/shelter/all
- PATCH /api/adoptions/:id/status
- DELETE /api/adoptions/:id

### 10.5 Messaging (Support)
- GET /api/messages/me
- POST /api/messages/me
- GET /api/messages/admin/threads
- GET /api/messages/admin/threads/:threadId
- POST /api/messages/admin/threads/:threadId

### 10.6 Messaging (Direct)
- POST /api/messages/direct/start
- GET /api/messages/direct/threads
- GET /api/messages/direct/threads/:threadId
- POST /api/messages/direct/threads/:threadId

### 10.7 Admin
- GET /api/admin/users
- PUT /api/admin/users/:id
- DELETE /api/admin/users/:id
- GET /api/admin/stats

## 11. Frontend Routes

Defined in client/src/App.jsx:
- /
- /login
- /register
- /dashboard
- /admin
- /admin/users
- /profile
- /favorites
- /how-it-works
- /pets
- /pets/:id
- /my-applications
- /applications/:id
- /shelter/applications
- /adopt/:id
- /shelter/pets
- /my-pets
- /admin/pets
- /support/chat
- /admin/messages
- /messages
- * (404 fallback)

## 12. Roles and Authorization Rules

### 12.1 Roles in route logic
- adopter
- shelter
- admin

### 12.2 Key access rules
- Favorites: authenticated users only
- Adoption apply: authenticated users; owner checks and duplicate checks are enforced
- Adoption status updates: shelter only
- Admin user management: admin only
- Support admin thread endpoints: admin only
- Direct messaging: adopter and shelter only
- Pet create/update/delete: adopter, shelter, or admin; non-admin users can modify only their own pets

## 13. Adoption Status Workflow

Valid transitions implemented in server/routes/adoptions.js:
- pending -> under_review, withdrawn
- under_review -> approved, rejected, pending, withdrawn
- approved -> completed, rejected
- rejected -> terminal
- completed -> terminal
- withdrawn -> terminal

## 14. Messaging Behavior

### 14.1 Support chat
- One thread per user
- Admin messages can be stored with sender_user_id = NULL
- Read flags updated when thread is viewed by the other side

### 14.2 Direct chat
- Thread uniqueness per pet-owner-participant combination
- Chat cannot be started with self
- Chat requires pet to have owner_user_id
- Read flags update when user opens thread

## 15. Scripts and Utilities

### Server scripts
- npm start: starts Express API
- npm run seed: recreates DB core tables and inserts sample users/pets

### Utility files
- server/updateSchema.js: executes SQL schema statements
- server/addAdmin.js: attempts to insert an admin user
- server/testAdoption.js: adoption table and flow checks

## 16. Known Gaps and Risks

1. Role enum mismatch:
- users.role in schema allows only adopter and shelter.
- App logic also uses admin role.
- addAdmin.js inserts role = admin, which may fail under current schema.

2. Hardcoded admin login behavior:
- Auth route allows email=admin@gmail.com and password=123456 without DB lookup.
- This is convenient for local testing but not production-safe.

3. Admin stats endpoint exposure:
- GET /api/admin/stats is currently not protected by auth middleware.

4. Seed/schema differences:
- seed.js defines only users and pets tables directly.
- Other tables may require running updateSchema.js afterward depending on workflow.

## 17. Recommended Next Improvements

1. Add admin to users.role enum and run migration.
2. Remove hardcoded admin credentials and use DB-backed admin accounts only.
3. Protect /api/admin/stats with admin authentication middleware.
4. Add centralized validation layer (e.g., schema validation for request bodies).
5. Add automated tests for auth, adoptions, and messaging endpoints.
6. Add rate limiting and security headers for production deployment.

## 18. Quick Verification Checklist

- Backend boots without SQL errors.
- Frontend can fetch GET /api/pets.
- Register/login works for adopter and shelter.
- Favorite add/remove works.
- Adoption application submit and status transitions work.
- Support chat sends and receives messages.
- Direct chat starts and sends messages.
- Admin user endpoints require admin token.
