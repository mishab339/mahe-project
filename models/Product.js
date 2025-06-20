const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Shop = require("./Shop");

const Product = sequelize.define(
  "Product",
  {
    userId: {
      type: DataTypes.INTEGER,
    },
    shopId: {
      type: DataTypes.INTEGER,
      references: {
        model: Shop,
        key: "id",
      },
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    image: {
      type: DataTypes.STRING,
    },
    originalPrice: {
      type: DataTypes.FLOAT,
      validate: {
        min: 0,
      },
    },
    offerPrice: {
      type: DataTypes.FLOAT,
      validate: {
        min: 0,
      },
    },
    offerPercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    description: {
      type: DataTypes.STRING,
      trim: true,
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

Shop.hasMany(Product, { foreignKey: "shopId", as: "products" });
Product.belongsTo(Shop, { foreignKey: "shopId", as: "shop" });

module.exports = Product;
