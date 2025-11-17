const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/teachers/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'teacher-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

router.get('/', authenticate, teacherController.getAllTeachers);
router.get('/:id', authenticate, teacherController.getTeacherById);
router.post('/', authenticate, authorize('admin'), teacherController.createTeacher);
router.put('/:id', authenticate, authorize('admin'), teacherController.updateTeacher);
router.delete('/:id', authenticate, authorize('admin'), teacherController.deleteTeacher);
router.post('/:id/photo', authenticate, authorize('admin'), upload.single('photo'), async (req, res) => {
  try {
    const teacher = await require('../models').Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    teacher.photo = req.file.path;
    await teacher.save();
    res.json({ success: true, message: 'Photo uploaded successfully', data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading photo', error: error.message });
  }
});

module.exports = router;

