//https://mongoosejs.com/docs/populate.html
//11/6/21 Changed boolean to string because axios cant send boolean as the body of a request.
const uuid = require('uuid');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//collection for applicants
let applicantSchema = new Schema({
    //_id: Number,
    _id: { type: String, default: uuid.v1 
    },
    firstName: {
      type: String
    },
    lastName: {
        type: String
    },
    phoneNumber: {
        type: String
      },
    zipCode: {
        type: String
    },
    marketSurvey: {
      type: Array
    },
    isNeedSupport: {
      type: String
    },
    numChildren: {
        type: Number
      },
    is65orOlder: {
        type: String,
    },
    isVeteran: {
        type: String,
    },
    raceEthnicity: {
        type: String,
    },
    isGettingVaccine: {
      type: String,
    },
    isVaccinated: {
      type: String,
    },
    vaccinePreference: {
      type: String,
    },
    events: 
      [{type: String, ref: 'Event'}]
    
}, {
    collection: 'applicant'
});

//collection for events
let eventSchema = new Schema({
  _id: { type: String, default: uuid.v1 },
  eventDescription: {
    type: String
  },
  eventDate: {
      type: String
  },
  eventAddress: {
    type: String
  },
  eventZip: {
    type: Number
  },
  applicants: 
    [{type: String, ref: 'Applicant'}]
    //type: Array, ref: 'Applicant'
  
}, {
  collection: 'event'
});

//create models for mongoose schema to use applicant and eventList data model ('js', schema name)
const applicant = mongoose.model('Applicant', applicantSchema); 
const event = mongoose.model('Event', eventSchema); 

// package the models in an object to export both
module.exports = {applicant,event}



