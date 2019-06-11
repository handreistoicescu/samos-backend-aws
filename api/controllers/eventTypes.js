const mongoose = require('mongoose');
const qs = require('qs');

const EventType = require('../models/eventType');

exports.eventTypes_get_all = (req, res, next) => {
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

  const findPromise = EventType.find(conditions)
    .select('name _id')
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .exec();

  const countPromise = EventType.estimatedDocumentCount().exec();

  Promise.all([findPromise, countPromise])
    .then(([docs, count]) => {
      const responseBody = {
        eventTypes: docs.map(doc => {
          return {
            name: doc.name,
            id: doc._id,
            request: {
              type: 'GET',
              url: `http://localhost:3000/eventTypes/${doc.id}`
            }
          };
        })
      };

      res.set({
        'Content-Range': `eventTypes ${skip}-${limit}/${count}`
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

exports.eventTypes_create_eventType = (req, res, next) => {
  const eventType = new EventType({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name
  });

  eventType
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Created event type!',
        eventTypes: [
          {
            name: result.name,
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

exports.eventTypes_get_eventType = (req, res, next) => {
  const id = req.params.eventTypeId;
  EventType.findById(id)
    .select('name _id')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json({
          eventTypes: [
            {
              name: doc.name,
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

exports.change_eventType = (req, res, next) => {
  const id = req.params.eventTypeId;
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  EventType.findByIdAndUpdate(id, { $set: updateOps }, { new: true })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Event type updated!',
        eventTypes: [
          {
            name: result.name,
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

exports.eventTypes_delete_eventType = (req, res, next) => {
  const id = req.params.eventTypeId;
  EventType.findByIdAndDelete(id)
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Event type deleted!',
        eventTypes: [
          {
            name: result.name,
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
