const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  start_location: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  end_location: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  stops: {
    type: DataTypes.JSON,
    allowNull: true
  },
  distance: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  fare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'routes'
});

module.exports = Route;

