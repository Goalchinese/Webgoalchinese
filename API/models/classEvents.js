const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClassEvents = sequelize.define(
  "ClassEvents",
  {
    classId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
    },
    color: {
      type: DataTypes.STRING,
    },
    updateBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    indexes: [
      { fields: ["classId"] },
      { fields: ["updateBy"] },
      { fields: ["startDate", "endDate"] },
      { fields: ["startDate"] },
      { fields: ["classId", "startDate"] },
    ],
  }
);

ClassEvents.associate = (models) => {
  ClassEvents.belongsTo(models.Account, {
    foreignKey: "updateBy",
    as: "updatedBy",
    onDelete: "cascade",
    hooks: true,
  });
  ClassEvents.belongsTo(models.Class, {
    foreignKey: "classId",
    as: "class",
    onDelete: "cascade",
    hooks: true,
  });
};

module.exports = ClassEvents;
