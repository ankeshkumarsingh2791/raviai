const ToolSubCategory = require("../models/ToolSubCategory");
const Category = require("../models/Category");
const fs = require("fs");
const path = require("path");

const resolveImageDiskPath = (imageUrlPath) => {
  const relativeImagePath = imageUrlPath.replace(/^\/+/, "");
  return path.join(__dirname, "../../", relativeImagePath);
};

const logEntry = (req, action) => {
  console.log(
    `[REQ ${req.requestId || "n/a"}] Controller ${action} hit params=${JSON.stringify(
      req.params || {}
    )} bodyKeys=${JSON.stringify(Object.keys(req.body || {}))}`
  );
};

// ─── Create SubCategory ────────────────────────────────────────────
const createSubCategory = async (req, res) => {
  try {
    logEntry(req, "createSubCategory");
    const { toolCategory, heading, description } = req.body;

    const userId = req.user?.id;

    // verify parent category exists
    const parentCat = await Category.findById(toolCategory);
    if (!parentCat) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    const subCategory = new ToolSubCategory({
      toolCategory,
      heading,
      description,
      toolSubCategoryImage: req.file
        ? `/files/${userId}/${req.file.filename}`
        : undefined,
    });

    const saved = await subCategory.save();

    // push reference into parent category's subCategory array
    await Category.findByIdAndUpdate(toolCategory, {
      $push: { subCategory: saved._id },
    });

    res.status(201).json({
      success: true,
      message: "Sub category created successfully",
      data: saved,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller createSubCategory failed:`, error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get All SubCategories ─────────────────────────────────────────
const getAllSubCategories = async (req, res) => {
  try {
    logEntry(req, "getAllSubCategories");
    const subCategories = await ToolSubCategory.find()
      .populate("toolCategory", "catName")
      .populate("toolsListing", "toolName toolImage");

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller getAllSubCategories failed:`, error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Single SubCategory ────────────────────────────────────────
const getSubCategoryById = async (req, res) => {
  try {
    logEntry(req, "getSubCategoryById");
    const subCategory = await ToolSubCategory.findById(req.params.id)
      .populate("toolCategory", "catName")
      .populate("toolsListing", "toolName toolImage");

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller getSubCategoryById failed:`, error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get SubCategories by Category ────────────────────────────────
const getSubCategoriesByCategory = async (req, res) => {
  try {
    logEntry(req, "getSubCategoriesByCategory");
    const subCategories = await ToolSubCategory.find({
      toolCategory: req.params.categoryId,
    })
      .populate("toolCategory", "catName")
      .populate("toolsListing", "toolName toolImage");

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller getSubCategoriesByCategory failed:`, error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Update SubCategory ────────────────────────────────────────────
const updateSubCategory = async (req, res) => {
  try {
    logEntry(req, "updateSubCategory");
    const { toolCategory, heading, description, toolSubCategoryImage: existingImage } = req.body;

    const userId = req.user?.id;
    const toolSubCategoryImage = req.file
      ? `/files/${userId}/${req.file.filename}`
      : existingImage;

    // if toolCategory is being changed, update old and new parent refs
    const existing = await ToolSubCategory.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Sub category not found" });
    }

    if (toolCategory && toolCategory !== existing.toolCategory.toString()) {
      // remove from old category
      await Category.findByIdAndUpdate(existing.toolCategory, {
        $pull: { subCategory: existing._id },
      });
      // add to new category
      await Category.findByIdAndUpdate(toolCategory, {
        $push: { subCategory: existing._id },
      });
    }
// delete old image if new one is being uploaded
if (req.file && existing.toolSubCategoryImage) {
  const oldPath = resolveImageDiskPath(existing.toolSubCategoryImage);
  if (fs.existsSync(oldPath)) {
    fs.unlinkSync(oldPath);
  }
}

    const updated = await ToolSubCategory.findByIdAndUpdate(
      req.params.id,
      { toolCategory, heading, description, toolSubCategoryImage },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Sub category updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller updateSubCategory failed:`, error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Delete SubCategory ────────────────────────────────────────────
const deleteSubCategory = async (req, res) => {
  try {
    logEntry(req, "deleteSubCategory");
    const subCategory = await ToolSubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    // delete image from disk if exists
    if (subCategory.toolSubCategoryImage) {
      const imagePath = path.join(__dirname, "../../", subCategory.toolSubCategoryImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // remove reference from parent category
    await Category.findByIdAndUpdate(subCategory.toolCategory, {
      $pull: { subCategory: subCategory._id },
    });

    await ToolSubCategory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Sub category deleted successfully",
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller deleteSubCategory failed:`, error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoriesByCategory,
  updateSubCategory,
  deleteSubCategory,
};
