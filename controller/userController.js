require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const { deletefile, deletefilewithfoldername } = require("../utils/util");
const createToken = require("../utils/createToken");
const { hashPassword } = require("../utils/hashData");
const uploadPath = path.join(__dirname, "../public/uploads/userImages");

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
  createUser: async (req, res) => {
    try {
      const { email, password, phone } = req.body;
      if (!email || !password || !phone) {
        await deletefilewithfoldername(uploadPath, req.file);
        res.status(400).json({
          status: "failed",
          message: "data is missing for user uploading",
        });
      }
      const existingUser = await User.findOne({
        where: { email },
      });
      if (existingUser) {
        await deletefilewithfoldername(uploadPath, req.file);
        res.status(409).json({
          status: "failed",
          message: "User is already existing",
        });
      }
      req.body.password = await hashPassword(password);
      req.body.image = req.file ? req.file.filename : null;
      const savedUser = await User.create(req.body);
      res.json({
        status: "success",
        result: savedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "An error occured while uploading the user data",
      });
    }
  },
  editUser: async (req, res) => {
    const { email, password, phone } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "category icon is required" });
    }
    if (!email || !password || !phone) {
      await deletefilewithfoldername(uploadPath, req.file);
      res.status(400).json({
        status: "failed",
        message: "data is missing for user uploading",
      });
    }
    const user = await User.findByPk(req.params.id);
    const oldImage = user.image;
    console.log(oldImage);
    try {
      if (!user) {
        await deletefilewithfoldername(uploadPath, req.file);
        res.status(409).json({
          status: "failed",
          message: "collage not found",
        });
      }
      const updatedUserData = {
        ...req.body,
        image: req.file ? req.file.filename : null,
      };
      await user.update(updatedUserData);
      try {
        if (oldImage) {
          const coverPath = path.join(uploadPath, oldImage);
          if (fs.existsSync(coverPath)) {
            fs.unlinkSync(coverPath);
          }
        }
      } catch (error) {
        console.log("error on deleting old user image: ", error);
      }
      res.status(200).json({
        status: "success",
        result: user,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "An error occured while updating the user data",
      });
    }
  },
  userLogin: async (req, res) => {
    const { email, password } = req.body;
    console.log("email: " + email, "password :" + password);
    if (!email || !password) {
      res.status(409).json({
        status: "failed",
        message: "email and password is required..!!",
      });
    }
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      res.status(403).json({
        status: "failed",
        message: "invalid email or email is not registered..!",
      });
    }
    if (password !== user.password) {
      res.status(401).json({
        status: "failed",
        message: "invalid password..!",
      });
    }
    const tokenData = { userId: user._id, email };
    const token = await createToken(tokenData);
    if (!token) {
      res.status(401).json({
        status: "failed",
        message: "An error occured while creating jwt Token",
      });
    }
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.status(200).json({
      status: "success",
      result: user,
    });
  },
  Logout: async (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully!" });
    });
  },
};
