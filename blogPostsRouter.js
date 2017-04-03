const express = require('express');
const router = express.Router();


//for parsing JSON
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Post} = require('./models');


router.get('/', (req, res) => {
	Post
		.find()
		.exec()
		.then(posts => {
			res.json({
				posts: posts.map(
					(post) => post.formatPost())
			});
		})
		.catch(
			err => {
				console.error(err);
				res.status(500).json({message: 'Internal server error'});
			}
		);
});

module.exports = router;