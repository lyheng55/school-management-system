const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    }
  },
  exam_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  total_marks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100
  },
  passing_marks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 40
  },
  room: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'exams'
});

module.exports = Exam;

