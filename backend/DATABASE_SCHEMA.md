# Database Schema Documentation

## Overview
This document describes the database structure for the School Management System. The database uses MySQL with InnoDB engine, UTF8MB4 charset, and follows professional database design principles.

## Design Principles

1. **Naming Conventions**
   - Table names: lowercase, plural (e.g., `users`, `students`)
   - Column names: snake_case (e.g., `user_id`, `created_at`)
   - Index names: `idx_<table>_<column(s)>`
   - Foreign keys: `<table>_<column>_fk`

2. **Data Types**
   - Primary keys: `INTEGER UNSIGNED` for better range
   - Foreign keys: `INTEGER UNSIGNED` with proper constraints
   - Text fields: Appropriate VARCHAR lengths
   - Dates: `DATE` for dates, `DATETIME` for timestamps
   - Decimals: `DECIMAL(10,2)` for currency, `DECIMAL(5,2)` for percentages

3. **Constraints**
   - Foreign keys with appropriate `ON DELETE` and `ON UPDATE` actions
   - Unique constraints on business keys
   - NOT NULL constraints where appropriate
   - Check constraints via ENUMs

4. **Indexes**
   - Primary keys (automatic)
   - Foreign keys (for join performance)
   - Unique indexes on business keys
   - Composite indexes for common query patterns
   - Single column indexes for filtering

## Core Tables

### users
Base table for all system users (admin, teacher, student, parent).

**Key Fields:**
- `id`: Primary key (INTEGER UNSIGNED)
- `username`: Unique login identifier
- `email`: Optional email address
- `password`: Hashed password
- `role`: ENUM('admin', 'teacher', 'student', 'parent')
- `is_active`: Account status

**Indexes:**
- `idx_users_username` (unique)
- `idx_users_email` (unique)
- `idx_users_role`
- `idx_users_is_active`
- `idx_users_role_active` (composite)

### classes
Academic classes/sections.

**Key Fields:**
- `id`: Primary key
- `name`: Class name
- `section`: Section identifier
- `academic_year`: Academic year
- `class_teacher_id`: Foreign key to teachers
- `capacity`: Maximum students
- `status`: ENUM('active', 'inactive')

**Indexes:**
- `idx_classes_name_year` (unique composite: name + academic_year)
- `idx_classes_academic_year`
- `idx_classes_status`
- `idx_classes_teacher`

### students
Student profile information.

**Key Fields:**
- `id`: Primary key
- `user_id`: Foreign key to users (CASCADE delete)
- `student_id`: Unique student ID
- `class_id`: Foreign key to classes (SET NULL on delete)
- `parent_id`: Foreign key to parents (SET NULL on delete)
- `route_id`: Foreign key to routes (transport)
- `status`: ENUM('active', 'inactive', 'graduated', 'transferred')

**Indexes:**
- `idx_students_student_id` (unique)
- `idx_students_class_id`
- `idx_students_parent_id`
- `idx_students_status`
- `idx_students_class_status` (composite)
- `idx_students_name` (composite: first_name + last_name)

### teachers
Teacher profile information.

**Key Fields:**
- `id`: Primary key
- `user_id`: Foreign key to users (CASCADE delete)
- `teacher_id`: Unique teacher ID
- `specialization`: Subject specialization
- `status`: ENUM('active', 'inactive', 'resigned', 'retired')

**Indexes:**
- `idx_teachers_teacher_id` (unique)
- `idx_teachers_status`
- `idx_teachers_name` (composite: first_name + last_name)

### parents
Parent/guardian information.

**Key Fields:**
- `id`: Primary key
- `user_id`: Foreign key to users (CASCADE delete)
- `relationship`: ENUM('father', 'mother', 'guardian', 'other')

### attendances
Daily attendance records.

**Key Fields:**
- `id`: Primary key
- `student_id`: Foreign key to students (CASCADE delete)
- `date`: Attendance date
- `status`: ENUM('present', 'absent', 'late', 'excused')
- `marked_by`: Foreign key to users (RESTRICT delete)

**Constraints:**
- Unique constraint on (student_id, date) to prevent duplicates

**Indexes:**
- `idx_attendances_student_date_unique` (unique composite)
- `idx_attendances_student_id`
- `idx_attendances_date`
- `idx_attendances_status`
- `idx_attendances_student_date_status` (composite)

## Academic Tables

### subjects
Academic subjects.

**Key Fields:**
- `id`: Primary key
- `name`: Subject name
- `code`: Unique subject code
- `credits`: Credit hours

### timetables
Class schedules.

**Key Fields:**
- `id`: Primary key
- `class_id`: Foreign key to classes
- `subject_id`: Foreign key to subjects
- `teacher_id`: Foreign key to teachers
- `day_of_week`: ENUM('monday'...'sunday')
- `start_time`, `end_time`: TIME fields

### exams
Examination schedules.

**Key Fields:**
- `id`: Primary key
- `class_id`: Foreign key to classes
- `subject_id`: Foreign key to subjects
- `exam_date`: DATE
- `total_marks`, `passing_marks`: DECIMAL(5,2)

### grades
Student grades/exam results.

**Key Fields:**
- `id`: Primary key
- `student_id`: Foreign key to students
- `exam_id`: Foreign key to exams
- `subject_id`: Foreign key to subjects
- `marks_obtained`: DECIMAL(5,2)
- `grade`: VARCHAR(2)
- `entered_by`: Foreign key to users

## Financial Tables

### fees
Fee structure and billing.

