var express = require('express');
var router = express.Router();
const multer = require("multer")
var path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
  }
})

const upload = multer({ storage: storage })

//Controller Modules
var plantfamily_controller = require("../controllers/plantfamilyController")
var plant_controller = require("../controllers/plantController")
var index_controller = require("../controllers/indexController")

/* GET home page. */
router.get('/', index_controller.index)

//Plant family routes

router.get("/plantfamilies", plantfamily_controller.plantfamily_list)

router.get("/plantfamilies/create", plantfamily_controller.plantfamily_create_get)

router.post("/plantfamilies/create", upload.single("image"), plantfamily_controller.plantfamily_create_post)

router.get("/plantfamilies/:id/", plantfamily_controller.plantfamily_detail)

router.get("/plantfamilies/:id/delete", plantfamily_controller.plantfamily_delete_get)

router.post("/plantfamilies/:id/delete", plantfamily_controller.plantfamily_delete_post)

router.get("/plantfamilies/:id/update", plantfamily_controller.plantfamily_update_get)

router.post("/plantfamilies/:id/update", upload.single("image"), plantfamily_controller.plantfamily_update_post)

//Plant routes

router.get("/plants", plant_controller.plant_list)

router.get("/plants/indoor", plant_controller.indoorplants_list)

router.get("/plants/create", plant_controller.plant_create_get)

router.post("/plants/create", upload.single("image"), plant_controller.plant_create_post)

router.get("/plants/:id", plant_controller.plant_detail)

router.get("/plants/:id/delete", plant_controller.plant_delete_get)

router.post("/plants/:id/delete", plant_controller.plant_delete_post)

router.get("/plants/:id/update", plant_controller.plant_update_get)

router.post("/plants/:id/update", upload.single("image"), plant_controller.plant_update_post)







module.exports = router;
