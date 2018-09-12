var mongoose = require('mongoose');

// define the schema for a building
var buildingSchema = new mongoose.Schema({
    name                : String,
    type                : String,
    coordinates         : {
        latitude        : String,
        longitude       : String
    },
    schedule: {
        weekday : String,
        weekend : String
    },
    description: String,
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Building', buildingSchema);