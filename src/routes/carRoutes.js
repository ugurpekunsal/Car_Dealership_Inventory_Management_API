const express = require("express");
const router = express.Router();
const {
	getAllCars,
	getCarById,
	createCar,
	updateCar,
	deleteCar,
	searchCars,
} = require("../controllers/carController");

// Get all cars with optional search/filter
router.get("/search", searchCars);
router.get("/", getAllCars);
router.get("/:id", getCarById);
router.post("/", createCar);
router.put("/:id", updateCar);
router.delete("/:id", deleteCar);

module.exports = router;
