const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const EventTypesController = require('../controllers/eventTypes');

router.get('/', EventTypesController.eventTypes_get_all);

router.post('/', EventTypesController.eventTypes_create_eventType);

router.get('/:eventTypeId', EventTypesController.eventTypes_get_eventType);

router.patch('/:eventTypeId', EventTypesController.change_eventType);

router.delete(
  '/:eventTypeId',
  EventTypesController.eventTypes_delete_eventType
);

module.exports = router;
