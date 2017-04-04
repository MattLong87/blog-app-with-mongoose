const express = require('express');
const router = express.Router();

const validator = require('./validatePost');

//for parsing JSON
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Post} = require('./models');

router.use(validator);

//GET /posts sends back all posts in the database
router.get('/', (req, res) => {
	Post.find()
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

//GET /posts/:id sends back a single post with :id if it exists
router.get('/:id', (req, res) => {
	Post.findOne({_id: req.params.id})
		.exec()
		.then(post => {
			res.json(post.formatPost());
		})
		.catch(
			err => {
				console.error(err);
				res.status(500).json({message: 'Internal server error'});
			}
		);
});

//POST /posts endpoint for creating new blog posts
router.post('/', jsonParser, (req, res) => {
	Post.create({
		title: req.body.title,
		content: req.body.content,
		author: req.body.author
	})
	.then(post => res.status(201).json(post.formatPost()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'Internal server error'});
	});
});

//PUT /posts/:id endpoint that allows you to update the title, content, and author fields.

//DELETE /posts/:id allows you to delete a post with a given id.
module.exports = router;