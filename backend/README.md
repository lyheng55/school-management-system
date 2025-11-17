# School Management System - Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. **Set up MySQL Database:**
   - Make sure MySQL is installed and running
   - Create the database:
     ```sql
     CREATE DATABASE school_management;
     ```
   - If using MySQL 8+ and encountering authentication errors, you may need to update your user's authentication plugin:
     ```sql
     ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
     FLUSH PRIVILEGES;
     ```

4. Update the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=school_management
   DB_USER=root
   DB_PASSWORD=your_password
   ```

5. Run migrations to create database tables:
```bash
npm run migrate
```

6. (Optional) Seed the database with sample admin user:
```bash
npm run seed
```
This will create an admin user with:
- Username: `admin`
- Password: `admin123`

7. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (requires username, password, role, firstName, lastName)
- `POST /api/auth/login` - Login with username and password
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout

### Students
- `GET /api/students` - Get all students (with pagination and filters)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student (admin only)
- `PUT /api/students/:id` - Update student (admin/teacher)
- `DELETE /api/students/:id` - Delete student (admin only)
- `POST /api/students/:id/photo` - Upload student photo

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create new teacher (admin only)
- `PUT /api/teachers/:id` - Update teacher (admin only)
- `DELETE /api/teachers/:id` - Delete teacher (admin only)

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create new class (admin only)
- `PUT /api/classes/:id` - Update class (admin only)
- `DELETE /api/classes/:id` - Delete class (admin only)

### Attendance
- `POST /api/attendance` - Mark attendance for a student
- `POST /api/attendance/bulk` - Bulk mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/stats` - Get attendance statistics

## Database Schema

The system uses MySQL with Sequelize ORM. All migrations are in `src/migrations/`.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

