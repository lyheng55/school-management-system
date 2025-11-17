const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  fee_type: {
    type: DataTypes.ENUM('tuition', 'library', 'sports', 'lab', 'transport', 'other'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  academic_year: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  term: {
    type: DataTypes.ENUM('first', 'second', 'third', 'annual'),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'partial', 'overdue'),
    defaultValue: 'pending'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'fees'
});

module.exports = Fee;

