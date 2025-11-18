const { Payment, Fee, Student, User, Class } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');
const exportService = require('../utils/exportService');

const paymentSchema = Joi.object({
  fee_id: Joi.number().integer().required(),
  amount: Joi.number().positive().required(),
  payment_method: Joi.string().valid('cash', 'bank_transfer', 'cheque', 'other').required(),
  transaction_id: Joi.string().optional().allow('', null),
  payment_date: Joi.date().optional(),
  receipt_number: Joi.string().optional().allow('', null),
  notes: Joi.string().optional().allow('', null)
});

// Helper function to generate receipt number
const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();
  const lastPayment = await Payment.findOne({
    where: {
      receipt_number: { [Op.like]: `RCP${year}%` }
    },
    order: [['receipt_number', 'DESC']]
  });

  let sequence = 1;
  if (lastPayment && lastPayment.receipt_number) {
    const lastSeq = parseInt(lastPayment.receipt_number.slice(-6));
    sequence = lastSeq + 1;
  }

  return `RCP${year}${sequence.toString().padStart(6, '0')}`;
};

exports.createPayment = async (req, res) => {
  try {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validate fee exists
    const fee = await Fee.findByPk(value.fee_id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found'
      });
    }

    // Check if payment amount exceeds remaining balance
    const totalPaid = await Payment.sum('amount', {
      where: { fee_id: value.fee_id }
    }) || 0;

    const remaining = parseFloat(fee.amount) - parseFloat(totalPaid);
    if (parseFloat(value.amount) > remaining) {
      return res.status(400).json({
        success: false,
        message: `Payment amount exceeds remaining balance. Remaining: ${remaining.toFixed(2)}`
      });
    }

    // Generate receipt number if not provided
    if (!value.receipt_number) {
      value.receipt_number = await generateReceiptNumber();
    }

    // Check receipt number uniqueness
    if (value.receipt_number) {
      const existingReceipt = await Payment.findOne({
        where: { receipt_number: value.receipt_number }
      });
      if (existingReceipt) {
        return res.status(400).json({
          success: false,
          message: 'Receipt number already exists'
        });
      }
    }

    // Check transaction ID uniqueness if provided
    if (value.transaction_id) {
      const existingTransaction = await Payment.findOne({
        where: { transaction_id: value.transaction_id }
      });
      if (existingTransaction) {
        return res.status(400).json({
          success: false,
          message: 'Transaction ID already exists'
        });
      }
    }

    value.processed_by = req.user.id;
    if (!value.payment_date) {
      value.payment_date = new Date().toISOString().split('T')[0];
    }

    const payment = await Payment.create(value);

    // Update fee status
    const totalPaidAfter = await Payment.sum('amount', {
      where: { fee_id: value.fee_id }
    }) || 0;

    const amount = parseFloat(fee.amount);
    const paid = parseFloat(totalPaidAfter);

    let status = 'pending';
    if (paid >= amount) {
      status = 'paid';
    } else if (paid > 0) {
      status = 'partial';
    } else if (new Date(fee.due_date) < new Date()) {
      status = 'overdue';
    }

    await fee.update({ status });

    const paymentWithRelations = await Payment.findByPk(payment.id, {
      include: [
        { 
          model: Fee, 
          as: 'fee', 
          include: [
            { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
          ]
        },
        { model: User, as: 'processedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'processed_by' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: paymentWithRelations
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, fee_id, student_id, payment_method, start_date, end_date, class_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (fee_id) where.fee_id = fee_id;
    if (payment_method) where.payment_method = payment_method;
    if (start_date && end_date) {
      where.payment_date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.payment_date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.payment_date = { [Op.lte]: end_date };
    }

    const include = [
      { 
        model: Fee, 
        as: 'fee', 
        include: [
          { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
        ]
      },
      { model: User, as: 'processedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'processed_by' }
    ];

    // Filter by student through fee
    if (student_id) {
      include[0].where = { student_id };
    }

    // Filter by class through fee->student
    if (class_id) {
      include[0].include[0].where = { class_id };
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['payment_date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        payments: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        { 
          model: Fee, 
          as: 'fee', 
          include: [
            { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
          ]
        },
        { model: User, as: 'processedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'processed_by' }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const { error, value } = paymentSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    // If amount changed, validate against fee
    if (value.amount && value.amount !== payment.amount) {
      const fee = await Fee.findByPk(payment.fee_id);
      const totalPaid = await Payment.sum('amount', {
        where: { 
          fee_id: payment.fee_id,
          id: { [Op.ne]: payment.id }
        }
      }) || 0;

      const remaining = parseFloat(fee.amount) - parseFloat(totalPaid);
      if (parseFloat(value.amount) > remaining) {
        return res.status(400).json({
          success: false,
          message: `Payment amount exceeds remaining balance. Remaining: ${remaining.toFixed(2)}`
        });
      }
    }

    await payment.update(value);

    // Update fee status
    const fee = await Fee.findByPk(payment.fee_id);
    const totalPaid = await Payment.sum('amount', {
      where: { fee_id: payment.fee_id }
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

    const updatedPayment = await Payment.findByPk(payment.id, {
      include: [
        { 
          model: Fee, 
          as: 'fee', 
          include: [
            { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
          ]
        },
        { model: User, as: 'processedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'processed_by' }
      ]
    });

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment',
      error: error.message
    });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const feeId = payment.fee_id;
    await payment.destroy();

    // Update fee status
    const fee = await Fee.findByPk(feeId);
    const totalPaid = await Payment.sum('amount', {
      where: { fee_id: feeId }
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

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment',
      error: error.message
    });
  }
};

exports.getFeePayments = async (req, res) => {
  try {
    const { fee_id } = req.params;
    const payments = await Payment.findAll({
      where: { fee_id },
      include: [
        { model: User, as: 'processedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'processed_by' }
      ],
      order: [['payment_date', 'DESC']]
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get fee payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fee payments',
      error: error.message
    });
  }
};

exports.getStudentPayments = async (req, res) => {
  try {
    const { student_id } = req.params;
    const payments = await Payment.findAll({
      include: [
        { 
          model: Fee, 
          as: 'fee',
          where: { student_id },
          include: [
            { model: Student, as: 'student' }
          ]
        },
        { model: User, as: 'processedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'processed_by' }
      ],
      order: [['payment_date', 'DESC']]
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get student payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student payments',
      error: error.message
    });
  }
};

// Generate Payment Receipt PDF
exports.generateReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch payment with all related data
    const payment = await Payment.findByPk(id, {
      include: [
        { 
          model: Fee, 
          as: 'fee', 
          include: [
            { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
          ]
        },
        { model: User, as: 'processedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'processed_by' }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const fee = payment.fee;
    const student = fee?.student;

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student information not found for this payment'
      });
    }

    // Generate PDF
    const pdfBuffer = await exportService.generatePaymentReceiptPDF(payment, fee, student);

    const filename = `receipt-${payment.receipt_number || payment.id}-${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating receipt',
      error: error.message
    });
  }
};

