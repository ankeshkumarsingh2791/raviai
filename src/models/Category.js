const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    catName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    catImage: {
      type: String,
      trim: true,
    },
    subHeading: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ToolSubCategory",
      },
    ],
    displayAd:{ 
      type: String, 
      trim: true 
    }, // category-level banner ad image
    adUrl:{ 
      type: String, 
      trim: true 
    }, // category banner ad link
    displayAdSidebar: { 
      type: String, 
      trim: true 
    }, // category-level sidebar ad image
    sidebarAdUrl:{ 
      type: String, 
      trim: true 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);