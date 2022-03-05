//require the back end web application framework for node.js
const express = require("express");
//require object data model library for mongodb, mongoose library
const mongoose = require("mongoose");  
//middleware library to add better logging functionality for api requests
const morgan = require("morgan");
const cors = require("cors");

//creates a new instance of express application
const app = express();

// add cors header to the server and give our frontend access to the server response
app.use(cors({
  origin: '*'
}));

//sets up mongoose for the mongoDB connection
mongoose
.connect('mongodb://localhost:27017/breadoflife')
  .then(() => {
    console.log("Database connection Success!");
  })
  .catch((err) => {
    console.error("Mongo Connection Error", err);
  });
  
//declare port number for the api
const PORT = process.env.PORT || 3000; 

//gives access to the json request body
app.use(express.json()); 
//enable incoming request logging in dev mode
app.use(morgan("dev"));  

//Import Routes
const intakeFormRoute = require('./routes/intakeform');
const eventsRoute = require('./routes/events');
const applicantsRoute = require('./routes/applicants');
const reportsRoute = require('./routes/reports');

//middle ware for routes
app.use('/intakeform', intakeFormRoute);
app.use('/events', eventsRoute);
app.use('/applicants', applicantsRoute);
app.use('/reports', reportsRoute);


//using the PORT cost to listen 
app.listen(PORT, '0.0.0.0', () => {
  console.log("Server started listening on port : ", PORT);
});

//error handler
app.use(function (err, req, res, next) {
    // logs error and error code to console
    console.error(err.message);
    if (!err.statusCode) 
        err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});