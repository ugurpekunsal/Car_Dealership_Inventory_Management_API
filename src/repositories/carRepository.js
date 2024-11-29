const BaseRepository = require("./baseRepository");

class CarRepository extends BaseRepository {
	constructor() {
		super(process.env.TABLE_NAME);
	}

	async search(criteria) {
		const items = await this.getAll();
		return items.filter((car) => {
			return Object.entries(criteria).every(([key, value]) => {
				if (typeof value === "string") {
					return car[key]?.toLowerCase().includes(value.toLowerCase());
				}
				return car[key] === value;
			});
		});
	}
}

module.exports = new CarRepository();
