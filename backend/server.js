const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const workspaceRoutes = require("./src/routes/workspace.routes");
const assetRoutes = require("./src/routes/asset.routes");
const subscriptionRoutes = require("./src/routes/subscription.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const notificationRoutes = require("./src/routes/notification.routes");
const errorHandler = require("./src/middleware/error.middleware");
dotenv.config();
connectDB();

require("./src/jobs/notification.job");
const app = express();


// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/workspace",workspaceRoutes);
app.use("/api/assets",assetRoutes);
app.use("/api/subscriptions",subscriptionRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/notifications",notificationRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("AssetGuard Backend Running 🚀");
});

app.use(errorHandler);

// Server Start
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});