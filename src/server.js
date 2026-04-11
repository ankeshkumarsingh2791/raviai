if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("./models/Index");


app.use(cors({
  origin: true,          // allows file:// and any localhost origin
  credentials: true,     // required for auth cookies to be sent
}));

const toolSubCategoryRoutes = require("./routes/toolSubCategoryRoutes");
const categoryRoutes = require("./routes/Categoryroutes");
const authRoutes = require("./routes/Authroutes");
const aiToolRoutes = require("./routes/aiToolRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// app.use("/files", express.static("/app/files"));
app.use("/files", express.static(path.join(__dirname, "../files")));
app.use(express.json());
app.use(cookieParser());

app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/api/auth", authRoutes);
app.use("/api/subcategories", toolSubCategoryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tools", aiToolRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "your server is up and running",
  });
});

app.use((req, res) => {
  console.log(
    `[REQ ${req.requestId || "n/a"}] No route matched for ${req.method} ${req.originalUrl}`
  );
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, _next) => {
  console.error(
    `[REQ ${req.requestId || "n/a"}] Unhandled error on ${req.method} ${req.originalUrl}:`,
    err
  );
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(); // wait for DB first
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
