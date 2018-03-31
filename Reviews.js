var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.connect(process.env.DB);

// user schema
var ReviewSchema = new Schema({
    name: String,
    movie: String,
    review: String,
    rating: { type: Number, multipleOf: .5, minimum: 1, maximum: 5}
});

// return the model
module.exports = mongoose.model('Review', ReviewSchema);