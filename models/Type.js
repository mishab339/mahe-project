const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Type = sequelize.define(
  "Type",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    typeName: {
      type: DataTypes.STRING,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "types",
    timestamps: true,
  }
);

module.exports = Type;
