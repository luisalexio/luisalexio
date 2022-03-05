const express = require('express');
const { validate } = require('uuid');
const router = express.Router();

//importing data model schema's
let {applicant,event} = require('../models/models')

// sort the events is asc order and get the last 3 so that the intake form will only the 3 latest events.
router.get('/', (req, res, next) => {
  //declare the results from query as a variable
  let query = event.find({}, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data);
    }
  });
  // add additional queries to the first one that finds all documents
  //https://mongoosejs.com/docs/api.html#query_Query-sort sort by field eventdate in ascending order
  //https://mongoosejs.com/docs/api.html#query_Query-limit limits the number of returned documents to 3
  query.sort({field: 'asc', eventDate: -1}).limit(3);

});

// referenced for two way embedding method https://dev.to/nehalahmadkhan/many-to-many-relationship-in-mongodb-nodejs-express-mongoose-4djm
// operations needs to run async so that the information can come from the same instance off the application model,
// since newly made applicantid is parsed from new instance and used as a reference to update the event model.
//uses the eventid as a parameter, because we want the end user to select an event and sign up for it.
router.post('/:eventid', async (req, res, next) => {
    // lets us add the event id from the request parameters to the array that stores events for the applicant
    let eventid = req.params['eventid'] //store eventid param as var
    let eventsKey = req.body.events // parse the array of events from req.body
    await eventsKey.push(eventid) // add the eventid var to the array for the applicant

    //create an async function with error handling to create a new applicant document in mongo, and store it to a variable so we can parse it later.
    async function createApplicant() {
      try {
        const newApplicant = applicant.create(req.body); // creates new applicant using request body
        return newApplicant; // return obj
      } catch (error) {
        if (error.name == "ValidationError") { // if statement to handle errors that have the name propety equal to validationerror
          res.send(error); //returns a 400 status and sends the error object as a response.      
          return res.status(400)
        }
        // for anything else not covered by the catch, send a 500 response.
        res.status(500)
    }}   
    //call the async functions
    const newApplicant = await createApplicant()
    await event.findOneAndUpdate ({_id: eventid}, { $push: { applicants: newApplicant._id} }); 

    res.send('Added the applicant.')
  });

// need to get the data of the exisiting applicants to use for put request
router.get('/:eventid/:id', (req, res, next) => {
  applicant.findOne({_id: req.params.id},(error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

//to update an existing applicant with the new event, we have to do a get request to recieve the current document in mongo
//and use that same data as the request body for the put request.
// removed the catch blocks from these because it would not update the db as a async function. not sure why.
router.put('/:eventid/:id', async (req, res, next) => {

  let eventsKey = req.body.events // parse the array of events from req.body

  await eventsKey.push(req.params.eventid) // add the eventid var to the array for the applicant

  await event.findOneAndUpdate ({_id: req.params.eventid}, { $addToSet: { applicants: req.params.id} })

  await applicant.findOneAndUpdate({ _id: req.params.id }, {$set: req.body})
 
  res.send('Added the applicant.')
});
    

// exports the router 
module.exports = router;