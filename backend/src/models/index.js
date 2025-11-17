const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Parent = require('./Parent');
const Class = require('./Class');
const Subject = require('./Subject');
const Timetable = require('./Timetable');
const Attendance = require('./Attendance');
const Exam = require('./Exam');
const Grade = require('./Grade');
const Behavior = require('./Behavior');
const Achievement = require('./Achievement');
const Message = require('./Message');
const Announcement = require('./Announcement');
const Event = require('./Event');
const Fee = require('./Fee');
const Payment = require('./Payment');
const Book = require('./Book');
const Borrow = require('./Borrow');
const Route = require('./Route');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Asset = require('./Asset');
const Maintenance = require('./Maintenance');

// Define associations
User.hasOne(Student, { foreignKey: 'user_id', as: 'student' });
User.hasOne(Teacher, { foreignKey: 'user_id', as: 'teacher' });
User.hasOne(Parent, { foreignKey: 'user_id', as: 'parent' });

Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Parent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Student associations
Student.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Class.hasMany(Student, { foreignKey: 'class_id', as: 'students' });

Student.hasMany(Attendance, { foreignKey: 'student_id', as: 'attendances' });
Attendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Attendance.belongsTo(User, { foreignKey: 'marked_by', as: 'markedBy' });

Student.hasMany(Grade, { foreignKey: 'student_id', as: 'grades' });
Grade.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Student.hasMany(Behavior, { foreignKey: 'student_id', as: 'behaviors' });
Behavior.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Behavior.belongsTo(User, { foreignKey: 'recorded_by', as: 'recordedBy' });

Student.hasMany(Achievement, { foreignKey: 'student_id', as: 'achievements' });
Achievement.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Parent-Student relationship
Parent.hasMany(Student, { foreignKey: 'parent_id', as: 'children' });
Student.belongsTo(Parent, { foreignKey: 'parent_id', as: 'parent' });

// Class-Subject associations
Class.belongsToMany(Subject, { through: 'ClassSubjects', foreignKey: 'class_id', as: 'subjects' });
Subject.belongsToMany(Class, { through: 'ClassSubjects', foreignKey: 'subject_id', as: 'classes' });

// Teacher-Subject associations
Teacher.belongsToMany(Subject, { through: 'TeacherSubjects', foreignKey: 'teacher_id', as: 'subjects' });
Subject.belongsToMany(Teacher, { through: 'TeacherSubjects', foreignKey: 'subject_id', as: 'teachers' });

// Class-Teacher associations
Class.belongsTo(Teacher, { foreignKey: 'class_teacher_id', as: 'classTeacher' });
Teacher.hasMany(Class, { foreignKey: 'class_teacher_id', as: 'classes' });

// Timetable associations
Timetable.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Timetable.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
Timetable.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });

// Exam associations
Exam.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Exam.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

Grade.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
Grade.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
Grade.belongsTo(User, { foreignKey: 'entered_by', as: 'enteredBy' });

// Message associations
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// Announcement associations
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Announcement, { foreignKey: 'created_by', as: 'announcements' });

// Event associations
Event.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Event, { foreignKey: 'created_by', as: 'events' });

// Fee and Payment associations
Student.hasMany(Fee, { foreignKey: 'student_id', as: 'fees' });
Fee.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Fee.hasMany(Payment, { foreignKey: 'fee_id', as: 'payments' });
Payment.belongsTo(Fee, { foreignKey: 'fee_id', as: 'fee' });
Payment.belongsTo(User, { foreignKey: 'processed_by', as: 'processedBy' });

// Library associations
Book.hasMany(Borrow, { foreignKey: 'book_id', as: 'borrows' });
Borrow.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });
Borrow.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Transport associations
Route.hasMany(Vehicle, { foreignKey: 'route_id', as: 'vehicles' });
Route.hasMany(Student, { foreignKey: 'route_id', as: 'students' });
Vehicle.belongsTo(Route, { foreignKey: 'route_id', as: 'route' });
Vehicle.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });
Driver.hasMany(Vehicle, { foreignKey: 'driver_id', as: 'vehicles' });
Student.belongsTo(Route, { foreignKey: 'route_id', as: 'route' });

// Asset associations
Asset.hasMany(Maintenance, { foreignKey: 'asset_id', as: 'maintenances' });
Maintenance.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Maintenance.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
User.hasMany(Maintenance, { foreignKey: 'created_by', as: 'maintenances' });

module.exports = {
  sequelize,
  User,
  Student,
  Teacher,
  Parent,
  Class,
  Subject,
  Timetable,
  Attendance,
  Exam,
  Grade,
  Behavior,
  Achievement,
  Message,
  Announcement,
  Event,
  Fee,
  Payment,
  Book,
  Borrow,
  Route,
  Vehicle,
  Driver,
  Asset,
  Maintenance
};

