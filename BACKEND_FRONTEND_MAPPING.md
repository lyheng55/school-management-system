# Backend-Frontend Endpoint Mapping

This document maps all backend endpoints to their frontend usage status.

## ✅ Fully Implemented Endpoints

### Authentication (`/api/auth/*`)
- ✅ `POST /auth/register` - Used in Login page (if register form exists)
- ✅ `POST /auth/login` - Used in Login page
- ✅ `GET /auth/me` - Used in AuthContext
- ✅ `POST /auth/refresh-token` - Used in api.js interceptor
- ✅ `POST /auth/logout` - Used in AuthContext

### Students (`/api/students/*`)
- ✅ `GET /students` - Used in Students.jsx (with pagination, search)
- ✅ `GET /students/:id` - Used in StudentDetail.jsx (comprehensive student detail view)
- ✅ `POST /students` - Used in Students.jsx (create form)
- ✅ `PUT /students/:id` - Used in Students.jsx (edit form)
- ✅ `DELETE /students/:id` - Used in Students.jsx (delete button)
- ✅ `POST /students/:id/photo` - Used in StudentDetail.jsx (photo upload functionality)

### Teachers (`/api/teachers/*`)
- ✅ `GET /teachers` - Used in Teachers.jsx, Classes.jsx, Dashboard.jsx
- ✅ `GET /teachers/:id` - Used in TeacherDetail.jsx (comprehensive teacher detail view)
- ✅ `POST /teachers` - Used in Teachers.jsx (create form)
- ✅ `PUT /teachers/:id` - Used in Teachers.jsx (edit form)
- ✅ `DELETE /teachers/:id` - Used in Teachers.jsx (delete button)
- ✅ `POST /teachers/:id/photo` - Used in Teachers.jsx (photo upload functionality)

### Classes (`/api/classes/*`)
- ✅ `GET /classes` - Used in Classes.jsx, Students.jsx, Attendance.jsx, Dashboard.jsx, and many other pages
- ✅ `GET /classes/:id` - Used in ClassDetail.jsx (comprehensive class detail view)
- ✅ `POST /classes` - Used in Classes.jsx (create form)
- ✅ `PUT /classes/:id` - Used in Classes.jsx (edit form)
- ✅ `DELETE /classes/:id` - Used in Classes.jsx (delete button)

### Subjects (`/api/subjects/*`)
- ✅ `GET /subjects` - Used in Exams.jsx (for dropdown) and Subjects.jsx (listing page)
- ✅ `GET /subjects/:id` - **NOT USED** (could be used for detail view)
- ✅ `POST /subjects` - Used in Subjects.jsx (create form)
- ✅ `PUT /subjects/:id` - Used in Subjects.jsx (edit form)
- ✅ `DELETE /subjects/:id` - Used in Subjects.jsx (delete button)

### Attendance (`/api/attendance/*`)
- ✅ `GET /attendance` - Used in Attendance.jsx (with filters, loads existing records), Dashboard.jsx (today's and month's attendance statistics), and ClassDetail.jsx (class attendance statistics)
- ✅ `POST /attendance` - **NOT USED** (individual marking handled via bulk endpoint)
- ✅ `POST /attendance/bulk` - Used in Attendance.jsx (bulk attendance marking implemented)
- ✅ `GET /attendance/stats` - Used in Attendance.jsx (statistics calculated from attendance data)

### Exams (`/api/exams/*`)
- ✅ `GET /exams` - Used in Exams.jsx (with pagination, search), Dashboard.jsx (upcoming exams), and ClassDetail.jsx (class exams)
- ✅ `GET /exams/class/:class_id` - Used in ClassDetail.jsx (filtered by class_id parameter)
- ✅ `GET /exams/:id` - Used in ExamDetail.jsx (comprehensive exam detail view)
- ✅ `POST /exams` - Used in Exams.jsx (create form)
- ✅ `PUT /exams/:id` - Used in Exams.jsx (edit form)
- ✅ `DELETE /exams/:id` - Used in Exams.jsx (delete button)

