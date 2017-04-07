const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {Post} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

const requiredKeys = ['id', 'title', 'content', 'author', 'created'];

function seedPosts(){
	const seeds = [];

	for (let i=1; i<=10; i++){
		seeds.push(generatePost());
	}
	return Post.insertMany(seeds);
}

function generatePost(){
	return {
		title: faker.lorem.sentence(),
		content: faker.lorem.paragraph(),
		author: {
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName()
		},
		created: Date.now().toString()
	};
};

function tearDownDb(){
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

describe('Blog posts API resource', function(){
	before(function(){
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function(){
		return seedPosts();
	});

	afterEach(function(){
		return tearDownDb();
	});

	after(function(){
		return closeServer();
	});

	describe('GET endpoint', function(){
		it('should return all blog posts', function(){
			let res;
			return chai.request(app)
				.get('/posts')
				.then(function(_res){
					res = _res;
					res.should.have.status(200);
					res.body.posts.should.have.length.of.at.least(1);
					return Post.count();
				})
				.then(function(count){
					res.body.posts.should.have.length.of(count);
				});
		});

		it('should return posts with the right fields', function(){
			let resPost;
			return chai.request(app)
				.get('/posts')
				.then(function(res){
					res.should.have.status(200);
					res.should.be.json;
					res.body.posts.should.be.a('array');
					res.body.posts.should.have.length.of.at.least(1);
					res.body.posts.forEach(function(post){
						post.should.be.a('object');
						post.should.include.keys(
							//ES6 spread operator
							...requiredKeys);
					});
					resPost = res.body.posts[0];
					return Post.findById(resPost.id);
				})
				.then(function(post){
					resPost.id.should.equal(post.id);
					resPost.title.should.equal(post.title);
					resPost.content.should.equal(post.content);
					resPost.author.should.equal(post.fullName);
					resPost.created.should.equal(post.created);
				});
		});
	});

	describe('POST endpoint', function(){
		it('should add a new post', function(){
			const newPost = generatePost();
			const newAuthor = newPost.author.firstName + " " + newPost.author.lastName
			return chai.request(app)
				.post('/posts')
				.send(newPost)
				.then(function(res){
					res.should.have.status(201);
					res.should.be.json;
					res.body.should.be.a('object');
					res.body.should.include.keys(
						...requiredKeys);
					res.body.title.should.equal(newPost.title);
					res.body.content.should.equal(newPost.content);
					res.body.created.should.not.be.null;
					res.body.id.should.not.be.null;
					res.body.author.should.equal(newAuthor);
					return Post.findById(res.body.id);
				})
				.then(function(post){
					post.title.should.equal(newPost.title);
					post.content.should.equal(newPost.content);
					post.fullName.should.equal(newAuthor);
					post.created.should.not.be.null;
				});
		});
	});

	describe('PUT endpoint', function(){
		it('should update fields it is sent', function(){
			const updatePost = {
				title: "aaaaaaa"
			};
			//need to get a post first to update it
			return Post.findOne()
				.exec()
				.then(function(post){
					updatePost.id = post.id;
					return chai.request(app)
						.put(`/posts/${post.id}`)
						.send(updatePost);
				})
				.then(function(res){
					res.should.have.status(200);
					return Post.findById(updatePost.id).exec();
				})
				.then(function(post){
					post.title.should.equal(updatePost.title);
				});
		});
	});

	describe('DELETE endpoint', function(){
		it('should delete a post by ID', function(){
			let post;
			return Post.findOne()
				.exec()
				.then(function(_post){
					post = _post;
					return chai.request(app).delete(`/posts/${post.id}`);
				})
				.then(function(res){
					res.should.have.status(204);
					return Post.findById(post.id).exec();
				})
				.then(function(_post){
					should.not.exist(_post);
				});
		});
	});

});