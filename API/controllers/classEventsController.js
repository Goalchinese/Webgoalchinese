const {
  ClassEvents,
  ClassEventDates,
  Account,
  Class,
  ClassStudent,
  Branch,
} = require("../models");
const { Sequelize } = require("sequelize");

// Simple cache for class events
const eventsCache = new Map();
const CACHE_DURATION = 30 * 1000; // 30 seconds for near real-time updates

const logger = require("../logger");

// Clear cache function
const clearEventsCache = () => {
  eventsCache.clear();
  console.log('Events cache cleared');
};

// Create a new Class Event (with one or many days)
exports.create = async (req, res) => {
  try {
    const { classId, title, link, color, note, dates, startDate, endDate } =
      req.body;

    const newEvent = await ClassEvents.create({
      classId,
      title,
      link,
      color,
      note,
      updateBy: req.user.accountID,
    });

    // Accept either `dates: [{startDate,endDate}]` or a single startDate/endDate pair
    const dayEntries = Array.isArray(dates) && dates.length
      ? dates
      : [{ startDate, endDate }];

    const createdDates = await ClassEventDates.bulkCreate(
      dayEntries.map((d) => ({
        eventId: newEvent.id,
        startDate: d.startDate,
        endDate: d.endDate,
      }))
    );

    clearEventsCache();
    res.status(201).json({
      message: "Event created successfully",
      data: { ...newEvent.toJSON(), dates: createdDates },
    });

    logger.info(
      `Event created: ${newEvent.id} ${title} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating event", error: error.message });
  }
};

// Add extra days to an existing event (was "copy")
exports.addDates = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await ClassEvents.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    const { dates } = req.body;
    if (!Array.isArray(dates) || !dates.length) {
      return res.status(400).json({ message: "dates array is required" });
    }

    const referenceDate = await ClassEventDates.findOne({
      where: { eventId: id },
      order: [["startDate", "ASC"]],
    });

    const refStart = referenceDate ? referenceDate.startDate : new Date();
    const refEnd = referenceDate ? referenceDate.endDate : new Date();

    const createdDates = await ClassEventDates.bulkCreate(
      dates.map((date) => ({
        eventId: id,
        startDate: `${date} ${new Date(refStart).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        endDate: `${date} ${new Date(refEnd).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      }))
    );

    clearEventsCache();
    res
      .status(201)
      .json({ message: "Dates added successfully", data: createdDates });

    logger.info(
      `Event dates added: ${id} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    console.log("addDates error:", error);
    res
      .status(400)
      .json({ message: "Error adding dates", error: error.message });
  }
};

// Update a single day's start/end time
exports.updateDate = async (req, res) => {
  try {
    const { eventId, dateId } = req.params;
    const { startDate, endDate } = req.body;

    const [updated] = await ClassEventDates.update(
      { startDate, endDate },
      { where: { id: dateId, eventId } }
    );
    if (!updated) {
      return res.status(404).json({ message: "Event date not found" });
    }
    clearEventsCache();
    const updatedDate = await ClassEventDates.findByPk(dateId);
    res
      .status(200)
      .json({ message: "Event date updated successfully", data: updatedDate });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating event date", error: error.message });
  }
};

// Delete a single day from an event
exports.deleteDate = async (req, res) => {
  try {
    const { eventId, dateId } = req.params;
    const deleted = await ClassEventDates.destroy({
      where: { id: dateId, eventId },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Event date not found" });
    }
    clearEventsCache();
    res.status(200).json({ message: "Event date deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting event date", error: error.message });
  }
};

// Retrieve all Class Events, flattened to one entry per day for the calendar
exports.findAll = async (req, res) => {
  try {
    const { branchId, teacherId, studentId, start, end } = req.query;

    // Create cache key based on filters
    const cacheKey = `events-${branchId || 'all'}-${teacherId || 'all'}-${studentId || 'all'}-${start || 'all'}-${end || 'all'}`;
    console.log(`Cache key: ${cacheKey}`);

    // Check cache first
    const cached = eventsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Serving class events from cache');
      return res.status(200).json(cached.data);
    }

    eventsCache.clear();

    // Restrict to the visible calendar range when given, otherwise fall back
    // to current-year-onwards so callers that don't pass a range still work.
    const dateWhere = start && end
      ? {
          startDate: { [Sequelize.Op.lte]: new Date(end) },
          endDate: { [Sequelize.Op.gte]: new Date(start) },
        }
      : {
          startDate: {
            [Sequelize.Op.gte]: new Date(new Date().getFullYear(), 0, 1),
          },
        };

    const eventDates = await ClassEventDates.findAll({
      where: dateWhere,
      attributes: ["id", "eventId", "startDate", "endDate"],
      include: [
        {
          model: ClassEvents,
          as: "event",
          attributes: [
            "id",
            "classId",
            "title",
            "link",
            "color",
            "note",
            "updateBy",
            "updatedAt",
            "createdAt",
          ],
          required: true,
          include: [
            {
              model: Class,
              as: "class",
              attributes: ["id", "name", "no", "studyPlatform", "link"],
              where: branchId ? { branchId } : undefined,
              required: !!(branchId || teacherId || studentId),
              include: [
                {
                  model: Account,
                  as: "teacher",
                  attributes: ["id", "name"],
                  where: teacherId ? { id: teacherId } : undefined,
                  required: !!teacherId,
                },
                {
                  model: ClassStudent,
                  as: "classStudent",
                  where: studentId ? { accountID: studentId } : undefined,
                  required: !!studentId,
                  include: [
                    {
                      model: Account,
                      as: "account",
                      attributes: ["id", "name"],
                    },
                  ],
                },
              ],
            },
            {
              model: Account,
              as: "updatedBy",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["startDate", "ASC"]],
    });

    // Flatten: each day becomes its own calendar entry, but keeps eventId
    // so editing title/link/color/note updates every day at once.
    const events = eventDates.map((ed) => {
      const { event, ...dateFields } = ed.toJSON();
      return {
        ...event,
        ...dateFields,
        id: ed.id, // day id (per-occurrence)
        eventId: event.id, // shared event id (edit-once target)
      };
    });

    console.log(`Found ${events.length} event days for range ${start || 'default'} - ${end || 'default'}`);

    eventsCache.set(cacheKey, {
      data: events,
      timestamp: Date.now(),
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Error in findAll:', error);
    res
      .status(500)
      .json({ message: "Error retrieving events", error: error.message });
  }
};

// Retrieve a single Class Event by ID, with all its days
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await ClassEvents.findByPk(id, {
      include: [{ model: ClassEventDates, as: "dates" }],
    });
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

// Update a Class Event's shared fields (title/link/color/note/classId) by ID
// Editing here updates every day belonging to this event at once.
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { classId, title, link, color, note } = req.body;

    const [updated] = await ClassEvents.update(
      { classId, title, link, color, note, updateBy: req.user.accountID },
      { where: { id } }
    );
    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }
    clearEventsCache();
    const updatedEvent = await ClassEvents.findByPk(id, {
      include: [{ model: ClassEventDates, as: "dates" }],
    });
    res
      .status(200)
      .json({ message: "Event updated successfully", data: updatedEvent });

    logger.info(
      `Event updated: ${id} ${title} by [${req.user.id}]${req.user.username}`
    );
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating event", error: error.message });
  }
};

// Delete a Class Event (and all its days) by ID
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ClassEvents.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }
    clearEventsCache();
    res.status(204).send({ message: "Event deleted successfully" });

    logger.info(`Event deleted: ${id} by [${req.user.id}]${req.user.username}`);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
  }
};
