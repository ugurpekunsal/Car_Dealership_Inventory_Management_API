const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
	DynamoDBDocumentClient,
	PutCommand,
	GetCommand,
	ScanCommand,
	DeleteCommand,
	UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "Clients";

const clientController = {
	// Get all clients
	async getAllClients(req, res) {
		try {
			const command = new ScanCommand({
				TableName: TABLE_NAME,
			});
			const response = await docClient.send(command);
			res.json(response.Items);
		} catch (error) {
			console.error("Error fetching clients:", error);
			res.status(500).json({ error: "Failed to fetch clients" });
		}
	},

	// Get client by ID
	async getClientById(req, res) {
		try {
			const command = new GetCommand({
				TableName: TABLE_NAME,
				Key: {
					id: req.params.id,
				},
			});
			const response = await docClient.send(command);
			if (!response.Item) {
				return res.status(404).json({ error: "Client not found" });
			}
			res.json(response.Item);
		} catch (error) {
			console.error("Error fetching client:", error);
			res.status(500).json({ error: "Failed to fetch client" });
		}
	},

	// Create new client
	async createClient(req, res) {
		try {
			const { name, email, phone, address } = req.body;
			const clientId = `CLIENT_${Date.now()}`;

			const command = new PutCommand({
				TableName: TABLE_NAME,
				Item: {
					id: clientId,
					name,
					email,
					phone,
					address,
					createdAt: new Date().toISOString(),
				},
			});

			await docClient.send(command);
			res.status(201).json({ id: clientId, name, email, phone, address });
		} catch (error) {
			console.error("Error creating client:", error);
			res.status(500).json({ error: "Failed to create client" });
		}
	},

	// Update client
	async updateClient(req, res) {
		try {
			const { name, email, phone, address } = req.body;
			const updateExpression = [];
			const expressionAttributeValues = {};
			const expressionAttributeNames = {};

			if (name) {
				updateExpression.push("#name = :name");
				expressionAttributeValues[":name"] = name;
				expressionAttributeNames["#name"] = "name";
			}
			if (email) {
				updateExpression.push("#email = :email");
				expressionAttributeValues[":email"] = email;
				expressionAttributeNames["#email"] = "email";
			}
			if (phone) {
				updateExpression.push("#phone = :phone");
				expressionAttributeValues[":phone"] = phone;
				expressionAttributeNames["#phone"] = "phone";
			}
			if (address) {
				updateExpression.push("#address = :address");
				expressionAttributeValues[":address"] = address;
				expressionAttributeNames["#address"] = "address";
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
			console.error("Error updating client:", error);
			res.status(500).json({ error: "Failed to update client" });
		}
	},

	// Delete client
	async deleteClient(req, res) {
		try {
			const command = new DeleteCommand({
				TableName: TABLE_NAME,
				Key: { id: req.params.id },
			});

			await docClient.send(command);
			res.json({ message: "Client deleted successfully" });
		} catch (error) {
			console.error("Error deleting client:", error);
			res.status(500).json({ error: "Failed to delete client" });
		}
	},
};

module.exports = clientController;
