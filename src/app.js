const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Import routes
const carRoutes = require("./routes/carRoutes");
const clientRoutes = require("./routes/clientRoutes");

// Middleware
app.use(cors());
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", "data:", "https:"],
			},
		},
	})
);
app.use(morgan("dev"));
app.use(express.json());

app.use(express.static("public"));

// Basic health check route
app.get("/health", (req, res) => {
	res.status(200).json({ status: "OK", message: "Server is running" });
});

// Routes
app.use("/api/cars", carRoutes);
app.use("/api/clients", clientRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		error: "Something went wrong!",
		message: process.env.NODE_ENV === "development" ? err.message : undefined,
	});
});

// Handle 404 routes
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`Health check available at http://localhost:${PORT}/health`);
	console.log("DynamoDB Table Name:", process.env.TABLE_NAME);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
	console.error("Unhandled Promise Rejection:", err);
});

module.exports = app;
