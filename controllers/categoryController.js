require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");
const Type = require("../models/Type");
const { deletefilewithfoldername } = require("../utils/deleteFile");
const { Op } = require("sequelize");

const uploadPath = path.join(__dirname, "../public/uploads/categoryImages");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

module.exports = {
  upload,
  addCategory: async (req, res) => {
    try {
      const categoryData = {
        ...req.body,
        icon: req.file ? req.file.filename : null,
      };
      const savedCategory = await Category.create(categoryData);
      if (!savedCategory) {
        await deletefilewithfoldername(uploadPath, req.file?.filename);
        res.status(404).json({
          success: false,
          message: "Can't upload Category Data",
        });
      }
      res.status(200).json({
        success: true,
        data: savedCategory,
      });
    } catch (error) {
      await deletefilewithfoldername(uploadPath, req.file?.filename);
      console.log(error);
      res.status(500).json({
        success: false,
        message: "An error occure while uploading Category data",
      });
    }
  },
  updateCategory: async (req, res) => {
    const { userId, typeId, categoryName, description } = req.body;
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        res.status(400).json({ success: false, message: "Category not found" });
      }
      let newIcon = null;
      if (req.file) {
        if (category.icon) {
          const oldImagePath = path.join(uploadPath, category.icon);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        newIcon = req.file.filename;
      }
      await category.update({
        userId: userId || category.userId,
        typeId: typeId || category.typeId,
        categoryName: categoryName || category.categoryName,
        description: description || category.description,
        icon: newIcon,
      });
      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      res
        .status(500)
        .json({ success: false, message: "Error updating category" });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: "Product not found" });
      }
      await category.update({ trash: true });
      res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  restoreCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      await category.update({ trash: false });
      res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getCategories: async (req, res) => {
    const search = req.query.search || "";
    const type = req.query.type || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { categoryName: { [Op.like]: `%${search}%` } },
          { "$type.typeName$": { [Op.like]: `%${search}%` } },
        ],
      };
    }
    try {
      const { count, rows: categories } = await Category.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        include: [
          {
            model: Type,
            attributes: ["id", "typeName"],
            as: "type",
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      if (!categories) {
        return res
          .status(404)
          .json({ success: false, message: "No categories found" });
      }
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: categories,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      return res.status(200).json({ success: true, category });
    } catch (error) {
      console.error("Error fetching category:", error);
      return res.status(500).json({ message: error.message });
    }
  },
  addType: async (req, res) => {
    try {
      const data = req.body;
      const newType = await Type.bulkCreate(data);
      res.status(201).json({ success: true, data: newType });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteType: async (req, res) => {
    try {
      const { id } = req.params;
      const type = await Type.findByPk(id);
      if (!type)
        return res
          .status(404)
          .json({ success: false, message: "Type not found" });
      await type.update({ trash: true });
      res.json({ success: true, data: type });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  restoreType: async (req, res) => {
    try {
      const { id } = req.params;
      const type = await Type.findByPk(id);
      if (!type)
        return res
          .status(404)
          .json({ success: false, message: "Type not found" });
      await type.update({ trash: false });
      res.json({ success: true, data: type });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getTypes: async (req, res) => {
    try {
      const types = await Type.findAll();
      res.json({ success: true, types });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getTypeById: async (req, res) => {
    try {
      const { id } = req.params;
      const type = await Type.findByPk(id);
      if (!type)
        return res
          .status(404)
          .json({ success: false, message: "Type not found" });
      res.status(200).json({
        success: true,
        data: type,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
