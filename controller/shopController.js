require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Shop = require("../models/Shop");
const ShopCategory = require("../models/ShopCategory");
const { json } = require("body-parser");
const { deletefilewithfoldername } = require("../utils/util");

const uploadPath = path.join(__dirname, "../public/uploads/shopImages");
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
  addshop: async (req, res) => {
    try {
      if (!req.files.image || !req.files.icon) {
        return res
          .status(400)
          .json({ message: "Both shopImage and shopIconImage are required" });
      }

      const image = req.files ? req.files.image[0].filename : null;
      const icon = req.files ? req.files.icon[0].filename : null;

      req.body.image = image;
      req.body.icon = icon;

      const savedShop = await Shop.create(req.body);

      if (savedShop.categories && savedShop.categories.length > 0) {
        await ShopCategory.bulkCreate(
          JSON.parse(savedShop.categories).map((category) => ({
            shopId: savedShop.id,
            categoryId: category,
          }))
        );
      }

      res.status(201).json({
        status: "success",
        savedShop: savedShop,
      });
    } catch (error) {
      console.log(error);
      res.status(401).json({
        status: "FAILED",
        message: "An error occured while uploading new shop data",
      });
    }
  },
  getShops: async (req, res) => {
    try {
      const shops = await Shop.findAll({
        attributes: ["id", "shopName", "categories", "status"],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({ success: true, data: shops });
    } catch (error) {
      console.error("Error fetching shops for admin:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching shop data", error });
    }
  },
  getShopById: async (req, res) => {
    try {
      const { shopId } = req.params; // Extract shop ID from URL params

      // Using findByPk to fetch shop data by primary key
      const shop = await Shop.findByPk(shopId);

      if (!shop) {
        return res
          .status(404)
          .json({ success: false, message: "Shop not found" });
      }

      res.status(200).json({ success: true, data: shop });
    } catch (error) {
      console.error("Error fetching shop by ID:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching shop data", error });
    }
  },
  updateShopById: async (req, res) => {
    try {
      const { shopId } = req.params; // Extract shop ID from URL
  
      // Destructure shop details from req.body
      const {
        userId,
        shopName,
        categories,
        phone,
        whatsapp,
        website,
        location,
        description,
        address,
        openingTime,
        closingTime,
        workingDays,
        priority,
        areas,
      } = req.body;

      if (!req.files.image || !req.files.icon) {
        return res
          .status(400)
          .json({ message: "Both shopImage and shopIconImage are required" });
      }
      if(!userId||!shopName||!categories||!phone||!whatsapp||!website||!location||!description||!address||!openingTime||!closingTime||!workingDays||!priority||!areas){
        await deletefilewithfoldername(uploadPath,req.files.image[0]);
        await deletefilewithfoldername(uploadPath,req.files.icon[0]);
        return res.status(400).json({ success: false, message: "data is missing..!!,please fill all the field...!"})
      }
      // Find the shop
      const shop = await Shop.findByPk(shopId);
      if (!shop) {
        await deletefilewithfoldername(uploadPath,req.files.image[0]);
        await deletefilewithfoldername(uploadPath,req.files.icon[0]);
        return res.status(404).json({ message: "Shop not found" });
      }


      // If an image is uploaded, handle file update
 
      if (shop.image) {
        const oldImagePath = path.join(uploadPath, shop.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      if (shop.icon) {
        const oldIconPath = path.join(uploadPath, shop.icon);
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
        }
      }
        
      const updateData = {
        userId,
        shopName,
        categories,
        phone,
        whatsapp,
        website,
        location,
        description,
        address,
        openingTime,
        closingTime,
        workingDays,
        priority,
        areas,
        image:req.files.image[0].filename,
        icon:req.files.icon[0].filename
      };
      await shop.update(updateData);
      return res.status(200).json({ message: "Shop updated successfully", shop });
    } catch (error) {
      await deletefilewithfoldername(uploadPath,req.files.image[0]);
      await deletefilewithfoldername(uploadPath,req.files.icon[0]);
      console.error("Error updating shop:", error);
      return res.status(500).json({ message: "Error updating shop", error });
    }
  },
  deleteShop: async (req, res) => {
    try {
      const { shopId } = req.params; // Get shop ID from request params

      // Find the shop by ID
      const shop = await Shop.findByPk(shopId);

      if (!shop) {
        return res
          .status(404)
          .json({ success: false, message: "Shop not found" });
      }

      // Update the trash field to true (soft delete)
      await shop.update({ trash: true });

      res.status(200).json({
        success: true,
        message: "Shop deleted successfully (soft delete)",
      });
    } catch (error) {
      console.error("Error soft deleting shop:", error);
      res
        .status(500)
        .json({ success: false, message: "Error deleting shop", error });
    }
  },
  restoreShop: async (req, res) => {
    try {
      const { shopId } = req.params; // Get shop ID from request params

      // Find the shop by ID
      const shop = await Shop.findByPk(shopId);

      if (!shop) {
        return res
          .status(404)
          .json({ success: false, message: "Shop not found" });
      }

      if (!shop.trash) {
        return res
          .status(400)
          .json({ success: false, message: "Shop is already active" });
      }

      // Update the trash field to false (restore shop)
      await shop.update({ trash: false });

      res
        .status(200)
        .json({ success: true, message: "Shop restored successfully" });
    } catch (error) {
      console.error("Error restoring shop:", error);
      res
        .status(500)
        .json({ success: false, message: "Error restoring shop", error });
    }
  },
};
