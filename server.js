// =======================
// get the packages we need ============
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var c_user = require('./app/controllers/users');

var MongoClient = require('mongodb').MongoClient


    
// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8083; // used to create, sign, and verify tokens
mongoose.connect(config.database); 
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route

var apiRoutes = express.Router();
/**
* @api {get} /users Get all users data
* @apiName GetUser
* @apiGroup User
*/



apiRoutes.get('/users', c_user.getAll);


apiRoutes.post('/authenticate', function(req, res) {

	var nama = req.body.name;

	User.findOne({
		name: nama
	}, function(err, result) {
		if(err) throw err;

		if(!result) {
			res.json({
				success: false,
				message: 'Authentication failed. User not found'
			});
		} else if(result) {
			var password = req.body.password;
			if(result.password != password) {
				res.json({
					success: false,
					message: 'Authentication failed. Wrong password'
				});
			} else {
				var token = jwt.sign(result, app.get('superSecret'), {
		          expiresIn: '14h' // expires in 24 hours
		        });

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}
		}
	});

});

apiRoutes.use(function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if(token) {
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if(err) {
				return res.json({
					success: false,
					message: 'Failed to authenticate token'
				});
			} else {
				req.decoded	= decoded;
				next();
			}
		});
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provided'
		});
	}
});

apiRoutes.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

apiRoutes.get('/setup', function(req, res) {
	var mahendra = new User({
		name: "Mahendra Wardana",
		password: "mahendrawardana",
		admin: true
	});

	mahendra.save(function(err, result) {
		if(err) throw err;

		console.log('User saved successfully');
		res.json({
			success: true
		});
	});
});



app.use('/v1', apiRoutes);

// API ROUTES -------------------
// we'll get to these in a second

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);