'use strict';
const awsServerlessExpress = require('aws-serverless-express');
const mongoose = require('mongoose');
const app = require('./app');
const binaryMimeTypes = [
  'application/octet-stream',
  'font/eot',
  'font/opentype',
  'font/otf',
  'image/jpeg',
  'image/png',
  'image/svg+xml'
];

let cachedDb = null;

const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);

exports.handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  console.log('event:', event);

  connectToDatabase(process.env.DB_CONN)
    .then(db => awsServerlessExpress.proxy(server, event, context))
    .catch(err => {
      console.log('=> an error occurred: ', err);
    });
};

function connectToDatabase(uri) {
  console.log('=> connect to database');

  if (cachedDb) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }

  return mongoose
    .connect(process.env.DB_CONN, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    .then(
      db => {
        cachedDb = db;
        console.log('Connected!');
        return cachedDb;
      },
      err => {
        console.log(err);
      }
    );
}