**Key Fields:**
- `id`: Primary key
- `student_id`: Foreign key to students
- `fee_type`: ENUM('tuition', 'library', 'sports', 'lab', 'transport', 'other')
- `amount`: DECIMAL(10,2)
- `due_date`: DATE
- `status`: ENUM('pending', 'paid', 'partial', 'overdue')

### payments
Payment transactions.

**Key Fields:**
- `id`: Primary key
- `fee_id`: Foreign key to fees
- `amount`: DECIMAL(10,2)
- `payment_method`: ENUM('cash', 'bank_transfer', 'online', 'cheque', 'other')
- `transaction_id`: Unique transaction identifier
- `receipt_number`: Unique receipt number
- `processed_by`: Foreign key to users

## Communication Tables

### messages
Internal messaging system.

**Key Fields:**
- `id`: Primary key
- `sender_id`: Foreign key to users
- `receiver_id`: Foreign key to users
- `is_read`: BOOLEAN
- `read_at`: DATETIME

### announcements
System-wide announcements.

**Key Fields:**
- `id`: Primary key
- `target_audience`: ENUM('all', 'students', 'teachers', 'parents', 'staff')
- `priority`: ENUM('low', 'medium', 'high', 'urgent')
- `published_at`: DATETIME
- `expires_at`: DATETIME
- `created_by`: Foreign key to users

### events
School events and calendar.

**Key Fields:**
- `id`: Primary key
- `event_type`: ENUM('ptm', 'exam', 'holiday', 'sports', 'cultural', 'other')
- `start_date`, `end_date`: DATE
- `start_time`, `end_time`: TIME
- `created_by`: Foreign key to users

## Library Tables

### books
Library book catalog.

**Key Fields:**
- `id`: Primary key
- `isbn`: Unique ISBN
- `title`, `author`: Book information
- `total_copies`, `available_copies`: INTEGER
- `status`: ENUM('available', 'unavailable', 'lost', 'damaged')

### borrows
Book borrowing records.

**Key Fields:**
- `id`: Primary key
- `book_id`: Foreign key to books
- `student_id`: Foreign key to students
- `borrow_date`, `due_date`, `return_date`: DATE
- `late_fee`: DECIMAL(10,2)
- `status`: ENUM('borrowed', 'returned', 'overdue', 'lost')

## Transport Tables

### routes
Bus routes.

**Key Fields:**
- `id`: Primary key
- `name`: Route name
- `start_location`, `end_location`: VARCHAR(200)
- `stops`: JSON array
- `fare`: DECIMAL(10,2)
- `status`: ENUM('active', 'inactive')

### vehicles
School vehicles.

**Key Fields:**
- `id`: Primary key
- `vehicle_number`: Unique vehicle registration
- `vehicle_type`: ENUM('bus', 'van', 'car', 'other')
- `capacity`: INTEGER
- `route_id`: Foreign key to routes
- `driver_id`: Foreign key to drivers
- `status`: ENUM('active', 'inactive', 'maintenance')

### drivers
Vehicle drivers.

**Key Fields:**
- `id`: Primary key
- `license_number`: Unique license number
- `license_expiry`: DATE
- `status`: ENUM('active', 'inactive')

## Inventory Tables

### assets
School assets and equipment.

**Key Fields:**
- `id`: Primary key
- `asset_code`: Unique asset identifier
- `category`: ENUM('lab_equipment', 'stationery', 'furniture', 'electronics', 'sports', 'other')
- `quantity`: INTEGER
- `purchase_cost`: DECIMAL(10,2)
- `status`: ENUM('available', 'in_use', 'maintenance', 'damaged', 'disposed')

### maintenances
Asset maintenance records.

**Key Fields:**
- `id`: Primary key
- `asset_id`: Foreign key to assets
- `maintenance_type`: ENUM('repair', 'service', 'inspection', 'upgrade', 'other')
- `scheduled_date`, `completed_date`: DATE
- `cost`: DECIMAL(10,2)
- `status`: ENUM('scheduled', 'in_progress', 'completed', 'cancelled')
- `created_by`: Foreign key to users

## Junction Tables

### ClassSubjects
Many-to-many relationship between classes and subjects.

**Key Fields:**
- `id`: Primary key
- `class_id`: Foreign key to classes
- `subject_id`: Foreign key to subjects

### TeacherSubjects
Many-to-many relationship between teachers and subjects.

**Key Fields:**
- `id`: Primary key
- `teacher_id`: Foreign key to teachers
- `subject_id`: Foreign key to subjects

## Foreign Key Actions

### CASCADE
- User deletion → Student/Teacher/Parent deletion
- Student deletion → Attendance/Grade deletion

### SET NULL
- Class deletion → Student.class_id set to NULL
- Parent deletion → Student.parent_id set to NULL
- Teacher deletion → Class.class_teacher_id set to NULL

### RESTRICT
- User deletion prevented if marked attendance records exist

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Composite Indexes**: Added for common query patterns (e.g., class + status)
3. **Unique Constraints**: Prevent duplicate business data
4. **Unsigned Integers**: Used for IDs to double the positive range
5. **UTF8MB4**: Full Unicode support including emojis

## Migration Order

Migrations are numbered sequentially to ensure proper dependency resolution:
1. Core tables (users, classes, subjects)
2. User profiles (teachers, parents, students)
3. Academic tables (timetables, exams, grades)
4. Operational tables (attendances, fees, payments)
5. Additional modules (library, transport, inventory)
6. Junction tables
7. Foreign key constraints (added after referenced tables exist)

