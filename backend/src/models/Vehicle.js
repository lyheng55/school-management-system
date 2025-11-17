const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicle_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  vehicle_type: {
    type: DataTypes.ENUM('bus', 'van', 'car', 'other'),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  route_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'routes',
      key: 'id'
    }
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'drivers',
      key: 'id'
    }
  },
  registration_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  insurance_expiry: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    defaultValue: 'active'
  }
}, {
  tableName: 'vehicles'
});

module.exports = Vehicle;

