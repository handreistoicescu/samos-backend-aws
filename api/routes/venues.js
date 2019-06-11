const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const VenuesController = require('../controllers/venues');

router.get('/', VenuesController.venues_get_all);

router.post('/', VenuesController.venues_create_venue);

router.get('/:venueId', VenuesController.venues_get_venue);

router.patch('/:venueId', VenuesController.change_venue);

router.delete('/:venueId', VenuesController.venues_delete_venue);

module.exports = router;
