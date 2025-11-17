const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  section: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  classroom: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  class_teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  academic_year: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'classes'
});

module.exports = Class;

