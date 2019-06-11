const mongoose = require('mongoose');
const qs = require('qs');

const Event = require('../models/event');

exports.events_get_all = (req, res, next) => {
  function getConditions(queryParams) {
    const conditions = {};
    const { filter } = queryParams;

    if (filter && typeof filter.name === 'string') {
      conditions.name = new RegExp(filter.name, 'i');
    }

    return conditions;
  }

  function getLimit(queryParams) {
    const limit = parseInt(queryParams.limit);

    if (typeof limit === 'number') {
      return limit;
    } else {
      return;
    }
  }

  function getSkip(queryParams) {
    const skip = parseInt(queryParams.skip);

    if (typeof skip === 'number') {
      return skip;
    } else {
      return;
    }
  }

  function getSortOrder(queryParams) {
    const sortOrder = {};
    const { sort_by } = queryParams;

    if (sort_by && typeof sort_by === 'string') {
      switch (sort_by) {
        case 'name':
          sortOrder.name = 1;
          break;
        case '-name':
          sortOrder.name = -1;
          break;
        case 'date':
          sortOrder.date = 1;
          break;
        case '-date':
          sortOrder.date = -1;
          break;
        case 'type':
          sortOrder.type = 1;
          break;
        case 'status':
          sortOrder.status = 1;
          break;
        case 'venue':
          sortOrder.venue = 1;
          break;
        default:
          sortOrder.name = 1;
          break;
      }
    }

    return sortOrder;
  }

  const conditions = getConditions(req.query);
  const limit = getLimit(req.query);
  const skip = getSkip(req.query);
  const sortOrder = getSortOrder(req.query);

  const findPromise = Event.find(conditions)
    .select('date link name type venue published _id')
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .exec();

  const countPromise = Event.estimatedDocumentCount().exec();

  Promise.all([findPromise, countPromise])
    .then(([docs, count]) => {
      const responseBody = {
        events: docs.map(doc => {
          return {
            date: doc.date,
            link: doc.link,
            name: doc.name,
            published: doc.published,
            type: doc.type,
            venue: doc.venue,
            id: doc._id,
            request: {
              type: 'GET',
              url: `http://localhost:3000/events/${doc.id}`
            }
          };
        })
      };

      res.set({
        'Content-Range': `events ${skip}-${limit}/${count}`
      });

      res.status(200).json(responseBody);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.events_create_event = (req, res, next) => {
  const event = new Event({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    type: req.body.type,
    link: req.body.link,
    published: req.body.published,
    venue: req.body.venue,
    date: req.body.date
  });

  event
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Created event!',
        events: [
          {
            name: result.name,
            type: result.type,
            link: result.link,
            date: result.date,
            published: result.published,
            venue: result.venue,
            id: result._id
          }
        ]
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.events_get_event = (req, res, next) => {
  const id = req.params.eventId;
  Event.findById(id)
    .select('name type link date venue published _id')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json({
          events: [
            {
              date: doc.date,
              link: doc.link,
              name: doc.name,
              published: doc.published,
              type: doc.type,
              venue: doc.venue,
              id: doc._id
            }
          ]
        });
      } else {
        res.status(404).json('No valid data for provided ID.');
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.change_event = (req, res, next) => {
  const id = req.params.eventId;
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  Event.findByIdAndUpdate(id, { $set: updateOps }, { new: true })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Event updated!',
        events: [
          {
            date: result.date,
            link: result.link,
            name: result.name,
            published: result.published,
            type: result.type,
            venue: result.venue,
            id: result._id
          }
        ]
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.events_delete_event = (req, res, next) => {
  const id = req.params.eventId;
  Event.findByIdAndDelete(id)
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Event deleted!',
        events: [
          {
            date: result.date,
            link: result.link,
            name: result.name,
            published: result.published,
            type: result.type,
            venue: result.venue,
            id: result._id
          }
        ]
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};
