const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  student_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  photo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergency_contact: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  emergency_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  admission_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'parents',
      key: 'id'
    }
  },
  route_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'routes',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'graduated', 'transferred'),
    defaultValue: 'active'
  }
}, {
  tableName: 'students'
});

module.exports = Student;

