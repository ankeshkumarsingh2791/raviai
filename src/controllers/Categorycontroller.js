const Category = require("../models/Category");
const fs = require("fs");
const path = require("path");

const resolveImageDiskPath = (imageUrlPath) =>
  path.join(__dirname, "../../", imageUrlPath.replace(/^\/+/, ""));

const logEntry = (req, action) => {
  console.log(
    `[REQ ${req.requestId || "n/a"}] Controller ${action} hit params=${JSON.stringify(
      req.params || {}
    )} bodyKeys=${JSON.stringify(Object.keys(req.body || {}))}`
  );
};

// ─── Create Category ───────────────────────────────────────────────
const createCategory = async (req, res) => {
  try {
    logEntry(req, "createCategory");
    const { catName, subHeading, description } = req.body;

    const userId = req.user?.id;

// in controller
const catImageFile       = req.files?.["catImage"]?.[0];
const adImageFile        = req.files?.["displayAd"]?.[0];
const sidebarAdImageFile = req.files?.["displayAdSidebar"]?.[0];


    // ✅ replace with
    const catImage         = catImageFile       ? `/files/${userId}/${catImageFile.filename}`       : undefined;
    const displayAd        = adImageFile        ? `/files/${userId}/${adImageFile.filename}`        : undefined;
    const displayAdSidebar = sidebarAdImageFile ? `/files/${userId}/${sidebarAdImageFile.filename}` : undefined;

    const category = new Category({
      catName,
      catImage,
      subHeading,
      description,
      displayAd,
      adUrl:            req.body.adUrl,
      displayAdSidebar,
      sidebarAdUrl:     req.body.sidebarAdUrl,
    });

    const saved = await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: saved,
    });
  } catch (error) {
    console.error(
      `[REQ ${req.requestId || "n/a"}] Controller createCategory failed:`,
      error
    );
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get All Categories ────────────────────────────────────────────
const getAllCategories = async (req, res) => {
  try {
    logEntry(req, "getAllCategories");
    const categories = await Category.find().populate("subCategory");

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error(
      `[REQ ${req.requestId || "n/a"}] Controller getAllCategories failed:`,
      error
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Single Category ───────────────────────────────────────────
const getCategoryById = async (req, res) => {
  try {
    logEntry(req, "getCategoryById");
    const category = await Category.findById(req.params.id).populate(
      "subCategory"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(
      `[REQ ${req.requestId || "n/a"}] Controller getCategoryById failed:`,
      error
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Update Category ───────────────────────────────────────────────
const updateCategory = async (req, res) => {
  try {
    logEntry(req, "updateCategory");
    const { catName, subHeading, description } = req.body;

    const existing = await Category.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const userId = req.user?.id;
    const catImageFile       = req.files?.["catImage"]?.[0];
const adImageFile        = req.files?.["displayAd"]?.[0];
const sidebarAdImageFile = req.files?.["displayAdSidebar"]?.[0];

// delete old images if new ones uploaded
if (catImageFile && existing.catImage) {
  const oldPath = resolveImageDiskPath(existing.catImage);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
}
if (adImageFile && existing.displayAd) {
  const oldPath = resolveImageDiskPath(existing.displayAd);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
}
if (sidebarAdImageFile && existing.displayAdSidebar) {
  const oldPath = resolveImageDiskPath(existing.displayAdSidebar);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
}

const catImage         = catImageFile       ? `/files/${userId}/${catImageFile.filename}`       : existing.catImage;
const displayAd        = adImageFile        ? `/files/${userId}/${adImageFile.filename}`        : existing.displayAd;
const displayAdSidebar = sidebarAdImageFile ? `/files/${userId}/${sidebarAdImageFile.filename}` : existing.displayAdSidebar;

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        catName,
        catImage,
        subHeading,
        description,
        displayAd,
        adUrl:            req.body.adUrl,
        displayAdSidebar,
        sidebarAdUrl:     req.body.sidebarAdUrl,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(
      `[REQ ${req.requestId || "n/a"}] Controller updateCategory failed:`,
      error
    );
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Delete Category ───────────────────────────────────────────────
const deleteCategory = async (req, res) => {
  try {
    logEntry(req, "deleteCategory");
    // ✅ replace with
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // delete all images from disk
    if (category.catImage)         { const p = resolveImageDiskPath(category.catImage);         if (fs.existsSync(p)) fs.unlinkSync(p); }
    if (category.displayAd)        { const p = resolveImageDiskPath(category.displayAd);        if (fs.existsSync(p)) fs.unlinkSync(p); }
    if (category.displayAdSidebar) { const p = resolveImageDiskPath(category.displayAdSidebar); if (fs.existsSync(p)) fs.unlinkSync(p); }

    await Category.findByIdAndDelete(req.params.id);


    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      `[REQ ${req.requestId || "n/a"}] Controller deleteCategory failed:`,
      error
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
