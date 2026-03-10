const {
  ClassEvents,
  Account,
  Class,
  ClassStudent,
  Branch,
} = require("../models");

// Simple cache for class events
const eventsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const logger = require("../logger");

// Create a new Class Event
exports.create = async (req, res) => {
  try {
    const newEvent = await ClassEvents.create(req.body);
    res
      .status(201)
      .json({ message: "Event created successfully", data: newEvent });

    logger.info(
      `Event created: ${newEvent.id} ${req.body.title} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating event", error: error.message });
  }
};

// create a new Class Event by Copying an existing event
exports.copy = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await ClassEvents.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    const { dates } = req.body;

    const { classId, title, link, color, note, startDate, endDate } =
      event.toJSON();

    await ClassEvents.bulkCreate(
      dates.map((date) => ({
        id: null,
        classId: classId,
        title: title,
        link: link,
        color: color,
        note: note,
        startDate: `${date} ${new Date(startDate).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        endDate: `${date} ${new Date(endDate).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        updateBy: req.user.accountID,
      }))
    );
    res.status(201).json({ message: "Event created successfully" });

    logger.info(
      `Event Copy created: ${id}} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    console.log("🚀 ~ exports.copy= ~ error:", error);
    res
      .status(400)
      .json({ message: "Error creating event", error: error.message });
  }
};

// Retrieve all Class Events
exports.findAll = async (req, res) => {
  try {
    const { branchId, teacherId, studentId } = req.query;
    
    // Create cache key based on filters
    const cacheKey = `events-${branchId || 'all'}-${teacherId || 'all'}-${studentId || 'all'}`;
    
    // Check cache first
    const cached = eventsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Serving class events from cache');
      return res.status(200).json(cached.data);
    }

    let where = {};
    if (branchId) {
      where = { ...where, "$class.branchId$": Number(branchId) };
    }
    if (teacherId) {
      where = { ...where, "$class.teacherId$": teacherId };
    }
    if (studentId) {
      where = { ...where, "$class.classStudent.accountID$": Number(studentId) };
    }

    const events = await ClassEvents.findAll({
      where,
      attributes: ["id", "classId", "title", "link", "color", "note", "startDate", "endDate", "updateBy"],
      include: [
        { model: Account, as: "updatedBy", attributes: ["id", "name"], required: false },
        {
          model: Class,
          as: "class",
          attributes: ["id", "name", "branchId", "teacherId", "studyPlatform"],
          include: [
            { model: Account, as: "teacher", attributes: ["id", "name"], required: false },
            { model: Branch, as: "branch", attributes: ["id", "name"], required: false },
          ],
          required: false,
        },
      ],
      order: [['startDate', 'ASC']],
      limit: 1000, // Prevent too many records
    });

    // Cache the result
    eventsCache.set(cacheKey, {
      data: events,
      timestamp: Date.now()
    });

    console.log('Class events cached for 5 minutes');
    res.status(200).json(events);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving events", error: error.message });
  }
};

// Retrieve a single Class Event by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await ClassEvents.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving event", error: error.message });
  }
};

// Update a Class Event by ID
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await ClassEvents.update(req.body, { where: { id } });
    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }
    const updatedEvent = await ClassEvents.findByPk(id);
    res
      .status(200)
      .json({ message: "Event updated successfully", data: updatedEvent });

    logger.info(
      `Event updated: ${id} ${req.body.title} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating event", error: error.message });
  }
};

// Delete a Class Event by ID
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ClassEvents.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(204).send({ message: "Event deleted successfully" });

    logger.info(`Event deleted: ${id} by [${req.user.id}]${req.user.username}`);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
  }
};
