const {
  sequelize,
  Class,
  ClassStudy,
  ClassStudent,
  Account,
  Attendance,
  Branch,
  ClassType,
  Currency,
  Sequelize,
  MaterialType,
} = require("../models"); // Adjust the path to your models folder
const logger = require("../logger");

const { Op } = require("sequelize");

// Create a new Class
exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();

  // Get field names from the model
  const validFieldsClass = Object.keys(Class.rawAttributes);

  // Filter req.body to include only valid fields
  const filteredDataClass = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => validFieldsClass.includes(key))
  );

  try {
    const newClass = await Class.create(filteredDataClass, { transaction: t });

    await ClassStudy.bulkCreate(
      req.body.classStudy.map((item) => ({
        classID: newClass.id,
        day: item.value,
        startTime: item.startTime,
        endTime: item.endTime,
        note: item.note,
      })),
      { transaction: t }
    );

    await ClassStudent.bulkCreate(
      req.body.classStudent.map((accId) => ({
        accountID: accId,
        classID: newClass.id,
      })),
      { transaction: t }
    );

    res
      .status(201)
      .json({ message: "Class created successfully", data: newClass });

    await t.commit();

    logger.info(
      `Class created: ${newClass.id} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    await t.rollback();
    next(error); // Pass the error to the centralized error handler
  }
};

// Retrieve all Classes
exports.findAll = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      classType,
      studyDay,
      status,
      remaining,
    } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (search) {
      where[Op.or] = [
        sequelize.where(
          sequelize.fn("LOWER", sequelize.col("Class.name")),
          "LIKE",
          `%${search.toLowerCase()}%`
        ),
        sequelize.where(
          sequelize.fn("LOWER", sequelize.col("Class.no")),
          "LIKE",
          `%${search.toLowerCase()}%`
        ),
      ];
    }
    if (classType) where.classTypeID = classType;
    if (status) where.status = status;
    if (studyDay) {
      const matchingClassStudy = await ClassStudy.findAll({
        where: { day: studyDay },
        attributes: ["classID"],
        raw: true,
      });
      where.id = { [Op.in]: matchingClassStudy.map((it) => it.classID) };
    }

    const include = [
      { model: ClassStudy, as: "classStudy" },
      { model: Account, as: "teacher", attributes: ["id", "name"] },
      { model: ClassType, as: "classType" },
      { model: ClassStudent, as: "classStudent", include: [{ model: Account, as: "account" }] },
      {
        model: Attendance,
        as: "attendance",
        attributes: ["id", "classId", "studyDate", "status", "note"],
        required: false,
      },
    ];
    const order = [
      ["status", "ASC"],
      ["no", "ASC"],
    ];

    // "remaining" (remaining class time = registeredTimes - attendance count) isn't a
    // stored column, so it can't be filtered/paginated in SQL directly. With the
    // dataset size involved, fetch all rows matching the other filters, compute
    // remaining in JS, then paginate the filtered result manually.
    if (remaining) {
      const allClasses = await Class.findAll({ where, order, include });
      const filtered = allClasses.filter((item) => {
        const remainingCount =
          (item.registeredTimes || 0) - (item.attendance?.length || 0);
        return remaining === "expiring"
          ? remainingCount <= 2
          : remainingCount > 2;
      });

      const total = filtered.length;
      const paged = filtered.slice(offset, offset + parseInt(limit));

      return res.status(200).json({
        data: paged,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      });
    }

    // Get total count for pagination
    const total = await Class.count({ where });

    const classes = await Class.findAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include,
    });

    res.status(200).json({
      data: classes,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving classes", error: error.message });
  }
};

// Pagination helper functions
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

// Retrieve all Classes with pagination
exports.findAllPagination = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const classes = await Class.findAndCountAll({
      limit,
      offset,
      include: [
        { model: ClassStudy, as: "classStudy" },
        {
          model: ClassStudent,
          as: "classStudent",
          include: [{ model: Account, as: "account" }],
        },
        { model: ClassType, as: "classType" },
        { model: Account, as: "teacher" },
        { model: Account, as: "updatedBy" },
        { model: Attendance, as: "attendance" },
        { model: Branch, as: "branch" },
        { model: Currency, as: "currency" },
      ],
    });

    const response = getPagingData(classes, page, limit);

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving classes", error: error.message });
  }
};

// retrieve all Classes by student ID
exports.findAllByStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const classes = await Class.findAll({
      include: [
        { model: ClassStudy, as: "classStudy" },
        {
          model: ClassStudent,
          as: "classStudent",
          where: { accountID: id },
          include: [{ model: Account, as: "account" }],
        },
        { model: Attendance, as: "attendance" },
      ],
    });
    res.status(200).json(classes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving classes", error: error.message });
  }
};

// Retrieve a single Class by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await Class.findOne({
      where: { id },
      include: [
        { model: ClassStudy, as: "classStudy" },
        {
          model: ClassStudent,
          as: "classStudent",
          include: [{ model: Account, as: "account" }],
        },
        { model: ClassType, as: "classType" },
        { model: Account, as: "teacher" },
        { model: Account, as: "updatedBy" },
        { model: Attendance, as: "attendance" },
        { model: Branch, as: "branch" },
        { model: Currency, as: "currency" },
        { model: MaterialType, as: "materialType" },
      ],
    });
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(200).json(classData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving class", error: error.message });
  }
};

// Update a Class by ID
exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const [updated] = await Class.update(req.body, { 
      where: { id },
      transaction: t 
    });
    if (!updated) {
      await t.rollback();
      return res.status(404).json({ message: "Class not found" });
    }

    // If the request body contains classStudy data
    if (req.body.classStudy) {
      console.log('Backend - received classStudy:', req.body.classStudy);
      
      try {
        console.log('Backend - destroying existing ClassStudy for classID:', id);
        
        const destroyedCount = await ClassStudy.destroy({ 
          where: { classID: id },
          transaction: t 
        });
        
        console.log('Backend - destroyed ClassStudy count:', destroyedCount);
        
        const classStudyToCreate = req.body.classStudy.map((item) => ({
          classID: id,
          day: item.value,
          startTime: item.startTime,
          endTime: item.endTime,
          note: item.note,
        }));
        
        console.log('Backend - creating new ClassStudy:', classStudyToCreate);
        
        await ClassStudy.bulkCreate(classStudyToCreate, { transaction: t });
        
        console.log('Backend - ClassStudy update completed successfully');
      } catch (classStudyError) {
        console.error('Backend - ClassStudy update failed:', classStudyError);
        throw classStudyError; // Re-throw to rollback transaction
      }
    }

    // If the request body contains classStudent data
    if (req.body.classStudent) {
      await ClassStudent.destroy({ 
        where: { classID: id },
        transaction: t 
      });
      await ClassStudent.bulkCreate(
        req.body.classStudent.map((accId) => ({
          accountID: accId,
          classID: id,
        })),
        { transaction: t }
      );
    }

    await t.commit();
    res.status(200).json({ message: "Class updated successfully" });

    logger.info(`Class updated: ${id} by [${req.user.id}]${req.user.username}`);
  } catch (error) {
    await t.rollback();
    res
      .status(400)
      .json({ message: "Error updating class", error: error.message });
  }
};

// Delete a Class by ID
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Class.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(204).send();

    logger.info(`Class deleted: ${id} by [${req.user.id}]${req.user.username}`);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting class", error: error.message });
  }
};
