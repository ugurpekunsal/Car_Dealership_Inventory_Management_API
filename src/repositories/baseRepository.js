const docClient = require("../config/dynamodb");
const {
	GetCommand,
	PutCommand,
	DeleteCommand,
	ScanCommand,
	UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

class BaseRepository {
	constructor(tableName) {
		this.tableName = tableName;
	}

	async getAll() {
		const command = new ScanCommand({
			TableName: this.tableName,
		});
		const response = await docClient.send(command);
		return response.Items;
	}

	async getById(id) {
		const command = new GetCommand({
			TableName: this.tableName,
			Key: { id },
		});
		const response = await docClient.send(command);
		return response.Item;
	}

	async create(item) {
		const command = new PutCommand({
			TableName: this.tableName,
			Item: {
				...item,
				createdAt: new Date().toISOString(),
			},
		});
		await docClient.send(command);
		return item;
	}

	async update(id, updates) {
		const updateExpression = [];
		const expressionAttributeValues = {};
		const expressionAttributeNames = {};

		Object.entries(updates).forEach(([key, value]) => {
			updateExpression.push(`#${key} = :${key}`);
			expressionAttributeValues[`:${key}`] = value;
			expressionAttributeNames[`#${key}`] = key;
		});

		const command = new UpdateCommand({
			TableName: this.tableName,
			Key: { id },
			UpdateExpression: `SET ${updateExpression.join(", ")}`,
			ExpressionAttributeValues: expressionAttributeValues,
			ExpressionAttributeNames: expressionAttributeNames,
			ReturnValues: "ALL_NEW",
		});

		const response = await docClient.send(command);
		return response.Attributes;
	}

	async delete(id) {
		const command = new DeleteCommand({
			TableName: this.tableName,
			Key: { id },
		});
		await docClient.send(command);
	}
}

module.exports = BaseRepository;
