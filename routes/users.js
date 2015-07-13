var co = require('co');
var t = require('thunkify');
var _ = require('lodash');
var parse = require('co-body');
var bcrypt = require('co-bcrypt');
var jwt = require('koa-jwt');
var render = require('../config/render');
var wrap = require('co-monk');
var monk = require('monk');
var db = monk('localhost/showdb');
var User = wrap(db.get('users'));
var SALT_FACTOR = 10;
var TOKEN_SECRET = 'yeahhh';

module.exports = function(app, route){
	app.use(route.post('/api/signup', function *(){
		var input = yield parse(this);
		var salt = yield bcrypt.genSalt(SALT_FACTOR);
		var hash = yield bcrypt.hash(input.password, salt)
		var userT = {
			email: input.email,
			password: hash
		};
		var user = yield User.insert(userT);
		this.redirect('/');
		console.log(user);
	}));

	app.use(route.post('/api/login', function *(){
		var input = yield parse(this);
		var salt = yield bcrypt.genSalt(SALT_FACTOR);
		var user = yield User.findOne({email: input.email});
		if(yield bcrypt.compare(input.password, user.password)) {
			//create JWT Token
			var payload = {
			    user: user,
			    iat: new Date().getTime(),
			    //exp: moment().add('days', 7).valueOf()
			  };
			var token = jwt.sign(payload, TOKEN_SECRET);
			console.log(token);
			this.body = {token: token};
		}else{
			return this.throw(401, { message: 'Invalid email and/or password' });
		}

	}));
};

