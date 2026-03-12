const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClassStudent = sequelize.define(
  "ClassStudent",
  {
    accountID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    classID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Class", // Name of the related table
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

ClassStudent.associate = (models) => {
  ClassStudent.belongsTo(models.Account, {
    foreignKey: "accountID",
    as: "account",
  });
  ClassStudent.belongsTo(models.Class, {
    foreignKey: "classID",
    as: "class",
  });
};

module.exports = ClassStudent;
