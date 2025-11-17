const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/students/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

router.get('/', authenticate, studentController.getAllStudents);
router.get('/:id', authenticate, studentController.getStudentById);
router.post('/', authenticate, authorize('admin'), studentController.createStudent);
router.put('/:id', authenticate, authorize('admin', 'teacher'), studentController.updateStudent);
router.delete('/:id', authenticate, authorize('admin'), studentController.deleteStudent);
router.post('/:id/photo', authenticate, authorize('admin', 'teacher'), upload.single('photo'), async (req, res) => {
  try {
    const student = await require('../models').Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    student.photo = req.file.path;
    await student.save();
    res.json({ success: true, message: 'Photo uploaded successfully', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading photo', error: error.message });
  }
});

module.exports = router;

