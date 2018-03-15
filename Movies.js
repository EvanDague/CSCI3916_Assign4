var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/Assign3_DB');

var MovieSchema = new Schema({
    title: String,
    year: Date,
    genre: {type: String, enum: ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Thriller", "Western", "Sci-Fi"]},
    actors: [{actor_name: String, character_name: String}]
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);