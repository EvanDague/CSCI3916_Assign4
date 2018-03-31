var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');
var jwt = require('jsonwebtoken');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();
router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code === 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });


    });
});

router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);
            // return the users
            res.json(movies);
        });
    })
router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res){
        var newMovie = new Movie();
        newMovie.title = req.body.title;
        newMovie.year = req.body.year;
        newMovie.genre = req.body.genre;
        newMovie.actors = req.body.actors;
        newMovie.save(function(err) {
            if (err) {
                return res.send(err);
            }

            res.json({message: 'Movie created!'});
        });
    })
router.route('/movies')
    .put(authJwtController.isAuthenticated,function (req, res) {
        var query = {};
        query.title = req.body.title;
        query.year = req.body.year;
        query.genre = req.body.genre;
        query.actors = req.body.actors;

        Movie.update({_id: req.body._id}, {$set: query}, function(err, obj) {
            if (err) throw err;

            res.json({message: 'Movie updated'});
        });
    })
router.route('/movies')
    .delete(authJwtController.isAuthenticated,function (req, res) {
        var query = {};
        query._id = req.body._id;

        Movie.remove(query, function(err, obj) {
            if (err) throw err;

            res.json({message: 'Movie deleted'})
        });
    })

router.route('/movies/:movieID')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieID;
        var query = {};
        query["movie"] = "Avatar";
        Movie.findById(id, function(err, movie) {
            if (err) res.send(err);

            if(req.query.reviews) {
                Review.find(query, function (err, reviews) {
                    if (err) res.send(err);
                    // add reviews
                    res.json({movie: movie, reviews: reviews});
                });
            }
            else{
                res.json(movie);
            }
        });
    });
router.route('/reviews')
    .get(function (req, res) {
        Review.find(function (err, reviews) {
            if (err) res.send(err);
            // return the users
            res.json(reviews);
        });
    })
router.route('/reviews')
    .post(authJwtController.isAuthenticated, function (req, res) {
        var newReview = new Review();
        newReview.name = req.body.name;
        newReview.movie = req.body.title;
        newReview.review = req.body.review;
        newReview.rating = req.body.rating;
        newReview.save(function(err) {
            if (err) {
                return res.send(err);
            }

            res.json({message: 'Review created!'});
        });
    })

app.use('/', router);
app.listen(process.env.port || 8080);
