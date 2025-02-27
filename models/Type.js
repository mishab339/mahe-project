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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "types",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Type;
