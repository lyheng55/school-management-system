const { Book, Borrow } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const bookSchema = Joi.object({
  isbn: Joi.string().max(50).optional().allow('', null),
  title: Joi.string().max(200).required(),
  author: Joi.string().max(200).required(),
  publisher: Joi.string().max(200).optional().allow('', null),
  publication_year: Joi.number().integer().min(1000).max(new Date().getFullYear() + 10).optional().allow(null),
  category: Joi.string().max(100).optional().allow('', null),
  total_copies: Joi.number().integer().min(1).required(),
  available_copies: Joi.number().integer().min(0).optional(),
  shelf_location: Joi.string().max(50).optional().allow('', null),
  status: Joi.string().valid('available', 'unavailable', 'lost', 'damaged').optional()
});

// Create book
exports.createBook = async (req, res) => {
  try {
    const { error, value } = bookSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Set available_copies if not provided
    if (value.available_copies === undefined) {
      value.available_copies = value.total_copies;
    }

    // Ensure available_copies doesn't exceed total_copies
    if (value.available_copies > value.total_copies) {
      return res.status(400).json({
        success: false,
        message: 'Available copies cannot exceed total copies'
      });
    }

    const book = await Book.create(value);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    console.error('Create book error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'ISBN already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error.message
    });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status, available_only } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { isbn: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (available_only === 'true') {
      where.available_copies = { [Op.gt]: 0 };
      where.status = 'available';
    }

    const { count, rows } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['title', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        books: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        {
          model: Borrow,
          as: 'borrows',
          where: { status: { [Op.in]: ['borrowed', 'overdue'] } },
          required: false
        }
      ]
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const { error, value } = bookSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    // Ensure available_copies doesn't exceed total_copies
    if (value.available_copies !== undefined && value.available_copies > value.total_copies) {
      return res.status(400).json({
        success: false,
        message: 'Available copies cannot exceed total copies'
      });
    }

    // If total_copies is reduced, adjust available_copies
    if (value.total_copies !== undefined && value.total_copies < book.total_copies) {
      const borrowedCount = await Borrow.count({
        where: {
          book_id: book.id,
          status: { [Op.in]: ['borrowed', 'overdue'] }
        }
      });
      const maxAvailable = value.total_copies - borrowedCount;
      if (value.available_copies === undefined) {
        value.available_copies = Math.max(0, maxAvailable);
      } else if (value.available_copies > maxAvailable) {
        value.available_copies = maxAvailable;
      }
    }

    await book.update(value);

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    console.error('Update book error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'ISBN already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book has active borrows
    const activeBorrows = await Borrow.count({
      where: {
        book_id: book.id,
        status: { [Op.in]: ['borrowed', 'overdue'] }
      }
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active borrows'
      });
    }

    await book.destroy();

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
};

// Get book categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Book.findAll({
      attributes: ['category'],
      where: {
        category: { [Op.ne]: null }
      },
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(c => c.category).filter(Boolean);

    res.json({
      success: true,
      data: categoryList
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

