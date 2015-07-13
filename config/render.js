var views = require('co-views');

module.exports = views(__dirname + '/../public', {
	map: {html: 'swig'}
})