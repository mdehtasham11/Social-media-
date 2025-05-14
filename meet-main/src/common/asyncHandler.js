exports.asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error("Error:", error);
    res.status(error.code || 500).json({
      success: false,
      message: error.message || "Something went wrong",
      statusCode: error.code || 500
    });
  }
};
