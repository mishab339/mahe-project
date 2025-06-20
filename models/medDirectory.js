const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./Category");

const HealthcareProvider = sequelize.define(
  "HealthcareProvider",
  {
    userId: {
      type: DataTypes.INTEGER,
    },
    image: {
      type: DataTypes.STRING,
    },
    icon: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.ENUM("doctor", "hospital"),
      validate: {
        isIn: [["doctor", "hospital"]],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    subCategory: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
        key: "id",
      },
    },
    whatsapp: {
      type: DataTypes.STRING,
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    location: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    address: {
      type: DataTypes.TEXT,
    },
    openingTime: {
      type: DataTypes.STRING,
    },
    closingTime: {
      type: DataTypes.STRING,
    },
    workingDays: {
      type: DataTypes.STRING,
    },
    priority: {
      type: DataTypes.ENUM("A","B","C"),
      validate: {
        isIn: [["A", "B", "C"]],
      },
    },
    area: {
      type: DataTypes.ENUM("mahe", "chokli", "palloor", "pandakkal"),
      validate: {
        isIn: [["mahe", "chokli", "palloor", "pandakkal"]],
      },
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "HealthcareProviders",
  }
);

Category.hasMany(HealthcareProvider,{foreignKey:"subCategory",as:"categoryInfo"})
HealthcareProvider.belongsTo(Category,{foreignKey:"subCategory",as:"categoryInfo"});

module.exports = HealthcareProvider;
