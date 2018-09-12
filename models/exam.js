var mongoose = require('mongoose');
var Sample     = require('../models/sample');

// define the schema for sample exams
var examSchema = new mongoose.Schema({
    _sample          : { type: mongoose.Schema.Types.ObjectId, ref: 'Sample' },
    type             : String,
    parameter        : String,
    unit             : String,
    result           : String,
    ref              : String
});

// create the model for exam and expose it to our app
module.exports = mongoose.model('Exam', examSchema);