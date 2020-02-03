const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema;

const TodoSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String },
	owner: { type: ObjectId, ref: "User" },
	items: [{ type: ObjectId, ref: "Item" }]
}, { timestamps: true });

module.exports = mongoose.model("Todo", TodoSchema);