### Grades (`/api/grades/*`)
- ✅ `GET /grades` - Used in Grades.jsx (with filters) and ExamDetail.jsx (exam grades)
- ✅ `GET /grades/student/:student_id` - Used in StudentDetail.jsx (student grades tab)
- ✅ `GET /grades/:id` - Used in GradeDetail.jsx (comprehensive grade detail view)
- ✅ `POST /grades` - Used in Grades.jsx (create form)
- ✅ `POST /grades/bulk` - Used in Grades.jsx (bulk grade entry form)
- ✅ `PUT /grades/:id` - Used in Grades.jsx (edit form)
- ✅ `DELETE /grades/:id` - Used in Grades.jsx (delete button)

### Behaviors (`/api/behaviors/*`)
- ✅ `GET /behaviors` - Used in Behaviors.jsx (with filters)
- ✅ `GET /behaviors/student/:student_id` - Used in StudentDetail.jsx (student behaviors tab)
- ✅ `GET /behaviors/:id` - **NOT USED** (could be used for detail view)
- ✅ `POST /behaviors` - Used in Behaviors.jsx (create form)
- ✅ `PUT /behaviors/:id` - Used in Behaviors.jsx (edit form)
- ✅ `DELETE /behaviors/:id` - Used in Behaviors.jsx (delete button)

### Achievements (`/api/achievements/*`)
- ✅ `GET /achievements` - Used in Achievements.jsx (with filters)
- ✅ `GET /achievements/student/:student_id` - Used in StudentDetail.jsx (student achievements tab)
- ✅ `GET /achievements/:id` - **NOT USED** (could be used for detail view)
- ✅ `POST /achievements` - Used in Achievements.jsx (create form)
- ✅ `PUT /achievements/:id` - Used in Achievements.jsx (edit form)
- ✅ `DELETE /achievements/:id` - Used in Achievements.jsx (delete button)

### Fees (`/api/fees/*`)
- ✅ `GET /fees` - Used in Fees.jsx (with filters)
- ✅ `GET /fees/summary` - Used in Fees.jsx and Dashboard.jsx (summary statistics)
- ✅ `GET /fees/student/:student_id` - Used in StudentDetail.jsx (student fees tab)
- ✅ `GET /fees/:id` - Used in FeeDetail.jsx (comprehensive fee detail view)
- ✅ `POST /fees` - Used in Fees.jsx (create form)
- ✅ `POST /fees/bulk` - Used in Fees.jsx (bulk fee creation form)
- ✅ `PUT /fees/:id` - Used in Fees.jsx (edit form)
- ✅ `DELETE /fees/:id` - Used in Fees.jsx (delete button)

### Payments (`/api/payments/*`)
- ✅ `GET /payments` - Used in Payments.jsx (with filters)
- ✅ `GET /payments/fee/:fee_id` - **NOT USED** (could be used for fee detail view)
- ✅ `GET /payments/student/:student_id` - Used in StudentDetail.jsx (student payments tab)
- ✅ `GET /payments/:id` - Used in PaymentDetail.jsx (comprehensive payment detail view)
- ✅ `POST /payments` - Used in Payments.jsx (create form)
- ✅ `PUT /payments/:id` - Used in Payments.jsx (edit form)
- ✅ `DELETE /payments/:id` - Used in Payments.jsx (delete button)

## ⚠️ Missing Frontend Implementations

### High Priority (Forms Need Implementation)
1. **Attendance Page**
   - ✅ Mark Attendance form (POST /attendance/bulk) - **COMPLETED**
   - ✅ Bulk Attendance form (POST /attendance/bulk) - **COMPLETED**
   - ✅ Attendance Statistics display (calculated from attendance data) - **COMPLETED**

2. **Exams Page**
   - ✅ Create/Edit Exam form
   - ✅ Delete functionality

3. **Grades Page**
   - ✅ Create/Edit Grade form
   - ✅ Bulk Grade Entry form
   - ✅ Delete functionality

4. **Behaviors Page**
   - ✅ Create/Edit Behavior form
   - ✅ Delete functionality

5. **Achievements Page**
   - ✅ Create/Edit Achievement form
   - ✅ Delete functionality

6. **Fees Page**
   - ✅ Create/Edit Fee form
   - ✅ Bulk Fee Creation form
   - ✅ Delete functionality

7. **Payments Page**
   - ✅ Create/Edit Payment form
   - ✅ Delete functionality

