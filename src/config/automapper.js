const mapper = require("../utils/mapper");
const {
	CarCreateDto,
	CarUpdateDto,
	CarResponseDto,
} = require("../dtos/carDtos");

// Configure mappings
mapper
	.createMap(Object, CarCreateDto, {
		// Custom transformations if needed
		price: (src) => parseFloat(src.price),
		year: (src) => parseInt(src.year),
	})
	.createMap(Object, CarUpdateDto)
	.createMap(Object, CarResponseDto, {
		// Custom transformations
		fullName: (src) => `${src.make} ${src.model}`,
		formattedPrice: (src) => `$${src.price.toLocaleString()}`,
	});

module.exports = mapper;
