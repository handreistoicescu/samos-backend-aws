const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const BuildController = require('../controllers/build');

router.get('/', BuildController.build_netlify_site);
router.get('/:buildId', BuildController.build_get_build);

router.post('/', BuildController.build_listener);

// router.get('/:eventId', BuildController.events_get_event);

// router.patch('/:eventId', BuildController.change_event);

// router.delete('/:eventId', BuildController.events_delete_event);

module.exports = router;
