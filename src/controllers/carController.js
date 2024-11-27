const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
	DynamoDBDocumentClient,
	PutCommand,
	GetCommand,
	QueryCommand,
	DeleteCommand,
	UpdateCommand,
	ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

const carController = {
	// Get all cars
	async getAllCars(req, res) {
		try {
			const command = new ScanCommand({
				TableName: TABLE_NAME,
			});

			const response = await docClient.send(command);
			res.json(response.Items);
		} catch (error) {
			console.error("Error fetching cars:", error);
			res.status(500).json({ error: "Failed to fetch cars" });
		}
	},

	// Get car by ID
	async getCarById(req, res) {
		try {
			const command = new GetCommand({
				TableName: TABLE_NAME,
				Key: {
					id: req.params.id,
				},
			});

			const response = await docClient.send(command);

			if (!response.Item) {
				return res.status(404).json({ error: "Car not found" });
			}

			res.json(response.Item);
		} catch (error) {
			console.error("Error fetching car:", error);
			res.status(500).json({ error: "Failed to fetch car" });
		}
	},

	// Create new car
	async createCar(req, res) {
		try {
			const { make, model, year, price } = req.body;
			const carId = `CAR_${Date.now()}`;

			const command = new PutCommand({
				TableName: TABLE_NAME,
				Item: {
					id: carId,
					make,
					model,
					year,
					price,
					status: "available",
					createdAt: new Date().toISOString(),
				},
			});

			await docClient.send(command);
			res.status(201).json({ id: carId, ...req.body, status: "available" });
		} catch (error) {
			console.error("Error creating car:", error);
			res.status(500).json({ error: "Failed to create car" });
		}
	},

	// Update car
	async updateCar(req, res) {
		try {
			const { make, model, year, price, status } = req.body;
			const updateExpression = [];
			const expressionAttributeValues = {};
			const expressionAttributeNames = {};

			if (make) {
				updateExpression.push("#make = :make");
				expressionAttributeValues[":make"] = make;
				expressionAttributeNames["#make"] = "make";
			}
			if (model) {
				updateExpression.push("#model = :model");
				expressionAttributeValues[":model"] = model;
				expressionAttributeNames["#model"] = "model";
			}
			if (year) {
				updateExpression.push("#year = :year");
				expressionAttributeValues[":year"] = year;
				expressionAttributeNames["#year"] = "year";
			}
			if (price) {
				updateExpression.push("#price = :price");
				expressionAttributeValues[":price"] = price;
				expressionAttributeNames["#price"] = "price";
			}
			if (status) {
				updateExpression.push("#status = :status");
				expressionAttributeValues[":status"] = status;
				expressionAttributeNames["#status"] = "status";
			}

			const command = new UpdateCommand({
				TableName: TABLE_NAME,
				Key: { id: req.params.id },
				UpdateExpression: `SET ${updateExpression.join(", ")}`,
				ExpressionAttributeValues: expressionAttributeValues,
				ExpressionAttributeNames: expressionAttributeNames,
				ReturnValues: "ALL_NEW",
			});

			const response = await docClient.send(command);
			res.json(response.Attributes);
		} catch (error) {
			console.error("Error updating car:", error);
			res.status(500).json({ error: "Failed to update car" });
		}
	},

	// Delete car
	async deleteCar(req, res) {
		try {
			const command = new DeleteCommand({
				TableName: TABLE_NAME,
				Key: { id: req.params.id },
			});

			await docClient.send(command);
			res.json({ message: "Car deleted successfully" });
		} catch (error) {
			console.error("Error deleting car:", error);
			res.status(500).json({ error: "Failed to delete car" });
		}
	},

	// Search cars
	async searchCars(req, res) {
		try {
			const { make, model, minPrice, maxPrice, status } = req.query;
			let filterExpression = [];
			let expressionAttributeValues = {};
			let expressionAttributeNames = {};

			if (make) {
				filterExpression.push("#make = :make");
				expressionAttributeValues[":make"] = make;
				expressionAttributeNames["#make"] = "make";
			}
			// Add similar blocks for model, price range, status

			const command = new ScanCommand({
				TableName: TABLE_NAME,
				FilterExpression:
					filterExpression.length > 0
						? filterExpression.join(" AND ")
						: undefined,
				ExpressionAttributeValues:
					Object.keys(expressionAttributeValues).length > 0
						? expressionAttributeValues
						: undefined,
				ExpressionAttributeNames:
					Object.keys(expressionAttributeNames).length > 0
						? expressionAttributeNames
						: undefined,
			});

			const response = await docClient.send(command);
			res.json(response.Items);
		} catch (error) {
			console.error("Error searching cars:", error);
			res.status(500).json({ error: "Failed to search cars" });
		}
	},
};

module.exports = carController;
