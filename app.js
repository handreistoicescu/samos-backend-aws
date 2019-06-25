const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const buildRoute = require('./api/routes/build');
const eventsRoute = require('./api/routes/events');
const eventTypesRoute = require('./api/routes/eventTypes');
const venuesRoute = require('./api/routes/venues');

mongoose
  .connect(process.env.DB_CONN, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(
    () => {
      console.log('Connected!');
    },
    err => {
      console.log(err);
    }
  );

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handle CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Expose-Headers', 'Content-Range');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
  }
  next();
});

// Routes which should handle requests
app.use('/venues', venuesRoute);
app.use('/events', eventsRoute);
app.use('/eventtypes', eventTypesRoute);
app.use('/build', buildRoute);
// app.use('/user', userRoute);

app.use((req, res, next) => {
  const error = new Error('N-am găsit...');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json(error.message);
});

module.exports = app;
