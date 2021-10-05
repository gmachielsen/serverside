const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
      website: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
      photoOfWork: {
          type: String,
          required: false,
      },
},
{ timestamps: true },
);

module.exports = mongoose.model("Application", applicationSchema)