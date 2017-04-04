const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

var validatePost = function(req, res, next){
	console.log("validating " + req.body.title);
	next();
}

module.exports = validatePost;