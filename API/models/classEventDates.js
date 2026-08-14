const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClassEventDates = sequelize.define(
  "ClassEventDates",
  {
    eventId: {
      type: DataTypes.INTEGER,
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
  },
  {
    freezeTableName: true,
    indexes: [
      { fields: ["eventId"] },
      { fields: ["startDate", "endDate"] },
      { fields: ["startDate"] },
      { fields: ["eventId", "startDate"] },
    ],
  }
);

ClassEventDates.associate = (models) => {
  ClassEventDates.belongsTo(models.ClassEvents, {
    foreignKey: "eventId",
    as: "event",
    onDelete: "cascade",
    hooks: true,
  });
};

module.exports = ClassEventDates;
