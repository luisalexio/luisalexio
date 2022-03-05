const e = require('express');
const express = require('express');
const { validate } = require('uuid');
const router = express.Router();

//importing data model schema's
let {applicant,event} = require('../models/models')

//get all the applicants, and have a total number events for each applicant
router.get('/', (req, res, next) => {

  applicant
  .aggregate()
  //.match({_id: uid})
  .project({
    _id: 1,
    firstName: 1,
    lastName: 1,
    phoneNumber: 1,
    zipCode: 1,
    isNeedSupoport: 1,
    isVaccinated: 1,    
    events: {$size:"$events"} // size of the array tells us how many events the applicant will attend or has attended.
  })
  .exec((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
      console.log(data);
    }
  })
});

// //shows the individual applicant details and a count of the services they used.
// router.get('/:id', (req, res, next) => {
//   applicant
//   .aggregate([
//     {$match : { _id : req.params.id } },
//     //{$project: { firstName:1, events: 1 }},
//     {$set: { //adds new field that equals size of the array for events.
//          totalevents: 
//           { $size: [ "$events"] } }
//     },
//     {$lookup: // we need to show the event history with details (name of event, date) instead of just the ids as they are stored.
//       {
//         from: 'event',
//         localField: "events",
//         foreignField: "_id",
//         as: "events",

//         pipeline: [ //lets us choose which fields we want to show
//           { $project: { _id: 1, eventDescription: 1, eventDate: 1 } },
//         ],
        
//       }
//    },
//   ])
//   .exec((error, data) => {
//     if (error) {
//       return next(error)
//     } else {
//       res.json(data)
//       console.log(data);
//     }
//   })
// });

//retrieve a single event by ID
router.get("/:id", (req, res, next) => {
  applicant
    .findOne({ _id: req.params.id }) //finds the event that matches that ID
    .populate(
      {
        path: "events", // adds the appliant information based on the event ids in the array
        select:
        "-applicants",
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

// exports the router 
module.exports = router;

