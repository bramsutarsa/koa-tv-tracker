var t = require('thunkify');
var _ = require('lodash');
var xml2js = require('xml2js');
var parserFormat = xml2js.Parser({explicitArray: false, normalizeTags: true});
var parsing = t(parserFormat.parseString);
var request = require('koa-request');
var apiKey = '9EF1D1E7D28FDA0B';

module.exports = {
  getSeriesId: function *(uriRequest) {
  	var resultRequest = yield request(uriRequest);
	var resultParser = yield parsing(resultRequest.body);
	if(!resultParser.data.series){
		return this.throw(404, { message: input.showName + ' was not found.' });
	}
	var seriesId = resultParser.data.series.seriesid || resultParser.data.series[0].seriesid;
    return seriesId;
  },
        
  getSeriesEpisode: function *(seriesId) {
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
    return showT;
  }
}