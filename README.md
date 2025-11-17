# School Management System

A comprehensive school management system built with React frontend and Node.js/Express backend.

## Features

- **Student Management** - Complete student profiles, academic history, and records
- **Teacher/Staff Management** - Teacher profiles, schedules, and HR management
- **Class & Timetable Management** - Class schedules, subject allocation, and timetable creation
- **Attendance System** - Daily attendance logging with automatic alerts
- **Examination & Grading** - Exam scheduling, grade book, and report card generation
- **Communication** - Internal messaging and announcements
- **Fee Management** - Fee structure, payment tracking, and online payments
- **Library Management** - Book cataloging and borrow/return tracking
- **Transport Management** - Bus routes, vehicles, and driver management
- **Inventory Management** - Asset tracking and maintenance alerts
- **Analytics & Reports** - Comprehensive dashboards and reports

## Tech Stack

### Backend
- Node.js with Express.js
- MySQL database with Sequelize ORM
- JWT authentication
- Joi validation
- Multer for file uploads
- Socket.io for real-time features

### Frontend
- React with Vite
- Material-UI for components
- React Router for navigation
- React Query for data fetching
- Axios for API calls

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Default Admin Credentials
After running migrations and seeders, you can login with:
- **Username:** `admin`
- **Password:** `admin123`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_management
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

5. Run migrations:
```bash
npm run migrate
```

6. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
school-management-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and JWT configuration
│   │   ├── models/         # Sequelize models
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth and validation middleware
│   │   ├── migrations/     # Database migrations
│   │   └── utils/          # Helper functions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── utils/          # Helper functions
│   └── package.json
└── README.md
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Attendance
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/bulk` - Bulk mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/stats` - Get attendance statistics

## User Roles

- **Admin** - Full system access
- **Teacher** - Access to classes, students, attendance, and grades
- **Student** - Access to own profile, grades, and attendance
- **Parent** - Access to children's information

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

