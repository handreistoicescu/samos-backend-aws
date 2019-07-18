const got = require('got');
const moment = require('moment');
const mongoose = require('mongoose');
const NetlifyAPI = require('netlify');

const client = new NetlifyAPI(process.env.NETLIFY_API_ACCESS_TOKEN);

const Build = require('../models/build');
const Event = require('../models/event');

const netlifyWebhookUrl = process.env.NETLIFY_WEBHOOK;
const netlifySiteId = process.env.NETLIFY_SITE_ID;

exports.build_netlify_site = async (req, res, next) => {
  // 1. get event data from database
  let eventData;
  let currentNetlifyBuild;

  try {
    const queryData = await Event.find({
      date: { $gte: moment(), $lte: moment().add(14, 'days') },
      published: { $eq: true }
    })
      .populate({ path: 'type', select: 'name' })
      .populate({ path: 'venue', select: 'name' })
      .select('date link name type venue')
      .sort('date name');

    eventData = {
      events: queryData.map(doc => {
        return {
          act: doc.name,
          canceled: doc.canceled,
          date: doc.date,
          eventUrl: doc.link,
          type: doc.type.name,
          venueName: doc.venue.name
        };
      })
    };
    console.log('Event data to be used', eventData);
  } catch (err) {
    res.status(500).json({
      error: err.toString()
    });
  }

  // 2. send request to netlify webhook with data in payload
  // if the response is ok, make a database record with the ID of the build that started (get that from response data)
  // return a response with the build ID

  try {
    await got.post(netlifyWebhookUrl, {
      body: encodeURIComponent(JSON.stringify(eventData)),
      responseType: 'json'
    });

    console.log(`Netlify POST to webhook DONE`);
  } catch (err) {
    res.status(500).json({
      error: err.toString()
    });
  }

  // get current build data from Netlify

  try {
    const builds = await client.listSiteBuilds({
      site_id: netlifySiteId
    });

    console.log('Got site build list from Netlify');

    currentBuild = builds[0];
  } catch (err) {
    res.status(500).json({
      error: err.toString()
    });
  }

  // store build data from Netlify
  try {
    const build = new Build({
      _id: new mongoose.Types.ObjectId(),
      netlifyBuildId: currentBuild.id,
      createdAt: currentBuild.created_at,
      payload: encodeURIComponent(JSON.stringify(eventData)),
      status: 'INITIATED. NO RESPONSE FROM NETLIFY YET.'
    });

    const buildData = await build.save();

    console.log('Saved build to DB', buildData);

    res.status(200).json({
      netlifyBuild: currentBuild
    });
  } catch (err) {
    res.status(500).json({
      error: err.toString()
    });
  }
};

exports.build_listener = async (req, res, next) => {
  // This is made for accepting Outgoing Webhook requests from Netlify
  // when receiving notifications from Netlify, match the build ID of the build with one from the database (if at all possible) and register the status
  // if there is no build with that ID or there is one, but it's marked as "done", don't do anything at all
  // if the status of the build is complete, mark the build as "done"
  const { build_id } = req.body;
  console.log(`Netlify outgoing web hook build id: ${build_id}`);

  // Get the info via API for this build id

  try {
    const buildStatus = await client.getSiteBuild({
      build_id: currentNetlifyBuild
    });
    console.log(`Build status: ${buildStatus}`);
  } catch (err) {
    res.status(500).json({
      error: err.toString()
    });
  }

  res.status(200);
};

exports.build_get_build = (req, res, next) => {
  // get build info based on build ID provided in url
  // if there is no build, say something important
};
