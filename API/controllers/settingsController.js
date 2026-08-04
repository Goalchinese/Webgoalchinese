const logger = require("../logger");
const { Setting } = require("../models"); // Adjust the path to your models
const fs = require("fs");
const path = require("path");
// Upload logo and update academyName
exports.create = async (req, res) => {
  try {
    const { academyName, target, contacts } = req.body; // Extract fields from the request body
    const parsedContacts =
      typeof contacts === "string" ? JSON.parse(contacts) : contacts;

    // Find the existing setting (or create one if necessary)
    let setting = await Setting.findOne();
    if (!setting) {
      if (!req.files) {
        setting = await Setting.create({
          academyName,
          logo: req.files?.logo ? req.files.logo[0].path : null,
          target,
          contacts: parsedContacts,
        });
      } else {
        setting = await Setting.create({ academyName, target, contacts: parsedContacts });
      }
    } else {
      setting.academyName = academyName;
      setting.target = target;
      if (parsedContacts !== undefined) setting.contacts = parsedContacts;
      if (req.files)
        setting.logo = req.files?.logo ? req.files.logo[0].path : setting.logo; // Save the uploaded file path in the 'logo' column
      await setting.save();
    }

    res.status(200).json({ message: "Settings updated successfully", setting });

    logger.info(
      `Settings updated: ${setting.id} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Currencies
exports.findAll = async (req, res) => {
  try {
    const setting = await Setting.findAll();
    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific Currency by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const setting = await Setting.findByPk(id);
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a Currency by ID
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Setting.update(req.body, { where: { id } });
    if (!updated) {
      return res.status(404).json({ error: "Setting not found" });
    }
    const updatedSetting = await Setting.findByPk(id);
    res.status(200).json(updatedSetting);

    logger.info(
      `Setting updated: ${id} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete the image and update the database
exports.deleteImage = async (req, res) => {
  try {
    // Find the Setting record by ID
    let setting = await Setting.findOne();
    if (!setting || !setting.logo) {
      return res.status(404).json({ error: "Image or setting not found" });
    }

    const imagePath = path.resolve(setting.logo); // Resolve full path to the image

    // Remove the image file
    fs.unlink(imagePath, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Failed to delete image file", details: err.message });
      }

      // Remove image reference from the database
      setting.logo = null;
      await setting.save();

      res.status(200).json({ message: "Image deleted successfully", setting });
    });

    logger.info(
      `Settings Logo deleted: ${setting.id} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
