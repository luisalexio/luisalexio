const express = require("express");
const { validate } = require("uuid");
const router = express.Router();

//importing data model schema's
let { applicant, event } = require("../models/models");

// gets all of the events in the database minus the key with the array of applicants.
router.get("/", (req, res, next) => {
  event.find(
    {},
    { applicants: 0 }, // excludes the applicant fields because we don't need to see all of that data
    (error, data) => {
      // error handler
      if (error) {
        return next(error);
      } else {
        res.json(data);
      }
    }
  );
});

//retrieve a single event by ID
router.get("/:id", (req, res, next) => {
  event
    .findOne({ _id: req.params.id }) //finds the event that matches that ID
    .populate(
      {
        path: "applicants", // adds the appliant information based on the event ids in the array
        select:
          "-marketSurvey -numChildren -is65orOlder -isVeteran -raceEthnicity -events -__v",
      } // we only need to see basic information relevant to the service.
    )
    .exec((error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
        console.log(data);
      }
    });
});

//place holder to add event data
router.post("/", (req, res, next) => {
  event.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.send("Event is added to the database");
    }
  });
});

//update the event to send the full object data but ideally the applicants array is not modified.
router.put("/:id", (req, res, next) => {
  event.findOneAndUpdate(
    { _id: req.params.id },
    {
      // to avoid changing applicants, only accept specific fields to update.
      $set: {
        eventDescription: req.body.eventDescription,
        eventDate: req.body.eventDate,
        eventAddress: req.body.eventAddress,
        eventZip: req.body.eventZip,
      },
    },
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.send("The event has been updated.");
      }
    }
  );
});


//delete an event by id and removes that event id from the applicant's list of events array
//error handling caused the functions not to work, not sure why.
router.delete('/:id', async (req, res, next) => {
  // find the event using the id and deletes it.
  await event.findOneAndRemove({ _id: req.params.id});
  //await event.findOneAndRemove({ _id: req.params.id})

  //perform a simutaneous deletion of the eventid in the applicants collection. 
  //find documents in the applicant collection and removes all instances of the eventid value inside the events array.
  await applicant.updateMany({$pullAll: {events: [req.params.id] }});  

  res.send('Event was deleted')

});   

// exports the router
module.exports = router;
