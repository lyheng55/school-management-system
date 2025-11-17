const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/students', require('./students'));
router.use('/teachers', require('./teachers'));
router.use('/classes', require('./classes'));
router.use('/subjects', require('./subjects'));
router.use('/timetables', require('./timetables'));
router.use('/attendance', require('./attendance'));
router.use('/exams', require('./exams'));
router.use('/grades', require('./grades'));
router.use('/behaviors', require('./behaviors'));
router.use('/achievements', require('./achievements'));
router.use('/fees', require('./fees'));
router.use('/payments', require('./payments'));
router.use('/messages', require('./messages'));
router.use('/announcements', require('./announcements'));
router.use('/events', require('./events'));
router.use('/books', require('./books'));
router.use('/borrows', require('./borrows'));
router.use('/parents', require('./parents'));
router.use('/routes', require('./routes'));
router.use('/vehicles', require('./vehicles'));
router.use('/drivers', require('./drivers'));
router.use('/assets', require('./assets'));
router.use('/maintenances', require('./maintenances'));
router.use('/analytics', require('./analytics'));

module.exports = router;

