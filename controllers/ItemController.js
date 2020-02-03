const Item = require("../models/Item");
const Todo = require("../models/Todo");
const { User } = require("../models/User");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");
const Joi = require('joi')

// Item Schema
function ItemData(data) {
    this.text = data.text;
    this.done = data.done;
    this.owner = data.owner;
    this.linkedTo = data.linkedTo;
    this.todoList = data.todoList;
}

/**
 * Item Detail.
 *  
 * @returns {Object}
 */

exports.itemDetails = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
    }

    let item = await Item.findOne({ _id: req.params.id }).populate('owner todoList linkedTo', ['username','title'])
    if (item) return apiResponse.successResponseWithData(res, 'Success', item)
    return apiResponse.ErrorResponse(res, "No Item with this id")
}

/**
 * Todo Add.
 * 
 * @param {string}      text 
 * @param {string}      todoList(ID)
 * 
 * @returns {Object}
 */

function validate(req) {
    const schema = {
        text: Joi.string().min(2).max(255).required().error(() => { return { message: "please provide text minimum 2 chars" } }),
        todoList: Joi.string().required().error(() => { return { message: "Error!" } })
    };

    return Joi.validate(req, schema);
}

exports.itemAdd = async (req, res, next) => {
    const { error } = validate(req.body)
    if (error) return apiResponse.validationErrorWithData(res, "Validation error", error.details[0].message)

    if (!mongoose.Types.ObjectId.isValid(req.body.todoList)) {
        return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
    }

    let newItem = new Item({
        text: req.body.text,
        owner: req.user._id,
        todoList: req.body.todoList
    })

    let todo = await Todo.findOne({ _id: req.body.todoList })
    if (!todo) return apiResponse.notFoundResponse(res, "No Item with this ID")

    Promise.all([
        newItem.save(),
        Todo.updateOne({ _id: req.body.todoList }, { $push: { items: newItem._id } })
    ])

    let itemData = new ItemData(newItem)
    return apiResponse.successResponseWithData(res, "Success", itemData)
}

/**
 * item done toggle.
 * 
 * 
 * @returns {Object}
 */

exports.itmeDoneToggle = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
    }

    let item = await Item.findOne({ _id: req.params.id })
    if (!item) return apiResponse.notFoundResponse(res, "Item Not found")

    item.done = !item.done
    await item.save()

    let itemData = new ItemData(item)
    apiResponse.successResponseWithData(res, "Item updated", itemData)
}

/**
 * link item to user.
 * 
 * @param {string}      id(item)
 * @param {string}      userID
 * 
 * @returns {Object}
 */

exports.linkItem = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.body.userID)) {
        return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
    }

    let item = await Item.findOne({ _id: req.params.id })
    if (!item) return apiResponse.notFoundResponse(res, "Item not found")

    if (item.owner.toString() !== req.user._id) {
        return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
    }

    let user = await User.findOne({ _id: req.body.userID })
    if (!user) return apiResponse.notFoundResponse(res, "No user found")

    item.linkedTo = user._id;
    await item.save()

    let itemData = new ItemData(item)
    return apiResponse.successResponseWithData(res, "Item linked Successfully", itemData)
}

/**
 * 
 * @returns {Object}
 *
 */

exports.itemUsers = async (req, res, next) => {
    let users = await User.find({
        _id: {
            $ne: req.user._id
        }
    })

    return apiResponse.successResponseWithData(res, "Success", users)
}