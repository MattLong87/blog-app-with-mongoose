const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
	title: {type: String, required: true},
	author: {
		firstName: {type: String, required: true},
		lastName: {type: String, required: true}
	},
	content: {type: String, required: true},
	created: {type: String}
});

postSchema.virtual('fullName').get(function(){
	return `${this.author.firstName} ${this.author.lastName}`;
});

postSchema.methods.formatPost = function(){
	return {
		title: this.title,
		content: this.content,
		author: this.fullName,
		//putting id here so we can have one to use for requests
		id: this.id,
		created: this.created
	}
}

const Post = mongoose.model('Post', postSchema);

module.exports = {Post};