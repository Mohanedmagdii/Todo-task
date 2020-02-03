const { User, validateUser } = require("../models/User");
const apiResponse = require("../helpers/apiResponse");
const bcrypt = require("bcrypt");
const _ = require('lodash');
const Joi = require('joi')

/**
 * User registration.
 *
 * @param {string}      username
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */


exports.register = async (req, res, next) => {
	var body = req.body;
	const { error } = validateUser(body);
	if (error) return apiResponse.validationErrorWithData(res, error.details[0].message, {})

	let email = await User.findOne({ email: body.email });
	if (email) return apiResponse.ErrorResponse(res, "Email already taken.")

	var newUser = new User(_.pick(body, [
		'username',
		'email',
		'password']))

	const salt = await bcrypt.genSalt(10);
	newUser.password = await bcrypt.hash(newUser.password, salt);

	await newUser.save();
	return apiResponse.successResponse(res, "User Registered")
}

/**
 * User Login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */

exports.login = async (req, res, next) => {
	var body = req.body;
	const { error } = validate(body);
	if (error) return apiResponse.validationErrorWithData(res, "Validation Error" ,error.details[0].message)

	let user = await User.findOne({ email: body.email });
	if (!user) return apiResponse.ErrorResponse(res, "Invalid email.")

	const validPassowrd = await bcrypt.compare(body.password, user.password);
	if (!validPassowrd) return apiResponse.ErrorResponse(res, "Invalid Password.")

	let userData = {
		_id: user._id,
		lastName: user.username,
		email: user.email
	}

	const token = user.generateAuthToken()
	userData.token = token
	return apiResponse.successResponseWithData(res, "Login Success", userData)
}

function validate(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };

    return Joi.validate(req, schema);
}