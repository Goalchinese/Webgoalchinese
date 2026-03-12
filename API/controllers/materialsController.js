const logger = require("../logger");
const { Materials } = require("../models"); // Ensure the path to your models is correct
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

// Create a new Material with optional photo and document upload
exports.create = async (req, res) => {
  try {
    const {
      title,
      description,
      categoryID,
      materialForID,
      materialTypeID,
      no,
      link,
      documentType,
    } = req.body;

    const photo = req.files?.photo ? req.files.photo[0].path : null; // Handle optional photo
    const document = req.files?.document ? req.files.document[0].path : null; // Handle optional document
    const originalDocumentName = req.files?.document ? Buffer.from(req.files.document[0].originalname, 'latin1').toString('utf8') : null;

    const material = await Materials.create({
      title,
      description,
      photo,
      document,
      originalDocumentName,
      categoryID,
      materialForID,
      materialTypeID,
      no,
      link,
      documentType,
    });

    res
      .status(201)
      .json({ message: "Material created successfully", material });

    logger.info(
      `Material created: ${material.id} by [${req.user.id}] ${req.user.username}`
    );
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};

// Update a Material by ID with optional photo and document upload
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      categoryID,
      materialForID,
      materialTypeID,
      no,
      link,
      documentType,
    } = req.body;

    const material = await Materials.findByPk(id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    const photo = req.files?.photo ? req.files.photo[0].path : material.photo; // Use existing or new photo
    const document = req.files?.document
      ? req.files.document[0].path
      : material.document; // Use existing or new document
    const originalDocumentName = req.files?.document 
      ? Buffer.from(req.files.document[0].originalname, 'latin1').toString('utf8')
      : material.originalDocumentName; // Use existing or new original name

    material.title = title || material.title;
    material.description = description || material.description;
    material.photo = photo;
    material.document = document;
    material.originalDocumentName = originalDocumentName;
    material.categoryID = categoryID || material.categoryID;
    material.materialForID = materialForID || material.materialForID;
    material.materialTypeID = materialTypeID || material.materialTypeID;
    material.no = no || material.no;
    material.link = link || material.link;
    material.documentType = documentType || material.documentType;

    await material.save();

    res
      .status(200)
      .json({ message: "Material updated successfully", material });

    logger.info(
      `Material updated: ${material.id} by [${req.user.id}] ${req.user.username}`
    );
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};

// Get all Materials
exports.findAll = async (req, res, next) => {
  try {
    const { materialFor, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (materialFor) {
      where = {
        "$materialFor.name$": materialFor.toLowerCase(),
      };
    }
    if (search) {
      where = {
        ...where,
        [Op.or]: [
          { "$Materials.title$": { [Op.like]: `%${search}%` } },
          { "$Materials.no$": { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // Get total count for pagination
    const total = await Materials.count({
      where,
      include: materialFor ? [
        {
          association: "materialFor",
          attributes: ["id", "name"],
        },
      ] : [],
    });

    const materials = await Materials.findAll({
      where,
      order: [["no", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          association: "materialCategory",
          attributes: ["id", "name"],
        },
        {
          association: "materialFor",
          attributes: ["id", "name"],
        },
        {
          association: "materialType",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      data: materials,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};

// Get a specific Material by ID
exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await Materials.findByPk(id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.status(200).json(material);
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};

// Delete a Material by ID
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    let material = await Materials.findByPk(id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    if (material.photo) {
      const imagePath = path.resolve(material.photo);
      // Remove the image file
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    if (material.document) {
      const documentPath = path.resolve(material.document);
      // Remove the document file
      fs.unlink(documentPath, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    const deleted = await Materials.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.status(204).send();

    logger.info(
      `Material deleted: ${id} by [${req.user.id}] ${req.user.username}`
    );
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};

// Delete image from an Account by ID
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    let material = await Materials.findByPk(id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    if (material.photo) {
      const imagePath = path.resolve(material.photo);
      // Remove the image file
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    // Update the Account with the filtered data
    await material.update({ photo: null });
    res.status(200).json({ message: "Image deleted successfully" });

    logger.info(
      `Material image deleted: ${id} by [${req.user.id}] ${req.user.username}`
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
