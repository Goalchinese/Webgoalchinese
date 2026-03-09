const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes"); // Adjust path as needed
const classTypeRoutes = require("./classTypeRoutes"); // Adjust path as needed
const branchRoutes = require("./branchRoutes");
const studentTypeRoutes = require("./studentTypeRoutes");
const teacherTypeRoutes = require("./teacherTypeRoutes");
const materialCategoryRoutes = require("./materialCategoryRoutes");
const materialForRoutes = require("./materialForRoutes");
const materialTypeRoutes = require("./materialTypeRoutes");
const currencyRoutes = require("./currencyRoutes");
const materialsRoutes = require("./materialsRoutes");
const accountRoutes = require("./accountRoutes");
const myMaterialRoutes = require("./myMaterialRoutes");
const settingRoutes = require("./settingRoutes");
const feeStructureRoutes = require("./feeStructureRoutes");
const pointStructureRoutes = require("./pointStructureRoutes");
const classRoutes = require("./classRoutes");
const attendanceRoutes = require("./attendanceRoutes");
const classEventsRoutes = require("./classEventsRoutes");
const dashboardRoutes = require("./dashboardRoutes");

const {
  authenticate,
  authorizeRole,
} = require("../middlewares/authMiddleware");

// Define route groups with the `/api` prefix
router.use("/auth", authRoutes);
router.use("/account", authenticate, accountRoutes);
router.use("/classType", authenticate, classTypeRoutes);
router.use("/branch", authenticate, branchRoutes);
router.use("/studentType", authenticate, studentTypeRoutes);
router.use("/teacherType", authenticate, teacherTypeRoutes);
router.use("/materialCategory", authenticate, materialCategoryRoutes);
router.use("/materialFor", authenticate, materialForRoutes);
router.use("/materialType", authenticate, materialTypeRoutes);
router.use("/currency", authenticate, currencyRoutes);
router.use("/materials", authenticate, materialsRoutes);
router.use("/myMaterial", authenticate, myMaterialRoutes);
router.use("/setting", settingRoutes);
router.use("/feeStructure", authenticate, feeStructureRoutes);
router.use("/pointStructure", authenticate, pointStructureRoutes);
router.use("/classes", authenticate, classRoutes);
router.use("/attendances", authenticate, attendanceRoutes);
router.use("/classEvents", authenticate, classEventsRoutes);
router.use("/dashboard", authenticate, dashboardRoutes);

module.exports = router;
