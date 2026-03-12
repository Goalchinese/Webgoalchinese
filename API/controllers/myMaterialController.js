const logger = require("../logger");
const { MyMaterial, Materials, User } = require("../models"); // Ensure correct path to your models
const { Op } = require("sequelize");

// Create a new MyMaterial record
exports.create = async (req, res) => {
  try {
    const { accountID, materials } = req.body;

    if (!accountID.length || !materials.length) {
      return res
        .status(400)
        .json({ error: "Both accountID and materialID are required" });
    }

    // Create all possible combinations at once
    const combinations = [];
    for (const accountId of accountID) {
      for (const materialId of materials) {
        combinations.push({
          accountID: accountId,
          materialID: materialId,
        });
      }
    }

    // Use bulkCreate with ignoreDuplicates to prevent duplicates
    await MyMaterial.bulkCreate(combinations, {
      ignoreDuplicates: true,
    });

    res.status(201).json({
      message: "My Material created successfully",
    });

    logger.info(`My Material created: by [${req.user.id}]${req.user.username}`);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all MyMaterial records
exports.findAll = async (req, res) => {
  try {
    const myMaterials = await MyMaterial.findAll();
    res.status(200).json(myMaterials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific MyMaterial by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const myMaterial = await MyMaterial.findByPk(id);

    if (!myMaterial) {
      return res.status(404).json({ error: "My Material not found" });
    }

    res.status(200).json(myMaterial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all materials for a specific account by accountId
exports.getMaterialsByAccountId = async (req, res) => {
  try {
    const { accountID } = req.params;
    const { last, type } = req.query;

    let where = { accountID };
    if (last) {
      const lastMaterial = await MyMaterial.findOne({
        where: { accountID },
        order: [["updatedAt", "DESC"]],
      });

      if (!lastMaterial) {
        return res.status(404).json({ error: "My Material not found" });
      }

      where = {
        accountID,
        updatedAt: {
          [Op.between]: [
            new Date(
              `${new Date(lastMaterial.updatedAt)
                .toISOString()
                .substring(0, 10)}T00:00:00`
            ),
            new Date(
              `${new Date(lastMaterial.updatedAt)
                .toISOString()
                .substring(0, 10)}T23:59:59`
            ),
          ],
        },
      };
    }

    if (type) {
      if (type === "all") {
        where = {
          ...where,
          "$material.materialFor.name$": {
            [Op.ne]: "library",
          },
        };
      } else {
        where = {
          ...where,
          "$material.materialFor.name$": type,
        };
      }
    }

    const myMaterials = await MyMaterial.findAll({
      where,
      include: {
        model: Materials,
        as: "material",
        attributes: { exclude: ["updatedAt"] },
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
      },
    });

    // Return empty array instead of 404 for library materials
    if (!myMaterials.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(myMaterials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an MyMaterial by ID
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountID, materialID } = req.body;

    const myMaterial = await MyMaterial.findByPk(id);

    if (!myMaterial) {
      return res.status(404).json({ error: "My Material not found" });
    }

    if (accountID) myMaterial.accountID = accountID;
    if (materialID) myMaterial.materialID = materialID;

    await myMaterial.save();

    res.status(200).json({
      message: "My Material updated successfully",
      myMaterial,
    });

    logger.info(
      `MyMaterial updated: ${myMaterial.id} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an MyMaterial by ID
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await MyMaterial.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: "My Material not found" });
    }

    res.status(204).send();

    logger.info(
      `My Material deleted: ${id} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete all MyMaterial records by user role
exports.deleteByAccountIDs = async (req, res) => {
  try {
    const { accountIDs, type } = req.body;

    let where = {
      accountID: accountIDs,
    };
    if (type === "all") {
      where = {
        ...where,
        "$material.materialFor.name$": {
          [Op.ne]: "library",
        },
      };
    } else {
      where = {
        ...where,
        "$material.materialFor.name$": type,
      };
    }

    const material = await MyMaterial.findAll({
      where,
      include: {
        model: Materials,
        as: "material",
        attributes: { exclude: ["updatedAt"] },
        include: [
          {
            association: "materialFor",
            attributes: ["id", "name"],
          },
        ],
      },
    });

    material.forEach(async (myMaterial) => {
      await MyMaterial.destroy({ where: { id: myMaterial.id } });
    });

    return res.status(200).json({
      message: "My Material deleted successfully",
    });

    logger.info(
      `My Material deleted: ${accountIDs.join(",")} by [${req.user.id}]${
        req.user.username
      }`
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
