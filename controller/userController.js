require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { deletefile, deletefilewithfoldername } = require("../utils/util");
const createToken = require("../utils/createToken");
const { hashPassword } = require("../utils/hashData");

const User = require("../models/User");
const Feedback = require("../models/Feedback");
const Complaint = require("../models/Complaint");

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
        // await deletefilewithfoldername(uploadPath, req.file.filename);
        res.status(400).json({
          status: "failed",
          message: "data is missing for user uploading",
        });
      }
      const existingUser = await User.findOne({
        where: { email },
      });
      if (existingUser) {
        // await deletefilewithfoldername(uploadPath, req.file.filename);
        res.status(409).json({
          status: "failed",
          message: "User is already existing",
        });
      } else {
        const userData = {
          ...req.body,
          image: req.file ? req.file.filename : null,
          password: await hashPassword(password),
        };
        const savedUser = await User.create(userData);
        res.json({
          status: "success",
          result: savedUser,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "An error occured while uploading the user data",
      });
    }
  },
  editUser: async (req, res) => {
    // const { email, password, phone } = req.body;
    // if (!email || !password || !phone) {
    //   await deletefilewithfoldername(uploadPath, req.file.filename);
    //   res.status(400).json({
    //     status: "failed",
    //     message: "data is missing for user uploading",
    //   });
    // }

    const user = await User.findByPk(req.params.id);
    const oldImage = user.image;
    console.log(oldImage);
    try {
      if (!user) {
        // await deletefilewithfoldername(uploadPath, req.file.filename);
        res.status(409).json({
          status: "failed",
          message: "collage not found",
        });
      }
      const updatedUserData = {
        ...req.body,
        password: await hashPassword(req.body.password),
        image: req.file ? req.file.filename : oldImage,
      };
      await user.update(updatedUserData);
      try {
        if (req.file?.filename) {
          if (oldImage) {
            const coverPath = path.join(uploadPath, oldImage);
            if (fs.existsSync(coverPath)) {
              fs.unlinkSync(coverPath);
            }
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
      // await deletefilewithfoldername(uploadPath, req.file.filename);
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "An error occured while updating the user data",
      });
    }
  },
  userLogin: async (req, res) => {
    const { email, password } = req.body;
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        status: "failed",
        message: "invalid password..!",
      });
    }
    const tokenData = { userId: user._id, email: user.email };
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
  geDashboard: async (req, res) => {
    console.log(req.body);
    res.status(200).json({
      status: "success",
      message: "successfully registered...!",
    });
  },
  feedback: async (req, res) => {
    try {
      const { userId, shopId, rating } = req.body;

      // Validate input
      if (!userId || !shopId || !rating) {
        return res
          .status(400)
          .json({ error: "User ID, Event ID, and Rating are required!" });
      }

      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5" });
      }

      // Create feedback entry
      const feedback = await Feedback.create({
        userId,
        shopId,
        rating,
      });

      res
        .status(201)
        .json({ message: "Feedback added successfully!", feedback });
    } catch (error) {
      console.error("Error adding feedback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  complaints: async (req, res) => {
    try {
      const { userId, shopId, title, description } = req.body;

      // if (!userId || !shopId || !title || !description) {
      //   return res.status(400).json({ error: "All fields are required!" });
      // }

      const complaint = await Complaint.create({
        userId,
        shopId,
        title,
        description,
      });

      res
        .status(201)
        .json({ message: "Complaint filed successfully!", complaint });
    } catch (error) {
      console.error("Error filing complaint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getAllComplaints: async (req, res) => {
    try {
      const complaints = await Complaint.findAll();
      res.status(200).json(complaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getComplaintsById: async (req, res) => {
    try {
      const complaints = await Complaint.findAll({
        where: { userId: req.params.userId },
      });
      res.status(200).json(complaints);
    } catch (error) {
      console.error("Error fetching user complaints:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  updateComplaints: async (req, res) => {
    try {
      const { status, resolution } = req.body;
      const complaint = await Complaint.findByPk(req.params.id);

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      await complaint.update({ status, resolution });

      res
        .status(200)
        .json({ message: "Complaint updated successfully!", complaint });
    } catch (error) {
      console.error("Error updating complaint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  deleteComplaints: async (req, res) => {
    try {
      const complaint = await Complaint.findByPk(req.params.id);

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      await complaint.update({ trash: true });
      res
        .status(200)
        .json({ message: "Complaint deleted successfully!", complaint });
    } catch (error) {
      console.error("Error deleting complaint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  Logout: async (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully!" });
    });
  },
};
