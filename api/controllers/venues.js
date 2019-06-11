const mongoose = require('mongoose');

const Venue = require('../models/venue');

exports.venues_get_all = (req, res, next) => {
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
        case 'link':
          sortOrder.link = 1;
          break;
        case '-link':
          sortOrder.link = -1;
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

  const findPromise = Venue.find(conditions)
    .select('name link _id')
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .exec();

  const countPromise = Venue.estimatedDocumentCount().exec();

  Promise.all([findPromise, countPromise])
    .then(([docs, count]) => {
      const responseBody = {
        venues: docs.map(doc => {
          return {
            name: doc.name,
            link: doc.link,
            id: doc._id,
            request: {
              type: 'GET',
              url: `http://localhost:3000/venues/${doc.id}`
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

exports.venues_create_venue = (req, res, next) => {
  const venue = new Venue({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    link: req.body.link
  });

  venue
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Created venue!',
        venues: [
          {
            link: result.link,
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

exports.venues_get_venue = (req, res, next) => {
  const id = req.params.venueId;
  Venue.findById(id)
    .select('name link _id')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json({
          venues: [
            {
              link: doc.link,
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

exports.change_venue = (req, res, next) => {
  const id = req.params.venueId;
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  Venue.findByIdAndUpdate(id, { $set: updateOps }, { new: true })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Venue updated!',
        venues: [
          {
            link: result.link,
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

exports.venues_delete_venue = (req, res, next) => {
  const id = req.params.venueId;
  Venue.findByIdAndDelete(id)
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Venue deleted!',
        venues: [
          {
            link: result.link,
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
