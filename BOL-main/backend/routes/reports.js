const express = require('express');
const { validate } = require('uuid');
const router = express.Router();

//importing data model schema's
let {applicant,event} = require('../models/models')

router.get('/', (req, res, next) => {
    res.send('Reports api goes here')
});

//default route for events page. this page lists the name of the events and addresses (eventDesciption & eventAddress)
router.get('/event', (req, res, next) => {
    let query = event.find({}, {_id: 1, eventAddress: 0, eventZip: 0, applicants: 0}, (error, data) => {
      if (error) {
        return next(error)
      } else {
        res.json(data)
      }
    })
    query.sort({eventDate: -1});
});//end of get request

//setting up route for events page. this page contains the event name (eventDescription), lists applicants that attended that event and lastly provides information for the summary graph
router.get('/event/:id', (req, res, next) => {
    event.find({ _id: req.params.id}, 
      {eventDate: 0, eventAddress: 0, eventZip: 0})
      .populate({
        path: 'applicants', select: '-_id -phoneNumber -marketSurvey -vaccinePreference -events'
      })//end of find
    .exec((error, data) => {
      if (error) {
        return next(error)
      } else {
        res.json(data)
      }
    })
}); //end of get request

//setting up route for summary graph for event page
//https://newbedev.com/mongodb-count-num-of-distinct-values-per-field-key
router.get('/graph', (req, res, next) => {

  applicant.aggregate([
    { "$group": {"_id": "$raceEthnicity","count": { "$sum": 1 } } },
    { "$group": {"_id": null, "counts": { "$push": { "k": "$_id", "v": "$count" }}}},
    { "$replaceRoot": {"newRoot": { "$arrayToObject": "$counts" }}},
  ])
  .exec((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.send(data[0]);
    }
  })
}); //end of get request

router.get('/graph2', (req, res, next) => {

  applicant.aggregate([
    { "$group": {"_id": "$isVaccinated","count": { "$sum": 1 } } },
    { "$group": {"_id": null, "counts": { "$push": { "k": "$_id", "v": "$count" }}}},
    { "$replaceRoot": {"newRoot": { "$arrayToObject": "$counts" }}},
  ])
  .exec((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.send(data[0]);
    }
  })
}); //end of get request

router.get('/graph3', (req, res, next) => {

  applicant.aggregate([
    { "$group": {"_id": "$zipCode","count": { "$sum": 1 } } },
    { "$group": {"_id": null, "counts": { "$push": { "k": "$_id", "v": "$count" }}}},
    { "$replaceRoot": {"newRoot": { "$arrayToObject": "$counts" }}},
  ])
  .exec((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.send(data[0]);
    }
  })
}); //end of get request


//setting up route that returns all zipcodes that the applicants come from
router.get('/zipcode', (req, res, next) => {
  applicant.distinct('zipCode')
  .exec((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
      console.log(data);
    }
  })
});//end of get request

// setting up route that displays applicant data by zipcode
// referenced code from stack to flatten array of events so we know which events the applicants of this zipcode are going to with out repeating values
// https://stackoverflow.com/questions/42291965/setunion-to-merge-array-from-multiple-documents-mongodb
router.get('/zipcode/:zipcode', (req, res, next) => {
  //let zipcode = parseInt(req.params.zipcode) //only accepts int because of how the zipCode field was set up in model.js
  applicant
  .aggregate([
    {$match : { zipCode: req.params.zipcode }}, // match applicants with zip code from params
    {$project: { _id: 0 } },
    {"$group":  // group by events
      { "_id": 0, "events": { "$push": "$events" }}
    },     //flatten array of events and merge all to one array
    {"$project": {"events": {"$reduce": {"input": "$events", "initialValue": [], "in": { "$setUnion": ["$$value", "$$this"] }}}
      }
    },
    {$project: { _id: 0 } }, // use look up so we return a values instead of object ids.
    {$lookup:{
        from: 'event',
        localField: "events",
        foreignField: "_id",
        as: "events",
        pipeline: [ //lets us choose which fields we want to show
          { $project: { _id: 0, eventDescription: 1, eventDate: 1} },
        ]}},
  ])
  .exec((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
      console.log(data);
    }
  })
});

// exports the router 
module.exports = router;