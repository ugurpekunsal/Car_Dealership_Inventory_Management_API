const express = require("express");
const router = express.Router();
const {
	getAllCars,
	getCarById,
	createCar,
	updateCar,
	deleteCar,
	searchCars,
	patchCar,
} = require("../controllers/carController");
const apiKeyAuth = require("../middleware/apiKeyAuth");

// Apply to all routes
router.use(apiKeyAuth);

router.get("/", getAllCars);

router.get("/:id", getCarById);

router.post("/", createCar);

router.put("/:id", updateCar);

router.delete("/:id", deleteCar);

router.get("/search", searchCars);

router.patch("/:id", patchCar);

module.exports = router;
