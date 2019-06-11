const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const EventsController = require('../controllers/events');

router.get('/', EventsController.events_get_all);

router.post('/', EventsController.events_create_event);

router.get('/:eventId', EventsController.events_get_event);

router.patch('/:eventId', EventsController.change_event);

router.delete('/:eventId', EventsController.events_delete_event);

module.exports = router;
