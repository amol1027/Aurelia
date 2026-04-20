# 🚀 Quick Start - Adoption System

## Prerequisites
- MySQL database running
- Node.js installed
- Server `.env` configured with database credentials

## Installation Steps

### 1. Apply Database Schema
```bash
cd D:\Aurelia\server
node updateSchema.js
```
Expected output: `✅ Schema updated successfully`

### 2. Install Dependencies
```bash
cd D:\Aurelia\client
npm install
```

### 3. Start Backend
```bash
cd D:\Aurelia\server
npm start
```
Expected: `🐾 Aurelia API running on http://localhost:5000`

### 4. Start Frontend
```bash
cd D:\Aurelia\client
npm run dev
```
Expected: App running at `http://localhost:5173`

## Test the System

### Register Test Users

**Adopter Account:**
1. Go to `http://localhost:5173/register`
2. Choose role: **Adopter**
3. Fill in details and register

**Shelter Account:**
1. Open incognito/private window
2. Go to `http://localhost:5173/register`
3. Choose role: **Shelter**
4. Fill in details and register

### Test Adoption Flow

**As Adopter:**
1. Login → Dashboard → "My Applications"
2. Browse pets → Click a pet
3. Navigate to application form
4. Fill out comprehensive form
5. Submit application
6. View in "My Applications"
7. Check status badge (should be "Pending")

**As Shelter:**
1. Login → Dashboard → "Applications"
2. See the submitted application
3. Click "View Full Application"
4. Review all details
5. Click "Start Review" (status → Under Review)
6. Click "Approve" or "Reject"
7. Add notes (optional)
8. Confirm decision
9. If approved, can later mark as "Completed"

**Back to Adopter:**
1. Refresh "My Applications"
2. See updated status
3. Click "View Details"
4. See status history timeline
5. See shelter notes (if any)

## Quick Navigation

### Adopter URLs
- Dashboard: `/dashboard`
- My Applications: `/my-applications`
- Apply for Pet: `/adopt/:petId`
- Application Details: `/applications/:id`

### Shelter URLs
- Dashboard: `/dashboard`
- Review Applications: `/shelter/applications`
- Application Details: `/applications/:id`

## Common Issues

**"Cannot connect to database"**
→ Check MySQL is running and `.env` credentials are correct

**"Token required" errors**
→ Clear browser cache/localStorage and login again

**Form not submitting**
→ Check browser console for validation errors

**Status badge not showing**
→ Hard refresh page (Ctrl+F5)

## File Locations

**Backend:**
- Routes: `server/routes/adoptions.js`
- Schema: `server/schema.sql`
- Main: `server/index.js`

**Frontend:**
- Form: `client/src/components/AdoptionApplicationForm.jsx`
- Status Badge: `client/src/components/StatusBadge.jsx`
- Pages: `client/src/pages/MyApplications.jsx`, etc.

## API Testing (Optional)

Test endpoints with curl or Postman:

```bash
# Get all applications (as shelter)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/adoptions/shelter/all

# Submit application (as adopter)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"petId":1,"homeType":"house",...}' \
  http://localhost:5000/api/adoptions/apply
```

Replace `YOUR_TOKEN` with actual JWT token from login response.

## Next Steps

✅ System is ready to use!
✅ All 12 features implemented
✅ Frontend + Backend integrated
✅ Authentication working
✅ Status workflow functional

Enjoy your new adoption management system! 🐾
