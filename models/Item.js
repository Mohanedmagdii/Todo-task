const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema;

const ItemSchema = new Schema({
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
    owner: { type: ObjectId, ref: "User" },
    linkedTo: { type: ObjectId, ref: "User" },
    todoList: { type: ObjectId, ref: "Todo" }
}, { timestamps: true });

module.exports = mongoose.model("Item", ItemSchema);