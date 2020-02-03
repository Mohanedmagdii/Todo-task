var express = require("express");
const ItemController = require("../controllers/ItemController");
const auth = require('../middlewares/auth');

var router = express.Router();

router.get("/users", auth, ItemController.itemUsers);
router.post('/add', auth, ItemController.itemAdd);
router.get('/:id', auth, ItemController.itemDetails)
router.post('/:id/done', auth, ItemController.itmeDoneToggle)
router.post('/:id/link', auth, ItemController.linkItem)

module.exports = router;