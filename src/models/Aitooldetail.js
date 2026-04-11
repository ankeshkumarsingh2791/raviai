const mongoose = require("mongoose");

const aiToolDetailSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
    },
    keyFeatures:
      {
        type: String,
        trim: true,
      },
    pros:
      {
        type: String,
        trim: true,
      },
    cons:
      {
        type: String,
        trim: true,
      },
    toolUsing: {
      type: String,
      trim: true,
    },
    pricing: {
      type: String,
      trim: true,
    },
    disclaimer: {
      type: String,
      trim: true,
    },
    uniqueness: {
      type: String,
      trim: true,
    },
    ourRating: {
      type: String,
      trim: true,
    },
    tryOther: {
      type: String,
      trim: true,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIToolDetail", aiToolDetailSchema);