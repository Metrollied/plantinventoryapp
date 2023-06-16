var PlantFamily = require("../models/plantfamily");
var async = require("async");
var Plant = require("../models/plant")
const { body, validationResult } = require("express-validator");

exports.plantfamily_list = function (req, res, next) {
	PlantFamily.find()
		.sort([["name", "ascending"]])
		.exec(function (err, list_plantfamilies) {
			if (err) { return next(err); }
			res.render("plantfamilies_list", { title: "Plant Families", plantfamily_list: list_plantfamilies })
		})
}

exports.plantfamily_detail = function (req, res, next) {

	async.parallel({
		plantfamily: function (callback) {
			PlantFamily.findById(req.params.id)
				.exec(callback)
		},
		plantfamily_plants: function (callback) {
			Plant.find({ "family": req.params.id }, "name amount imageurl")
				.exec(callback)
		}
	}, function (err, results) {
		if (err) { return next(err); }
		if (results.plantfamily == null) {
			var err = new Error("Plant family not found");
			err.status = 404;
			return next(err);
		}
		res.render("plantfamily_detail", { title: "Plant Family Detail", plantfamily: results.plantfamily, plantfamily_plants: results.plantfamily_plants });
	}
	)
}

exports.plantfamily_create_get = function (req, res, next) {
	res.render("plantfamily_form", { title: "Add New Plant Family" })
}

exports.plantfamily_create_post = [
	body("name").trim().isLength({ min: 1 }).escape().withMessage("Name must be specified.")
		.isAlphanumeric().withMessage("Name should only have alphanumeric characters."),
	body("description").trim().isLength({ min: 1 }).escape().withMessage("Description must not be empty."),
	(req, res, next) => {
		
		var plantfamily = new PlantFamily(
			{
				name: req.body.name,
				description: req.body.description,
				imageurl: "/uploads/" + req.file.filename
			});
		plantfamily.save(function (err) {
			if (err) { return next(err); }
			res.redirect(plantfamily.url)
		})
	}
]

exports.plantfamily_delete_get = function (req, res, next) {

	async.parallel({
		family: function (callback) {
			PlantFamily.findById(req.params.id).exec(callback)
		},
		plantfamily_plants: function (callback) {
			Plant.find({ "family": req.params.id }).exec(callback)
		}
	}, function (err, results) {
		if (err) { return next(err); }
		if (results.family == null) {
			res.redirect("/plantfamilies/");
		}
		res.render("plantfamily_delete", { family: results.family, plantfamily_plants: results.plantfamily_plants })
	})
}

exports.plantfamily_delete_post = function (req, res, next) {

	async.parallel({
		family: function (callback) {
			PlantFamily.findById(req.body.plantfamilyid).exec(callback)
		},
		plantfamily_plants: function (callback) {
			Plant.find({ "family": req.body.plantid }).exec(callback)
		}
	}, function (err, results) {
		if (err) { return next(err); }

		if (results.plantfamily_plants.length > 0) {
			res.render("plantfamily_delete", { family: results.family, plantfamily_plants: results.plantfamily_plants })
			return;
		}
		else {
			PlantFamily.findByIdAndRemove(req.body.familyid, function deletePlantFamily(err) {
				if (err) { return next(err); }
				res.redirect("/plantfamilies")
			})
		}
	})
}

exports.plantfamily_update_get = function (req, res, next) {

	PlantFamily.findById(req.params.id)
		.exec(function (err, plantfamily) {
			if (err) { return next(err); }
			if (plantfamily == null) {
				var err = new Error("Plant Family not found.");
				err.status = 404;
				return next(err);
			}
			res.render("plantfamily_form", { title: "Update " + plantfamily.name, plantfamily: plantfamily })
		})
}

exports.plantfamily_update_post = [
	body("name").trim().isLength({ min: 1 }).escape().withMessage("Name must be specified.")
		.isAlphanumeric().withMessage("Name should only have alphanumeric characters."),
	body("description").trim().isLength({ min: 1 }).escape().withMessage("Description must not be empty."),

	(req, res, next) => {
		const errors = validationResult(req);
		if (req.file === undefined) {
			var plantfamily = new PlantFamily({
			name: req.body.name,
			description: req.body.description,
			_id: req.params.id
		})
		}
		else {
		var plantfamily = new PlantFamily({
			name: req.body.name,
			description: req.body.description,
			imageurl: "/uploads/" + req.file.filename,
			_id: req.params.id
		})}
		if (!errors.isEmpty()) {
			(err, results) => {
				if (err) { return next(err) }
				res.render("plantfamily_form", { title: "Update " + plantfamily.name, plantfamily: plantfamily })
			}
			return;
		}
		else {
			PlantFamily.findByIdAndUpdate(req.params.id, plantfamily, {}, function (err, theplantfamily) {
				if (err) { return next(err) }
				res.redirect(theplantfamily.url)
			})
		}
	}
]