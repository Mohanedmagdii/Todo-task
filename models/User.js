const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const Joi = require('joi');
const jwt = require('jsonwebtoken');


const UserSchema = new mongoose.Schema({
	username: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	todos: [{ type: ObjectId, ref: "Todo" }]
}, { timestamps: true });

// Virtual for user's full name
UserSchema
	.virtual("fullName")
	.get(function () {
		return this.firstName + " " + this.lastName;
	});

UserSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id, role: 'user' }, process.env.JWT_SECRET);
	return token;
}

function validateUser(user) {
    const schema = {
        username: Joi.string().min(2).max(50).required().error(() => { return { message: "username is required and can't be less than 2 chars"}}),
        email: Joi.string().min(5).max(255).required().email().error(() => { return { message: "email is required"}}),
        password: Joi.string().min(5).max(255).required().error(() => { return { message: "password is required and can't be less than 5 chars"}})
    };

    return Joi.validate(user, schema);
}


const User = mongoose.model("User", UserSchema);

exports.User = User;
exports.validateUser = validateUser;