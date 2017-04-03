const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
	title: {type: String, required: true},
	author: {
		firstName: {type: String, required: true},
		lastName: {type: String, required: true}
	},
	content: {type: String, required: true}
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
		id: this.id
		//need to add created field somehow
	}
}



const Post = mongoose.model('Post', postSchema);

module.exports = {Post};