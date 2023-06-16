var Plant = require("../models/plant");
var async = require("async");
var PlantFamily = require("../models/plantfamily")
const { body, validationResult } = require("express-validator");

exports.plant_list = function (req, res, next) {
	Plant.find()
		.sort([["name", "ascending"]])
		.exec(function (err, list_plants) {
			if (err) { return next(err); }
			res.render("plants_list", { title: "Plants", plants_list: list_plants })
		})
}

exports.plant_detail = function (req, res, next) {

	Plant.findById(req.params.id)
		.populate("family")
		.exec(function (err, plant) {
			if (err) { return next(err); }
			if (plant == null) {
				var err = new Error("Plant not found");
				err.status = 404;
				return next(err);
			}
			res.render("plant_detail", { plant: plant })

		})
}


exports.indoorplants_list = function (req, res, next) {
	Plant.find({ "indoors": true })
		.sort([["name", "ascending"]])
		.exec(function (err, list_plants) {
			if (err) { return next(err); }
			res.render("plants_list", { title: "Indoor Plants", plants_list: list_plants })
		})
}

exports.plant_create_get = function (req, res, next) {

	async.parallel({
		plantfamilies: function (callback) {
			PlantFamily.find(callback)
		}
	}, function (err, results) {
		if (err) { return next(err); }
		res.render("plant_form", { title: "Add New Plant", plantfamilies: results.plantfamilies })
	}
	)
};

exports.plant_create_post = [

	body("name").trim().isLength({ min: 1 }).escape().withMessage("Name must be specified."),
	body("family").trim().isLength({ min: 1 }).escape().withMessage("Family must be specified."),
	body("description").trim().isLength({ min: 1 }).escape().withMessage("Description must not be empty."),

	(req, res, next) => {
		const errors = validationResult(req);
		let indoors;
		if (req.body.indoors === "on") {
			indoors = true
		}
		else { indoors = false }
		var plant = new Plant(
			{
				name: req.body.name,
				family: req.body.family,
				description: req.body.description,
				amount: req.body.amount,
				indoors: indoors,
				imageurl: "/uploads/" + req.file.filename
			});
		if (!errors.isEmpty()) {
			async.parallel({
				plantfamilies: function (callback) {
					PlantFamily.find(callback);
				}
			}, function (err, results) {
				if (err) { return next(err) }
				console.log(results.plantfamilies)
				res.render("plant_form", { title: "Add New Plant", families: results.plantfamilies })
			});
			return
		}
		else {
			plant.save(function (err) {
				if (err) { return next(err) }
				res.redirect(plant.url)
			})
		}

	}
]

exports.plant_delete_get = function (req, res, next) {
	Plant.findById(req.params.id)
		.exec(function (err, plant) {
			if (err) { return next(err); }
			if (plant == null) {
				var err = new Error("Plant not found");
				err.status = 404;
				return next(err);
			}
			res.render("plant_delete", { plant: plant })
		})
}

exports.plant_delete_post = function (req, res, next) {
	Plant.findByIdAndRemove(req.body.plantid, function deletePlant(err) {
		if (err) { return next(err); }
		res.redirect("/plants")
	})
}

exports.plant_update_get = function (req, res, next) {
	async.parallel({
		plant: function (callback) {
			Plant.findById(req.params.id).populate("family")
				.exec(callback);
		},
		plantfamilies: function (callback) {
			PlantFamily.find(callback);
		}
	}, function (err, results) {
		if (err) { return next(err); }
		if (results.plant == null) {
			var err = new Error("Plant not found");
			err.status = 404;
			return next(err);
		}
		res.render("plant_form_update", { title: "Update Plant", plantfamilies: results.plantfamilies, plant: results.plant })
	})
}

exports.plant_update_post = [
	body("name").trim().isLength({ min: 1 }).escape().withMessage("Name must be specified."),
	body("family").trim().isLength({ min: 1 }).escape().withMessage("Family must be specified."),
	body("description").trim().isLength({ min: 1 }).escape().withMessage("Description must not be empty."),

	(req, res, next) => {

		const errors = validationResult(req);
		let indoors;
		if (req.body.indoors === "on") {
			indoors = true
		}
		else { indoors = false }
		if (req.file === undefined) {
			var plant = new Plant(
			{
				name: req.body.name,
				family: req.body.family,
				description: req.body.description,
				amount: req.body.amount,
				indoors: indoors,
				_id: req.params.id
			});
		}
		else {
			var plant = new Plant(
			{
				name: req.body.name,
				family: req.body.family,
				description: req.body.description,
				amount: req.body.amount,
				indoors: indoors,
				_id: req.params.id,
				imageurl: "/uploads/" + req.file.filename
			});
		}
		
		if (!errors.isEmpty()) {
			async.parallel({
				plantfamilies: function (callback) {
					PlantFamily.find(callback);
				}
			}, function (err, results) {

				if (err) { return next(err) }
				res.render("plant_form", { title: "Update Plant", plantfamilies: results.plantfamilies, plant: plant, errors: errors.array() })
			});
			return;
		}
		else {
			Plant.findByIdAndUpdate(req.params.id, plant, {}, function (err, theplant) {
				if (err) { return next(err); }
				res.redirect(theplant.url)
			})
		}
	}
]