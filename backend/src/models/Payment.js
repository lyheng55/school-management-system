const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fees',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'online', 'cheque', 'other'),
    allowNull: false
  },
  transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  receipt_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  processed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'payments'
});

module.exports = Payment;

