const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Shop = sequelize.define(
  "Shop",
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
    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categories: {
      type: DataTypes.STRING,
    },
    categories: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue("categories");
        try {
          const parsed = rawValue ? JSON.parse(rawValue) : [];
          return Array.isArray(parsed) ? parsed.map(Number) : [];
        } catch (e) {
          return [];
        }
      },
      set(value) {
        this.setDataValue("categories", JSON.stringify(value));
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    whatsapp: {
      type: DataTypes.STRING,
    },
    website: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING(500),
    },
    address: {
      type: DataTypes.STRING,
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
      type: DataTypes.ENUM("A", "B", "C"),
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
    tableName: "shops",
    timestamps: true,
  }
);

module.exports = Shop;
