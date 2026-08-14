const express = require("express");
const classEventsController = require("../controllers/classEventsController");

const router = express.Router();

router.post("/", classEventsController.create); // Create a new event (1 or many days)
router.get("/", classEventsController.findAll); // Get all events, flattened per day
router.get("/:id", classEventsController.findOne); // Get a single event (with its days) by ID
router.put("/:id", classEventsController.update); // Update shared event fields (edits all days at once)
router.delete("/:id", classEventsController.delete); // Delete an event and all its days

router.post("/:id/dates", classEventsController.addDates); // Add more days to an existing event
router.put("/:eventId/dates/:dateId", classEventsController.updateDate); // Reschedule a single day
router.delete("/:eventId/dates/:dateId", classEventsController.deleteDate); // Remove a single day

// kept for backward compatibility with old frontend calls
router.post("/copy/:id", classEventsController.addDates);

module.exports = router;
