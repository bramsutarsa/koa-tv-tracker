

var co = require('co');
var t = require('thunkify');
var _ = require('lodash');
var xml2js = require('xml2js');
var parserFormat = xml2js.Parser({explicitArray: false, normalizeTags: true});
var parsing = t(parserFormat.parseString);
var request = require('koa-request');
var parse = require('co-body');
var render = require('../config/render');

var wrap = require('co-monk');
var monk = require('monk');
var db = monk('localhost/showdb');
var Show = wrap(db.get('shows'));
var apiKey = '9EF1D1E7D28FDA0B';

module.exports = function(app, route){
	app.use(route.post('/api/shows', function*(){
			
			if('POST' != this.method) return yield next;
			var input = yield parse(this);
			var seriesName = input.showName
			    .toLowerCase()
			    .replace(/ /g, '_')
			    .replace(/[^\w-]+/g, '');
			var uriRequest = 'http://thetvdb.com/api/GetSeries.php?seriesname='+seriesName;
/*			var results = yield {
				seriesId: test.getSeriesId(uriRequest),
				showT: test.getSeriesEpisode(seriesId)
			};*/
			var resultRequest = yield request(uriRequest);
			var resultParser = yield parsing(resultRequest.body);
			if(!resultParser.data.series){
				return this.throw(404, { message: input.showName + ' was not found.' });
			}
			var seriesId = resultParser.data.series.seriesid || resultParser.data.series[0].seriesid;

			var uriComplete = 'http://thetvdb.com/api/' + apiKey + '/series/' + seriesId + '/all/en.xml';
			var resultComplete = yield request(uriComplete);
			var resultParserComplete = yield parsing(resultComplete.body);
			var series = resultParserComplete.data.series;
          	var episodes = resultParserComplete.data.episode;

          	var showT = {
				seriesId: series.id,
	            name: series.seriesname,
	            airsDayOfWeek: series.airs_dayofweek,
	            airsTime: series.airs_time,
	            firstAired: series.firstaired,
	            genre: series.genre.split('|').filter(Boolean),
	            network: series.network,
	            overview: series.overview,
	            rating: series.rating,
	            ratingCount: series.ratingcount,
	            runtime: series.runtime,
	            status: series.status,
	            poster: series.poster,
	            episodes: []
          	};
          	_.each(episodes, function(episode) {
            showT.episodes.push({
              season: episode.seasonnumber,
              episodeNumber: episode.episodenumber,
              episodeName: episode.episodename,
              firstAired: episode.firstaired,
              overview: episode.overview
            });
          });

          	var url = 'http://thetvdb.com/banners/' + showT.poster;
          	var posterRequest= yield request({ url: url, encoding: null });
          	showT.poster = 'data:' + posterRequest.headers['content-type'] + ';base64,' + posterRequest.body.toString('base64');
          	var show = yield Show.insert(showT);
          	if(show === null){
          		return this.throw(409, { message: show.name + ' was not found.' });
          	}
		console.log("success save show");
		//this.body = 'done POST';
	}));
	
	app.use(route.get('/api/shows', function *(){
		if('GET' != this.method) return yield next;
		if(this.request.query.genre){
			var byGenre = yield Show.find({genre: this.request.query.genre});
			this.body = byGenre;
		}else if(this.request.query.alphabet){
			var byAlphabet = yield Show.find({ name: new RegExp('^' + '[' + this.request.query.alphabet + ']', 'i') });
			this.body = byAlphabet;
		}
		else{
			var displayAll = yield Show.find({}, {limit: 12});
			this.body = displayAll;
		}
		
	}));

	app.use(route.get('/api/shows/:seriesId', function *(seriesId){
		if('GET' != this.method) return yield next;
		var byGenre = yield Show.find({seriesId: seriesId});
		//console.log(byGenre);
		this.body = byGenre;
	}));


	/*app.use(route.get('/*', function*(){
    	this.body = yield render('index.html');
  	}));*/

  	/*app.use(route.get('*', function*(){
    	this.redirect('/#' +this.originalUrl);
  	}));*/  	
};


/*var zipcode, city, state, temperature, people, info;
zipcode = req.param.zipcode;

co(function *(){
	try{
		var results = yield {
			foundLocation: location.findLocationByZipcode(zipcode);
			foundPopulation: population.findPopulationByZipcode(zipcode);
		};
		if(results && results.foundPopulation && results.foundLocation){
			var foundTemperature = weather.getTempetaruteByLatLong(results.foundLocation.latitude, results.foundLocation.longitude);
			city = results.foundTemperature.city;
			state = results.foundTemperature.state;
			people = results.foundPopulation;
			temperature = foundTemperature;
			info = 'Location' +city+ ', ' +state;
			info += 'Temperature: ' +temperature;
			info += 'Population' +people;

		}else{
			res.status(500).send("problem");
		}
	}
	catch(err){
		res.status(500).send("problem");
	}
});

async.parallel(
	[function(callback){
		location.findLocationByZipcode(zipcode, callback);
	},
	function(callback){
		population.findPopulationByZipcode(zipcode, callback);
	}],
	function(err, result){
		if(err){
			return res.status(500).send("problem");
		}else{
			var foundLocation, foundPopulation;
			if(result && result.length > 1){
				foundPopulation = result[0];
				foundLocation = result[1];
			}
			if(foundPopulation && foundLocation){
				weather.getTempetaruteByLatLong(foundLocation.latitude, foundLocation.longitude,
					function(err, foundTemperature){
						if(err){
							return res.status(500).send("problem");
						}else{
							if(foundTemperature){
								city = foundTemperature.city;
								state = foundTemperature.state;
								people = foundPopulation;
								temperature = foundTemperature;
								info = 'Location' +city+ ', ' +state;
								info += 'Temperature: ' +temperature;
								info += 'Population' +people;

								res.send(info);
							}
							else{
								return res.status(500).send("problem");
							}
						}
				});
			}
		}
	});*/