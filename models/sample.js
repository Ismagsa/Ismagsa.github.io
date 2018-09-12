// load up the result model
var mongoose = require('mongoose');
var User     = require('../models/user');
var Exam     = require('../models/exam');

// define the schema for user samples
var sampleSchema = new mongoose.Schema({
    _user            : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type             : String,
    code             : String,
    date             : String,
    etype            : [String],
    medic            : String,
    lab              : String,
    meta             : String,
    results          : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Sample', sampleSchema);