const express = require('express');
const router = express.Router();

const validator = require('./validatePost');

//for parsing JSON
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Post} = require('./models');

//router.use(validator);

//GET /posts sends back all posts in the database
router.get('/', (req, res) => {
	Post.find()
		.exec()
		.then(posts => {
			res.json({
				posts: posts.map(
					(post) => post.formatPost()
					)
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
	//validating all required fields are present and sending a 400 error if any missing
	//should probably also validate author firstname and lastname
	const requiredFields = ["title", "content", "author"];
	let missingFields = [];
	for (var i = 0; i < requiredFields.length; i++){
		if (!(requiredFields[i] in req.body)){
			missingFields.push(requiredFields[i]);
		}
	}
	if(missingFields.length > 0){
		errorMessage = "";
		missingFields.forEach(field => {
			errorMessage += field + " is required. ";
		})
		res.status(400).json({error: errorMessage});
	}
	//if all fields were present, create post
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
router.put('/:id', jsonParser, (req, res) => {
	if (!(req.body.id && req.body.id === req.params.id)){
		res.status(400).json({message: "ID in body must match URL path ID"})
	}
	const toUpdate = {};
	for (var field in req.body){
		if (field != "id"){
			toUpdate[field] = req.body[field];
			//below doesn't work:
			// Post.findByIdAndUpdate(req.params.id, {$set: {field: req.body[field]}}, {new: true})
			// .exec()
			// .then(post => {
			// 	console.log(post);
			// 	res.json(post);
			// })
		}
	}
	Post.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
	.exec()
	.then(post => {
		res.json(post.formatPost());
	})
	.catch(err => res.status(500).json({message: 'Internal server error'}))
});

//DELETE /posts/:id allows you to delete a post with a given id.
router.delete('/:id', (req, res) => {
	console.log(req.params.id);
	Post.findByIdAndRemove(req.params.id)
	.exec()
	.then(() => res.status(204).end())
	.catch(err => res.status(500).json({message: 'Internal server error'}))
});

module.exports = router;