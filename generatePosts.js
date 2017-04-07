const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const faker = require('faker');

const {PORT, DATABASE_URL} = require('./config');


const blogPostsRouter = require('./blogPostsRouter');

const {Post} = require('./models');
const {app, runServer, closeServer} = require('./server');

runServer()
.then(seedPosts)
.then(closeServer)
.catch(function(err){
	console.log("about to log");
	console.log(err);
})

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
