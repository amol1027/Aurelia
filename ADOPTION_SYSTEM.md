# Adoption System Documentation

## Overview
The Aurelia Adoption System enables comprehensive management of pet adoption applications from submission through completion. The system supports two user roles: **adopters** (people wanting to adopt pets) and **shelters** (staff managing applications).

## Features

### For Adopters
- ✅ Browse available pets
- ✅ Submit detailed adoption applications
- ✅ Track application status in real-time
- ✅ View complete application history
- ✅ Withdraw pending applications
- ✅ Receive status update notifications

### For Shelters
- ✅ Review all submitted applications
- ✅ Filter by status (pending, under review, approved, etc.)
- ✅ View applicant details and references
- ✅ Approve or reject applications with notes
- ✅ Mark adoptions as completed
- ✅ Full audit trail of all status changes

## Application Workflow

```
Adopter Submits     Shelter Reviews     Shelter Decision     Finalization
     ↓                    ↓                    ↓                   ↓
  Pending  →  Under Review  →  Approved/Rejected  →  Completed
                                        ↓
                                   Withdrawn
                              (adopter can withdraw)
```

## API Endpoints

### Adopter Endpoints
- `POST /api/adoptions/apply` - Submit a new application
- `GET /api/adoptions/user/:userId` - Get all your applications
- `GET /api/adoptions/:id` - View specific application details
- `DELETE /api/adoptions/:id` - Withdraw a pending application

### Shelter Endpoints
- `GET /api/adoptions/shelter/pending` - View pending applications
- `GET /api/adoptions/shelter/all` - View all applications
- `GET /api/adoptions/pet/:petId` - View applications for a specific pet
- `PATCH /api/adoptions/:id/status` - Update application status

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Application Form Fields

### Home Environment
- Home Type (house, apartment, condo, other)
- Ownership Status (own, rent)
- Has Yard? (yes/no)
- Yard Fenced? (yes/no)

### Household Information
- Has Other Pets? (with details)
- Has Children? (with ages)

### Experience & References
- Pet Experience (detailed text)
- Previous Pets (optional)
- Veterinarian Reference (name, phone)
- Personal Reference (name, phone, relationship)

### Care Plan
- Reason for Adoption (required)
- Hours Alone Per Day
- Exercise Plan
- Special Accommodations

### Emergency Contact
- Emergency Contact Name
- Emergency Contact Phone

## Status Codes

| Status | Color | Meaning |
|--------|-------|---------|
| `pending` | Yellow | Application submitted, awaiting review |
| `under_review` | Blue | Shelter is actively reviewing |
| `approved` | Green | Application approved by shelter |
| `rejected` | Red | Application not approved |
| `completed` | Purple | Adoption finalized |
| `withdrawn` | Gray | Applicant withdrew application |

## Valid Status Transitions

```javascript
pending → under_review, withdrawn
under_review → approved, rejected, pending, withdrawn
approved → completed, rejected
rejected → (final state)
completed → (final state)
withdrawn → (final state)
```

## Database Schema

### adoption_applications
Stores all application data including home environment, references, and care plan.

**Key fields:**
- `id` - Primary key
- `pet_id` - Foreign key to pets table
- `adopter_id` - Foreign key to users table
- `status` - Current application status (ENUM)
- `created_at` - Submission timestamp
- `updated_at` - Last modified timestamp

### application_status_history
Audit trail of all status changes.

**Key fields:**
- `id` - Primary key
- `application_id` - Foreign key to adoption_applications
- `old_status` - Previous status
- `new_status` - New status
- `changed_by` - User who made the change
- `notes` - Optional notes about the change
- `changed_at` - Timestamp of change

## Frontend Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/adopt/:id` | Adopters | Apply for a specific pet |
| `/my-applications` | Adopters | View all your applications |
| `/applications/:id` | Both | View application details |
| `/shelter/applications` | Shelters | Review & manage applications |

## Usage Examples

### Submitting an Application (Frontend)

```javascript
const response = await fetch('http://localhost:5000/api/adoptions/apply', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    petId: 1,
    homeType: 'house',
    homeOwnership: 'own',
    hasYard: true,
    yardFenced: true,
    petExperience: 'I have owned dogs for 10 years...',
    reasonForAdoption: 'Looking for a companion...',
    // ... other fields
  })
});
```

### Updating Status (Shelter)

```javascript
const response = await fetch(`http://localhost:5000/api/adoptions/${appId}/status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'approved',
    notes: 'Great home environment and excellent references'
  })
});
```

## Security & Access Control

- **Authentication**: All routes require valid JWT token
- **Authorization**: 
  - Adopters can only view/manage their own applications
  - Shelters can view all applications
  - Status updates are shelter-only
- **Validation**:
  - Status transitions are validated server-side
  - Form data is validated on both client and server
  - Duplicate applications prevented

## Testing Checklist

### As Adopter
- [ ] Submit application for a pet
- [ ] View application in "My Applications"
- [ ] See status badge correctly displayed
- [ ] View full application details
- [ ] Withdraw a pending application
- [ ] Verify cannot submit duplicate application

### As Shelter
- [ ] View all pending applications
- [ ] Filter applications by status
- [ ] View full application details
- [ ] Start review (pending → under_review)
- [ ] Approve application with notes
- [ ] Reject application with notes
- [ ] Mark approved application as completed
- [ ] View status history timeline

## Future Enhancements

- [ ] Email notifications on status changes
- [ ] Shelter assignment to pets
- [ ] Application scoring/ranking
- [ ] Document upload (vet records, references)
- [ ] In-app messaging between adopter and shelter
- [ ] Application templates for repeat adopters
- [ ] Analytics dashboard for shelters
- [ ] Multi-pet adoption applications
- [ ] Waitlist for popular pets

## Troubleshooting

**Applications not showing up?**
- Check JWT token is valid
- Verify user role (adopter vs shelter)
- Check browser console for API errors

**Cannot submit application?**
- Ensure all required fields are filled
- Check for existing application for the same pet
- Verify you're logged in as an adopter

**Status update failing?**
- Verify you're logged in as a shelter
- Check status transition is valid
- Review server logs for validation errors

## Support

For issues or questions:
- Check the main README.md
- Review server logs for errors
- Verify database schema is up to date (run `node updateSchema.js`)
- Ensure both frontend and backend are running