### Medium Priority (Additional Features)
8. **Photo Upload**
   - ✅ Student photo upload (POST /students/:id/photo) - **COMPLETED**
   - ✅ Teacher photo upload (POST /teachers/:id/photo) - **COMPLETED**

9. **Detail Views**
   - ✅ Student detail view (GET /students/:id) - **COMPLETED** (comprehensive view with tabs)
   - ✅ Teacher detail view (GET /teachers/:id) - **COMPLETED** (teacher info, subjects, classes)
   - ✅ Class detail view (GET /classes/:id) - **COMPLETED** (students, subjects, exams, attendance)
   - ✅ Exam detail view (GET /exams/:id) - **COMPLETED** (exam info, grades, statistics)
   - ✅ Grade detail view (GET /grades/:id) - **COMPLETED** (grade info, student, exam details)
   - ✅ Fee detail view (GET /fees/:id) - **COMPLETED** (fee info, student, payment history)
   - ✅ Payment detail view (GET /payments/:id) - **COMPLETED** (payment info, fee, student details)

10. **Student-Specific Views**
    - ✅ Student grades view (GET /grades/student/:student_id) - **COMPLETED** (integrated in StudentDetail)
    - ✅ Student behaviors view (GET /behaviors/student/:student_id) - **COMPLETED** (integrated in StudentDetail)
    - ✅ Student achievements view (GET /achievements/student/:student_id) - **COMPLETED** (integrated in StudentDetail)
    - ✅ Student fees view (GET /fees/student/:student_id) - **COMPLETED** (integrated in StudentDetail)
    - ✅ Student payments view (GET /payments/student/:student_id) - **COMPLETED** (integrated in StudentDetail)

11. **Additional Filters**
    - ❌ Exams by class (GET /exams/class/:class_id)
    - ❌ Payments by fee (GET /payments/fee/:fee_id)

### Lower Priority (Nice to Have)
12. **Subjects Management**
   - ✅ **Backend**: Complete CRUD (controller and routes created)
   - ✅ **Frontend**: Subject management page created (Subjects.jsx)
   - ✅ `GET /subjects` - Used in Exams.jsx dropdown and Subjects.jsx (listing page)
   - ✅ `POST /subjects` - Used in Subjects.jsx (create form)
   - ✅ `PUT /subjects/:id` - Used in Subjects.jsx (edit form)
   - ✅ `DELETE /subjects/:id` - Used in Subjects.jsx (delete button)

## Summary Statistics

### Backend Endpoints
- **Total Routes**: ~65+ endpoints (including Subjects)
- **Fully Used**: ~30 endpoints (46%)
- **Partially Used**: ~15 endpoints (23%)
- **Not Used**: ~20 endpoints (31%)

### Backend Controllers
- **Total Controllers**: 12 controllers ✅
  - authController ✅
  - studentController ✅
  - teacherController ✅
  - classController ✅
  - subjectController ✅ (newly created)
  - attendanceController ✅
  - examController ✅
  - gradeController ✅
  - behaviorController ✅
  - achievementController ✅
  - feeController ✅
  - paymentController ✅

### Frontend Pages
- **Total Pages**: 13 pages
- **Fully Functional**: 11 pages (Students, Teachers, Classes, Subjects, Attendance, Exams, Grades, Behaviors, Achievements, Fees, Payments)
- **Partially Functional**: 1 page (Dashboard could be enhanced further)

## Recommendations

### Immediate Actions Needed:
1. ✅ **DONE**: Create Subjects controller and routes
2. ✅ **DONE**: Implement Attendance marking functionality
3. ✅ **DONE**: Implement all CRUD forms for Exams, Grades, Behaviors, Achievements, Fees, Payments
4. ✅ **DONE**: Add delete functionality to all pages

### Next Phase:
1. ✅ **DONE**: Student detail view with comprehensive information
2. ✅ **DONE**: Photo upload functionality for Students and Teachers
3. ✅ **DONE**: Student-specific views (integrated in StudentDetail page)
4. ✅ **DONE**: Enhanced Dashboard with attendance statistics, fee summary, and upcoming exams
5. ✅ **DONE**: Teacher and Class detail views with comprehensive information
6. ✅ **DONE**: Exam, Grade, Fee, and Payment detail views with comprehensive information
7. ✅ **DONE**: Subjects management page with full CRUD functionality

