var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PlantFamilySchema = new Schema(
	{
		name: {type: String, required: true, maxlength: 100},
		description: {type: String, required: true},
		imageurl: {type: String, required: false}
	}
)

PlantFamilySchema
.virtual("url")
.get(function () {
	return "/plantfamilies/" + this._id;
})

module.exports = mongoose.model("PlantFamily", PlantFamilySchema)