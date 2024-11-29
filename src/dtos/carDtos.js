class CarCreateDto {
	constructor() {
		this.make = "";
		this.model = "";
		this.year = 0;
		this.price = 0;
		this.status = "available";
	}
}

class CarUpdateDto {
	constructor() {
		this.make = undefined;
		this.model = undefined;
		this.year = undefined;
		this.price = undefined;
		this.status = undefined;
	}
}

class CarResponseDto {
	constructor() {
		this.id = "";
		this.make = "";
		this.model = "";
		this.year = 0;
		this.price = 0;
		this.status = "";
		this.createdAt = "";
		this.updatedAt = "";
	}
}

module.exports = {
	CarCreateDto,
	CarUpdateDto,
	CarResponseDto,
};
