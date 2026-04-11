const AIToolDetail = require("../models/Aitooldetail");
const AITool = require("../models/Aitool");

const logEntry = (req, action) => {
  console.log(
    `[REQ ${req.requestId || "n/a"}] Controller ${action} hit params=${JSON.stringify(
      req.params || {}
    )} bodyKeys=${JSON.stringify(Object.keys(req.body || {}))}`
  );
};

// ─── Create Tool Detail ────────────────────────────────────────────
// called from step 2 of the tool form with toolId in body
const createToolDetail = async (req, res) => {
  try {
    logEntry(req, "createToolDetail");
    const {
      toolId,
      description,
      keyFeatures,
      pros,
      cons,
      toolUsing,
      pricing,
      disclaimer,
      uniqueness,
      ourRating,
      tryOther,
    } = req.body;

    if (!toolId) {
      return res.status(400).json({
        success: false,
        message: "toolId is required to link detail to a tool",
      });
    }

    // verify tool exists
    const tool = await AITool.findById(toolId);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "AI Tool not found",
      });
    }

    // if tool already has a detail, update it instead of creating new
    if (tool.aiToolDetail) {
      const updated = await AIToolDetail.findByIdAndUpdate(
        tool.aiToolDetail,
        {
          description,
          keyFeatures: keyFeatures || "",
          pros: pros || "",
          cons: cons || "",
          toolUsing,
          pricing,
          disclaimer,
          uniqueness,
          ourRating,
          tryOther,
        },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: "Tool detail updated successfully",
        data: updated,
      });
    }

    // create new detail
    const detail = await AIToolDetail.create({
      description,
      keyFeatures: keyFeatures || "",
      pros: pros || "",
      cons: cons || "",
      toolUsing,
      pricing,
      disclaimer,
      uniqueness,
      ourRating,
      tryOther,
    });

    // link detail back to tool
    await AITool.findByIdAndUpdate(toolId, {
      aiToolDetail: detail._id,
    });

    res.status(201).json({
      success: true,
      message: "Tool detail created successfully",
      data: detail,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller createToolDetail failed:`, error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Tool Detail by ID ─────────────────────────────────────────
const getToolDetailById = async (req, res) => {
  try {
    logEntry(req, "getToolDetailById");
    const detail = await AIToolDetail.findById(req.params.id);

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Tool detail not found",
      });
    }

    res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller getToolDetailById failed:`, error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Update Tool Detail ────────────────────────────────────────────
const updateToolDetail = async (req, res) => {
  try {
    logEntry(req, "updateToolDetail");
    const {
      description,
      keyFeatures,
      pros,
      cons,
      toolUsing,
      pricing,
      disclaimer,
      uniqueness,
      ourRating,
      tryOther,
    } = req.body;

    const updated = await AIToolDetail.findByIdAndUpdate(
      req.params.id,
      {
        description,
        keyFeatures: keyFeatures || "",
        pros: pros || "",
        cons: cons || "",
        toolUsing,
        pricing,
        disclaimer,
        uniqueness,
        ourRating,
        tryOther,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Tool detail not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tool detail updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller updateToolDetail failed:`, error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Delete Tool Detail ────────────────────────────────────────────
const deleteToolDetail = async (req, res) => {
  try {
    logEntry(req, "deleteToolDetail");
    const detail = await AIToolDetail.findByIdAndDelete(req.params.id);

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Tool detail not found",
      });
    }

    // remove reference from parent tool
    await AITool.findOneAndUpdate(
      { aiToolDetail: req.params.id },
      { $unset: { aiToolDetail: "" } }
    );

    res.status(200).json({
      success: true,
      message: "Tool detail deleted successfully",
    });
  } catch (error) {
    console.error(`[REQ ${req.requestId || "n/a"}] Controller deleteToolDetail failed:`, error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createToolDetail,
  getToolDetailById,
  updateToolDetail,
  deleteToolDetail,
};