# Testing Guide - School Management System

## Quick Start Testing

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Expected output:
- Database connection established successfully
- Server is running on port 5000

### 2. Start Frontend Application
```bash
cd frontend
npm run dev
```
Expected output:
- Vite dev server running on http://localhost:3000

### 3. Test Login
1. Open browser: http://localhost:3000
2. Login page should appear
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. Should redirect to Dashboard

## API Testing with cURL

### Authentication

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "role": "student",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Save the token from response for subsequent requests.

#### Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### Students

#### Get All Students
```bash
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

#### Create Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "2010-01-15",
    "gender": "male",
    "admission_date": "2024-01-01",
    "class_id": 1
  }'
```

### Teachers

#### Get All Teachers
```bash
curl http://localhost:5000/api/teachers \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### Classes

#### Get All Classes
```bash
curl http://localhost:5000/api/classes \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### Attendance

#### Mark Attendance
```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "date": "2024-01-15",
    "status": "present"
  }'
```

## Frontend Testing Checklist

### Login Page
- [ ] Username field appears
- [ ] Password field appears
- [ ] Login button works
- [ ] Error messages display correctly
- [ ] Successful login redirects to dashboard

### Dashboard
- [ ] Statistics cards display
- [ ] Navigation menu works
- [ ] User info displays in header
- [ ] Logout button works

### Students Page
- [ ] Student list displays
- [ ] Search functionality works
- [ ] Add Student button appears (for admin)
- [ ] Edit/Delete buttons appear (for authorized users)

### Teachers Page
- [ ] Teacher list displays
- [ ] Search functionality works
- [ ] Add Teacher button appears (for admin)

### Classes Page
- [ ] Class list displays
- [ ] Class details show correctly

### Attendance Page
- [ ] Class selector works
- [ ] Date picker works
- [ ] Attendance records display

## System Verification

Run the automated verification:
```bash
cd backend
npm run verify
```

Expected: All checks pass (8/8)

## Common Issues & Solutions

### Issue: Tables missing
**Solution**: Run migrations
```bash
cd backend
npm run migrate
node scripts/fix-junction-tables.js
```

### Issue: Cannot connect to database
**Solution**: Check .env file and MySQL service
```bash
# Check MySQL is running
# Verify .env has correct credentials
```

### Issue: Admin user not found
**Solution**: Run seeder
```bash
cd backend
npm run seed
```

### Issue: Frontend cannot connect to backend
**Solution**: 
1. Verify backend is running on port 5000
2. Check CORS configuration
3. Verify proxy settings in vite.config.js

## Performance Testing

### Load Testing
Use tools like Apache Bench or Postman:
```bash
# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:5000/api/auth/login
```

### Database Query Performance
- All foreign keys are indexed
- Composite indexes for common queries
- Pagination implemented for large datasets

## Security Testing

### Authentication
- [x] Password hashing verified
- [x] JWT tokens expire correctly
- [x] Refresh token mechanism works
- [x] Protected routes require authentication

### Authorization
- [x] Admin-only routes protected
- [x] Teacher routes accessible to teachers
- [x] Student routes accessible to students

### Input Validation
- [x] Joi validation on all inputs
- [x] SQL injection prevention (ORM)
- [x] File upload validation

## Integration Testing Flow

1. **User Registration**
   - Register new user → Should create user and profile
   - Login with new credentials → Should work

2. **Student Management Flow**
   - Create student → Should appear in list
   - Search student → Should filter results
   - Update student → Changes should persist
   - Delete student → Should be removed

3. **Attendance Flow**
   - Mark attendance → Should create record
   - View attendance → Should display correctly
   - Get statistics → Should calculate correctly

4. **Class Management Flow**
   - Create class → Should appear in list
   - Assign students → Should update student records
   - View class details → Should show all students

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on Mac)

Test responsive design:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Error Scenarios

Test error handling:
- [ ] Invalid login credentials
- [ ] Expired token
- [ ] Missing required fields
- [ ] Invalid data types
- [ ] Database connection errors
- [ ] 404 errors

All errors should return proper JSON responses with error messages.

