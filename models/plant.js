const { type } = require("express/lib/response");
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PlantSchema = new Schema(
	{
		name: {type: String, required: true, maxlength: 100},
		description: {type: String, required: true},
		family: {type: Schema.Types.ObjectId, ref: "PlantFamily"},
		amount: {type: Number},
		indoors: {type: Boolean},
		imageurl: {type: String, required: true}

	}
);

PlantSchema
.virtual("url")
.get(function() {
	return "/plants/" + this._id
});

module.exports = mongoose.model("plant", PlantSchema)