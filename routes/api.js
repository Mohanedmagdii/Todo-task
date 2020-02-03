var express = require("express");
var authRouter = require("./auth");
var todoRouter = require("./todos");
var itemRouter = require("./item");

var app = express();

app.use("/auth", authRouter);
app.use("/todos", todoRouter);
app.use("/items", itemRouter);

module.exports = app;