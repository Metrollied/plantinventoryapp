var Plant = require("../models/plant");
var PlantFamily = require("../models/plantfamily");
const { body, validationResult } = require("express-validator")
var async = require("async");

exports.index = function (req, res) {
	async.parallel({
		randomplant: function (callback) {
			Plant.count().exec(function (err, count) {
				let random = Math.floor(Math.random() * count);
				Plant.findOne().skip(random).exec(callback);
			})

		},
		randomfamily: function (callback) {
			PlantFamily.count().exec(function (err, count) {
				let random = Math.floor(Math.random() * count);
				PlantFamily.findOne().skip(random).exec(callback);
			})

		},

	}, function (err, results) {
		res.render("index", { title: "Plant Inventory", error: err, plant: results.randomplant, family: results.randomfamily })
	})
}
