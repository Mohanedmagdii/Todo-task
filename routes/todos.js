var express = require("express");
const TodoController = require("../controllers/TodoController");
const auth = require('../middlewares/auth');

var router = express.Router();

router.get("/", auth, TodoController.todoList);
router.get("/:id", auth, TodoController.todoDetail);
router.post("/", auth, TodoController.todoAdd);
router.delete("/:id", auth, TodoController.todoDelete);

module.exports = router;