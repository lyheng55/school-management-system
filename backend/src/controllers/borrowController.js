const { Borrow, Book, Student, User } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const borrowSchema = Joi.object({
  book_id: Joi.number().integer().required(),
  student_id: Joi.number().integer().required(),
  borrow_date: Joi.date().optional(),
  due_date: Joi.date().required()
});

const returnSchema = Joi.object({
  return_date: Joi.date().optional(),
  status: Joi.string().valid('returned', 'lost').optional()
});

// Calculate late fee based on days overdue
const calculateLateFee = (dueDate, returnDate, dailyFeeRate = 0.5) => {
  const due = new Date(dueDate);
  const returned = returnDate ? new Date(returnDate) : new Date();
  const daysOverdue = Math.max(0, Math.ceil((returned - due) / (1000 * 60 * 60 * 24)));
  return daysOverdue * dailyFeeRate;
};

// Create borrow record
exports.createBorrow = async (req, res) => {
  try {
    const { error, value } = borrowSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if book exists and is available
    const book = await Book.findByPk(value.book_id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No copies available for this book'
      });
    }

    if (book.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for borrowing'
      });
    }

    // Check if student exists
    const student = await Student.findByPk(value.student_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if student already has this book borrowed
    const existingBorrow = await Borrow.findOne({
      where: {
        book_id: value.book_id,
        student_id: value.student_id,
        status: { [Op.in]: ['borrowed', 'overdue'] }
      }
    });

    if (existingBorrow) {
      return res.status(400).json({
        success: false,
        message: 'Student already has this book borrowed'
      });
    }

    // Set borrow_date if not provided
    if (!value.borrow_date) {
      value.borrow_date = new Date().toISOString().split('T')[0];
    }

    const borrow = await Borrow.create({
      ...value,
      status: 'borrowed'
    });

    // Update book available copies
    await book.decrement('available_copies');

    const borrowWithRelations = await Borrow.findByPk(borrow.id, {
      include: [
        { model: Book, as: 'book' },
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: borrowWithRelations
    });
  } catch (error) {
    console.error('Create borrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating borrow record',
      error: error.message
    });
  }
};

// Get all borrows
exports.getAllBorrows = async (req, res) => {
  try {
    const { page = 1, limit = 20, student_id, book_id, status, overdue_only } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (student_id) {
      where.student_id = student_id;
    }

    if (book_id) {
      where.book_id = book_id;
    }

    if (status) {
      where.status = status;
    }

    if (overdue_only === 'true') {
      where.status = { [Op.in]: ['borrowed', 'overdue'] };
      where.due_date = { [Op.lt]: new Date().toISOString().split('T')[0] };
    }

    const { count, rows } = await Borrow.findAndCountAll({
      where,
      include: [
        { model: Book, as: 'book' },
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['borrow_date', 'DESC']]
    });

    // Update overdue status for borrowed books
    const today = new Date().toISOString().split('T')[0];
    for (const borrow of rows) {
      if (borrow.status === 'borrowed' && borrow.due_date < today) {
        await borrow.update({ status: 'overdue' });
        borrow.status = 'overdue';
      }
    }

    res.json({
      success: true,
      data: {
        borrows: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get borrows error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching borrows',
      error: error.message
    });
  }
};

// Get borrow by ID
exports.getBorrowById = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, {
      include: [
        { model: Book, as: 'book' },
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }] }
      ]
    });

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found'
      });
    }

    res.json({
      success: true,
      data: borrow
    });
  } catch (error) {
    console.error('Get borrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching borrow record',
      error: error.message
    });
  }
};

// Return book
exports.returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id);
    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found'
      });
    }

    if (borrow.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Book already returned'
      });
    }

    const { error, value } = returnSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const returnDate = value.return_date || new Date().toISOString().split('T')[0];
    const status = value.status || 'returned';

    // Calculate late fee if overdue
    let lateFee = 0;
    if (new Date(returnDate) > new Date(borrow.due_date)) {
      lateFee = calculateLateFee(borrow.due_date, returnDate);
    }

    await borrow.update({
      return_date: returnDate,
      status: status,
      late_fee: lateFee
    });

    // Update book available copies
    const book = await Book.findByPk(borrow.book_id);
    if (book) {
      await book.increment('available_copies');
    }

    const updatedBorrow = await Borrow.findByPk(borrow.id, {
      include: [
        { model: Book, as: 'book' },
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }] }
      ]
    });

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: updatedBorrow
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error returning book',
      error: error.message
    });
  }
};

// Update borrow
exports.updateBorrow = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id);
    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found'
      });
    }

    const { error, value } = borrowSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await borrow.update(value);

    const updatedBorrow = await Borrow.findByPk(borrow.id, {
      include: [
        { model: Book, as: 'book' },
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }] }
      ]
    });

    res.json({
      success: true,
      message: 'Borrow record updated successfully',
      data: updatedBorrow
    });
  } catch (error) {
    console.error('Update borrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating borrow record',
      error: error.message
    });
  }
};

// Delete borrow
exports.deleteBorrow = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id);
    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found'
      });
    }

    // If book is still borrowed, increment available copies
    if (borrow.status === 'borrowed' || borrow.status === 'overdue') {
      const book = await Book.findByPk(borrow.book_id);
      if (book) {
        await book.increment('available_copies');
      }
    }

    await borrow.destroy();

    res.json({
      success: true,
      message: 'Borrow record deleted successfully'
    });
  } catch (error) {
    console.error('Delete borrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting borrow record',
      error: error.message
    });
  }
};

// Get overdue borrows
exports.getOverdueBorrows = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Update overdue status
    await Borrow.update(
      { status: 'overdue' },
      {
        where: {
          status: 'borrowed',
          due_date: { [Op.lt]: today }
        }
      }
    );

    const overdueBorrows = await Borrow.findAll({
      where: {
        status: 'overdue'
      },
      include: [
        { model: Book, as: 'book' },
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }] }
      ],
      order: [['due_date', 'ASC']]
    });

    // Calculate late fees for overdue books
    const borrowsWithFees = overdueBorrows.map(borrow => {
      const lateFee = calculateLateFee(borrow.due_date, null);
      return {
        ...borrow.toJSON(),
        calculated_late_fee: lateFee
      };
    });

    res.json({
      success: true,
      data: borrowsWithFees
    });
  } catch (error) {
    console.error('Get overdue borrows error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue borrows',
      error: error.message
    });
  }
};

