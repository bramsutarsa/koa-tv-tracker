'use-strict';

var koa = require('koa');
var path = require('path');
var fs = require('fs');
var views = require('co-views');
var serve = require('koa-static');
var route = require('koa-route');
var logger = require('koa-logger');
var jsonp = require('koa-jsonp');
var test = require('./lib/get.js');

/******************************************************
 * Initialize application
 ******************************************************/
 var app = module.exports = koa();
 app.use(jsonp());
 app.use(logger());

 /** Define public path, for css/js/images **/
 //A basic necessity for most http servers is to be able to serve static files
 app.use(serve(__dirname + '/public'));
 console.log('Serving public files at '+__dirname +'/public');

 /******************************************************
 * Bootstrap routes/api
 * Scan all directory /routes and add to app
 ******************************************************/
 var routePath = path.join(__dirname + '/routes');
 fs.readdirSync(routePath).forEach(function(filename){
 	if(filename[0] === '.') return;
 	require(routePath + '/' +filename)(app, route);
 });
console.log('Serving route files at '+routePath);

/******************************************************
 * Handle Error 404 and 500
 ******************************************************/
/*app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    this.status = 500;
    this.body = err.message;
    this.app.emit('error', err, this);
  }
});

app.use(function *(){
    var err = new Error();
    err.status = 404;
    this.body  = yield render('404.html', { errors: err});
});*/

 /******************************************************
 * Start server
 ******************************************************/
if(!module.parent){
	//var port = process.env.PORT || config.port || 9001;
	var port = process.env.PORT || 3000;
	app.listen(port);
	console.log('Running site at http://localhost:%d', port);
}