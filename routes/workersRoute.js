const express = require("express");
const router = express.Router();

const workerController = require("../controller/workerController");

router.post("/add-worker-profile",workerController.upload.fields([{ name: "image" }, { name: "icon" }]),workerController.addWorkerProfile);
router.put("/update-worker-profile/:id",workerController.upload.fields([{ name: "image" }, { name: "icon" }]),workerController.updateWorkerProfile);
router.patch("/delete-worker-profile/:id",workerController.deleteWorkerProfile);
router.patch("/restore-worker-profile/:id",workerController.restoreWorkerProfile);
router.get("/get-worker-profiles",workerController.getWorkerProfiles);
router.get("/get-worker-profile/:id",workerController.getWorkerProfileById);

module.exports = router;
