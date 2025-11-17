const { Fee, Student, Payment, Class } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

const feeSchema = Joi.object({
  student_id: Joi.number().integer().required(),
  fee_type: Joi.string().valid('tuition', 'library', 'sports', 'lab', 'transport', 'other').required(),
  amount: Joi.number().positive().required(),
  due_date: Joi.date().required(),
  academic_year: Joi.string().required(),
  term: Joi.string().valid('first', 'second', 'third', 'annual').optional().allow('', null),
  description: Joi.string().optional().allow('', null)
});

// Helper function to update fee status based on payments
const updateFeeStatus = async (fee) => {
  const totalPaid = await Payment.sum('amount', {
    where: { fee_id: fee.id }
  }) || 0;

  const amount = parseFloat(fee.amount);
  const paid = parseFloat(totalPaid);

  let status = 'pending';
  if (paid >= amount) {
    status = 'paid';
  } else if (paid > 0) {
    status = 'partial';
  } else if (new Date(fee.due_date) < new Date()) {
    status = 'overdue';
  }

  await fee.update({ status });
  return status;
};

exports.createFee = async (req, res) => {
  try {
    const { error, value } = feeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validate that student exists
    const student = await Student.findByPk(value.student_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Set initial status
    value.status = 'pending';
    if (new Date(value.due_date) < new Date()) {
      value.status = 'overdue';
    }

    const fee = await Fee.create(value);
    const feeWithRelations = await Fee.findByPk(fee.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
        { model: Payment, as: 'payments' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: feeWithRelations
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fee',
      error: error.message
    });
  }
};

exports.getAllFees = async (req, res) => {
  try {
    const { page = 1, limit = 10, student_id, fee_type, status, class_id, academic_year, term } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (student_id) where.student_id = student_id;
    if (fee_type) where.fee_type = fee_type;
    if (status) where.status = status;
    if (academic_year) where.academic_year = academic_year;
    if (term) where.term = term;

    const include = [
      { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
      { model: Payment, as: 'payments' }
    ];

    // Filter by class through student
    if (class_id) {
      include[0].where = { class_id };
    }

    const { count, rows } = await Fee.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['due_date', 'ASC']]
    });

    // Update status for each fee based on payments
    for (const fee of rows) {
      await updateFeeStatus(fee);
    }

    res.json({
      success: true,
      data: {
        fees: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fees',
      error: error.message
    });
  }
};

exports.getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
        { model: Payment, as: 'payments' }
      ]
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found'
      });
    }

    await updateFeeStatus(fee);
    const updatedFee = await Fee.findByPk(fee.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
        { model: Payment, as: 'payments' }
      ]
    });

    res.json({
      success: true,
      data: updatedFee
    });
  } catch (error) {
    console.error('Get fee by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fee',
      error: error.message
    });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found'
      });
    }

    const { error, value } = feeSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await fee.update(value);
    await updateFeeStatus(fee);
    
    const updatedFee = await Fee.findByPk(fee.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
        { model: Payment, as: 'payments' }
      ]
    });

    res.json({
      success: true,
      message: 'Fee updated successfully',
      data: updatedFee
    });
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating fee',
      error: error.message
    });
  }
};

exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found'
      });
    }

    // Check if there are payments
    const paymentCount = await Payment.count({ where: { fee_id: fee.id } });
    if (paymentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete fee with existing payments'
      });
    }

    await fee.destroy();

    res.json({
      success: true,
      message: 'Fee deleted successfully'
    });
  } catch (error) {
    console.error('Delete fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fee',
      error: error.message
    });
  }
};

exports.getStudentFees = async (req, res) => {
  try {
    const { student_id } = req.params;
    const fees = await Fee.findAll({
      where: { student_id },
      include: [
        { model: Payment, as: 'payments' }
      ],
      order: [['due_date', 'ASC']]
    });

    // Update status for each fee
    for (const fee of fees) {
      await updateFeeStatus(fee);
    }

    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student fees',
      error: error.message
    });
  }
};

exports.getFeeSummary = async (req, res) => {
  try {
    const { student_id, academic_year, class_id } = req.query;

    const where = {};
    if (student_id) where.student_id = student_id;
    if (academic_year) where.academic_year = academic_year;

    const include = [
      { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
      { model: Payment, as: 'payments' }
    ];

    if (class_id) {
      include[0].where = { class_id };
    }

    const fees = await Fee.findAll({
      where,
      include
    });

    let totalAmount = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    for (const fee of fees) {
      const amount = parseFloat(fee.amount);
      const paid = fee.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
      
      totalAmount += amount;
      totalPaid += paid;
      totalPending += (amount - paid);

      if (fee.status === 'overdue') {
        totalOverdue += (amount - paid);
      }
    }

    res.json({
      success: true,
      data: {
        total_amount: totalAmount,
        total_paid: totalPaid,
        total_pending: totalPending,
        total_overdue: totalOverdue,
        fee_count: fees.length
      }
    });
  } catch (error) {
    console.error('Get fee summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fee summary',
      error: error.message
    });
  }
};

exports.bulkCreateFees = async (req, res) => {
  try {
    const { fees, class_id, academic_year, term } = req.body;

    if (!Array.isArray(fees) || fees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Fees array is required'
      });
    }

    if (!academic_year) {
      return res.status(400).json({
        success: false,
        message: 'Academic year is required'
      });
    }

    const results = [];
    for (const feeData of fees) {
      const { error, value } = feeSchema.validate({
        ...feeData,
        academic_year,
        term: term || feeData.term
      });

      if (error) {
        results.push({ student_id: feeData.student_id, error: error.details[0].message });
        continue;
      }

      try {
        // If class_id provided, validate student belongs to class
        if (class_id) {
          const student = await Student.findByPk(value.student_id);
          if (!student || student.class_id !== parseInt(class_id)) {
            results.push({ student_id: value.student_id, error: 'Student not in specified class' });
            continue;
          }
        }

        value.status = 'pending';
        if (new Date(value.due_date) < new Date()) {
          value.status = 'overdue';
        }

        const fee = await Fee.create(value);
        results.push({ student_id: value.student_id, success: true, fee });
      } catch (err) {
        results.push({ student_id: feeData.student_id, error: err.message });
      }
    }

    res.json({
      success: true,
      message: 'Bulk fees created',
      data: results
    });
  } catch (error) {
    console.error('Bulk create fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk fees',
      error: error.message
    });
  }
};

