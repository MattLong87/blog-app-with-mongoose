const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {Post} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

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
			firstName: faker.name.firstName,
			lastName: faker.name.lastName
		}
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
		return tearDownDb;
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
							'id', 'title', 'content', 'author', 'created');
					});
					resPost = res.body.posts[0];
					return Post.findById(resPost.id);
				})
				.then(function(post){
					resPost.id.should.equal(post.id);
					resPost.title.should.equal(post.title);
					resPost.content.should.equal(post.content);
					resPost.author.should.equal(post.author);
					resPost.created.should.equal(post.created);
				});
		});
	});

	describe('POST endpoint', function(){

		
	})



});