const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Setting = sequelize.define(
  "Setting",
  {
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    academyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    target: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    contacts: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [{ label: "Line", url: "" }],
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = Setting;
