const AITool = require("../models/Aitool");
const AIToolDetail = require("../models/Aitooldetail");
const Category = require("../models/Category");
const ToolSubCategory = require("../models/ToolSubCategory");
const fs = require("fs");
const path = require("path");

// const { deleteImageFromDisk } = require("../utils/fileHelper");

const logEntry = (req, action) => {
  console.log(
    `[REQ ${req.requestId || "n/a"}] Controller ${action} hit params=${JSON.stringify(
      req.params || {}
    )} bodyKeys=${JSON.stringify(Object.keys(req.body || {}))}`
  );
};

const resolveImageDiskPath = (imageUrlPath) =>
  path.join(__dirname, "../../", imageUrlPath.replace(/^\/+/, ""));

const validateToolRelations = async (toolCategory, toolSubCategory) => {
  const category = await Category.findById(toolCategory);
  if (!category) {
    return { error: "Category not found" };
  }

  const subCategory = await ToolSubCategory.findById(toolSubCategory);
  if (!subCategory) {
    return { error: "Subcategory not found" };
  }

  if (subCategory.toolCategory.toString() !== toolCategory.toString()) {
    return { error: "Subcategory does not belong to the selected category" };
  }

  return { category, subCategory };
};

// ─── Create AI Tool ────────────────────────────────────────────────
const createTool = async (req, res) => {
  try {
    logEntry(req, "createTool");
    const userId = req.user?.id;
    const {
      toolName,
      toolUrl,
      heading,
      youtubeUrl,
      pricingModel,
      rating,
      toolCategory,
      toolSubCategory,
      verified,
      // displayAd,  // ← add
      adUrl,      // ← add 
      sidebarAdUrl, // ← add
    } = req.body;

    // handle arrays sent as "hashtags[]" from FormData
    const hashtags = [].concat(req.body["hashtags[]"] || req.body.hashtags || []);
    const aiCategories = [].concat(req.body["aiCategories[]"] || req.body.aiCategories || []);

    const { error } = await validateToolRelations(toolCategory, toolSubCategory);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    // ✅ replace with
const toolImageFile = req.files?.["toolImage"]?.[0];
const adImageFile   = req.files?.["displayAd"]?.[0];
const sidebarAdImageFile = req.files?.["displayAdSidebar"]?.[0];


const toolImage  = toolImageFile ? `/files/${userId}/${toolImageFile.filename}` : undefined;
const newDisplayAd = adImageFile  ? `/files/${userId}/${adImageFile.filename}`  : undefined;
const displayAdSidebar = sidebarAdImageFile ? `/files/${userId}/${sidebarAdImageFile.filename}` : undefined;

    const tool = new AITool({
      toolName,
      toolUrl,
      heading,
      youtubeUrl,
      pricingModel,
      rating: rating || 0,
      hashtags,
      aiCategories,
      toolImage,
      toolCategory,
      toolSubCategory,
      verified :verified ?? false,
      displayAd: newDisplayAd,
      adUrl,      // ← add  
      displayAdSidebar: displayAdSidebar, // ← add  
      sidebarAdUrl,     // ← add    
    });

    const saved = await tool.save();

    await ToolSubCategory.findByIdAndUpdate(toolSubCategory, {
      $addToSet: { toolsListing: saved._id },
    });

    res.status(201).json({
      success: true,
      message: "AI Tool created successfully",
      data: saved,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller createTool failed:`, error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get All Tools ─────────────────────────────────────────────────
const getAllTools = async (req, res) => {
  try {
    logEntry(req, "getAllTools");
    const tools = await AITool.find()
      .populate("toolCategory", "catName")
      .populate("toolSubCategory", "heading toolCategory")
      .populate("aiToolDetail")
      .populate("reviews");

    res.status(200).json({
      success: true,
      count: tools.length,
      data: tools,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller getAllTools failed:`, error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Single Tool ───────────────────────────────────────────────
const getToolById = async (req, res) => {
  try {
    logEntry(req, "getToolById");
    const tool = await AITool.findById(req.params.id)
      .populate("toolCategory", "catName")
      .populate("toolSubCategory", "heading toolCategory")
      .populate("aiToolDetail")
      .populate("reviews");

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "AI Tool not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tool,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller getToolById failed:`, error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Tools by SubCategory ──────────────────────────────────────
const getToolsBySubCategory = async (req, res) => {
  try {
    logEntry(req, "getToolsBySubCategory");
// console.log("Searching for subCategoryId:", req.params.subCatId);
    const tools = await AITool.find({ toolSubCategory: req.params.subCatId })
      .populate("toolCategory", "catName")
      .populate("toolSubCategory", "heading")
      .populate("aiToolDetail");
// console.log("Found tools count:", tools.length);

    res.status(200).json({
      success: true,
      count: tools.length,
      data: tools,
    });
  } catch (error) {
    console.error(`getToolsBySubCategory failed:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update AI Tool ────────────────────────────────────────────────
const updateTool = async (req, res) => {
  try {
    logEntry(req, "updateTool");
    const userId = req.user?.id;
    const {
      toolName,
      toolUrl,
      heading,
      youtubeUrl,
      pricingModel,
      rating,
      toolImage: existingImage,
      toolCategory,
      toolSubCategory,
      verified,
      // displayAd,  // ← add
      adUrl,      // ← add  
      sidebarAdUrl, // ← add      
    } = req.body;

    const hashtags = [].concat(req.body["hashtags[]"] || req.body.hashtags || []);
    const aiCategories = [].concat(req.body["aiCategories[]"] || req.body.aiCategories || []);

    const existing = await AITool.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "AI Tool not found",
      });
    }

    const nextToolCategory = toolCategory || existing.toolCategory?.toString();
    const nextToolSubCategory = toolSubCategory || existing.toolSubCategory?.toString();

    const { error } = await validateToolRelations(nextToolCategory, nextToolSubCategory);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    // delete old image if new one uploaded
    if (req.files?.["toolImage"]?.[0] && existing.toolImage) {
      const oldPath = resolveImageDiskPath(existing.toolImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    // ← add this block after
    if (req.files?.["displayAd"]?.[0] && existing.displayAd) {
      const oldAdPath = resolveImageDiskPath(existing.displayAd);
      if (fs.existsSync(oldAdPath)) fs.unlinkSync(oldAdPath);
    }

    if (req.files?.["displayAdSidebar"]?.[0] && existing.displayAdSidebar) {
      const oldSidebarAdPath = resolveImageDiskPath(existing.displayAdSidebar);
      if (fs.existsSync(oldSidebarAdPath)) fs.unlinkSync(oldSidebarAdPath);
    }

    
    const toolImageFile = req.files?.["toolImage"]?.[0];
    const adImageFile   = req.files?.["displayAd"]?.[0];
    const sidebarAdImageFile = req.files?.["displayAdSidebar"]?.[   0];

    const toolImage = toolImageFile   
      ? `/files/${userId}/${toolImageFile.filename}`    
      : existingImage;    

    const newDisplayAd = adImageFile    
      ? `/files/${userId}/${adImageFile.filename}`    
      : existing.displayAd;   

    const displayAdSidebar = sidebarAdImageFile ? `/files/${userId}/${sidebarAdImageFile.filename}` :  existing.displayAdSidebar;


    const updated = await AITool.findByIdAndUpdate(
      req.params.id,
      {
        toolName,
        toolUrl,
        heading,
        youtubeUrl,
        pricingModel,
        rating: rating || 0,
        hashtags,
        aiCategories,
        toolImage,
        toolCategory: nextToolCategory,
        toolSubCategory: nextToolSubCategory,
        verified: verified ?? existing.verified, // ✅ added
        displayAd: newDisplayAd,  // ← add
        adUrl,      // ← add   
        sidebarAdUrl,
        displayAdSidebar:  displayAdSidebar,     
      },
      { new: true, runValidators: true }
    );

    if (
      existing.toolSubCategory &&
      existing.toolSubCategory.toString() !== nextToolSubCategory
    ) {
      await ToolSubCategory.findByIdAndUpdate(existing.toolSubCategory, {
        $pull: { toolsListing: existing._id },
      });
    }

    await ToolSubCategory.findByIdAndUpdate(nextToolSubCategory, {
      $addToSet: { toolsListing: existing._id },
    });

    res.status(200).json({
      success: true,
      message: "AI Tool updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller updateTool failed:`, error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Delete AI Tool ────────────────────────────────────────────────
const deleteTool = async (req, res) => {
  try {
    logEntry(req, "deleteTool");
    const tool = await AITool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "AI Tool not found",
      });
    }

    // delete image from disk
    if (tool.toolImage) {
      const imagePath = resolveImageDiskPath(tool.toolImage);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    if (tool.displayAd) {
      const adPath = resolveImageDiskPath(tool.displayAd);
      if (fs.existsSync(adPath)) fs.unlinkSync(adPath);
    }

    // delete linked AIToolDetail if exists
    if (tool.aiToolDetail) {
      await AIToolDetail.findByIdAndDelete(tool.aiToolDetail);
    }

    if (tool.toolSubCategory) {
      await ToolSubCategory.findByIdAndUpdate(tool.toolSubCategory, {
        $pull: { toolsListing: tool._id },
      });
    }

    await AITool.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "AI Tool deleted successfully",
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller deleteTool failed:`, error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/tools/:id/ads
const getToolAds = async (req, res) => {
  const tool = await AITool.findById(req.params.id)
    .populate("toolCategory");

  const category = tool.toolCategory;

  res.status(200).json({
    success: true,
    data: {
      // banner ad — tool first, fallback to category
      displayAd: tool.displayAd         || category?.displayAd         || null,
      adUrl:     tool.adUrl             || category?.adUrl             || null,

      // sidebar ad — tool first, fallback to category
      displayAdSidebar: tool.displayAdSidebar || category?.displayAdSidebar || null,
      sidebarAdUrl:     tool.sidebarAdUrl     || category?.sidebarAdUrl     || null,
    }
  });
};

// ─── Get Similar Tools by Category ────────────────────────────────
const getSimilarTools = async (req, res) => {
  try {
    logEntry(req, "getSimilarTools");

    const tool = await AITool.findById(req.params.id).select("toolCategory");
    if (!tool) {
      return res.status(404).json({ success: false, message: "Tool not found" });
    }

    const similarTools = await AITool.find({
      toolCategory: tool.toolCategory,
      _id: { $ne: req.params.id }, // exclude the current tool
    })
      .populate("toolCategory", "catName")
      .populate("toolSubCategory", "heading")
      .limit(10)
      .sort({ rating: -1 }); // highest rated first

    res.status(200).json({
      success: true,
      count: similarTools.length,
      data: similarTools,
    });
  } catch (error) {
    console.error(`getSimilarTools failed:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  createTool,
  getAllTools,
  getToolById,
  getToolAds,
  updateTool,
  deleteTool,
  getSimilarTools,
  getToolsBySubCategory,
};


