const Todo = require("../models/Todo");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");
const Joi = require('joi')

// Todo Schema
function TodoData(data) {
	this.id = data._id;
	this.title = data.title;
	this.description = data.description;
	this.owner = data.owner;
	this.items = data.items;
}

/**
 * Todo List.
 * 
 * @returns {Object}
 */


exports.todoList = async (req, res, next) => {
	let todos = await Todo.find({ owner: req.user._id }).populate('owner items', ['username','email', 'text'])

	if (todos.length > 0) return apiResponse.successResponseWithData(res, 'Success', todos)
	return apiResponse.successResponseWithData(res, 'Success', [])
}

/**
 * todo Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */

exports.todoDetail = async (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
	}

	let todo = await Todo.findOne({ _id: req.params.id, user: req.user._id }).populate('owner items', ['username','email', 'text'])
	if (todo) {
		let todoData = new TodoData(todo)
		return apiResponse.successResponseWithData(res, 'Success', todoData)
	}

	return apiResponse.successResponseWithData(res, 'Success', {})
}

/**
 * Todo Add.
 * 
 * @param {string}      title 
 * @param {string}      description
 * 
 * @returns {Object}
 */

function validate(req) {
	const schema = {
		title: Joi.string().min(5).max(255).required().error(() => { return { message: "please provide title minimum 5 chars" } }),
		description: Joi.string().min(5).max(255).required().error(() => { return { message: "Please provide description minimum 5 chars" } })
	};

	return Joi.validate(req, schema);
}

exports.todoAdd = async (req, res, next) => {
	const { error } = validate(req.body)
	if (error) return apiResponse.validationErrorWithData(res, "Validation error", error.details[0].message)

	let newTodo = new Todo({
		title: req.body.title,
		description: req.body.description,
		owner: req.user._id,
		items: []
	})

	await newTodo.save()
	let todoData = new TodoData(newTodo)

	return apiResponse.successResponseWithData(res, "Success", todoData)
}

/**
 * Todo Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */

exports.todoDelete = async (req,res,next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
	}

	let todo = await Todo.findOne({ _id: req.params.id })
	if(!todo) return apiResponse.notFoundResponse(res, "No Todo with this ID");

	if (todo.owner.toString() !== req.user._id) {
		return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
	}

	await Todo.deleteOne({ _id: req.params.id })
	return apiResponse.successResponse(res, "Todo delete Success.");
}