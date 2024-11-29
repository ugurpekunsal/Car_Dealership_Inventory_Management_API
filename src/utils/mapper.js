class Mapper {
	constructor() {
		this.mappings = new Map();
	}

	// Define mapping configuration
	createMap(sourceType, destinationType, customMapping = {}) {
		const key = `${sourceType.name}_${destinationType.name}`;
		this.mappings.set(key, customMapping);
		return this;
	}

	// Map a single object
	map(source, sourceType, destinationType) {
		const key = `${sourceType.name}_${destinationType.name}`;
		const mapping = this.mappings.get(key);

		const destination = new destinationType();

		// Apply default mapping (matching property names)
		Object.keys(destination).forEach((key) => {
			if (source.hasOwnProperty(key)) {
				destination[key] = source[key];
			}
		});

		// Apply custom mapping if defined
		if (mapping) {
			Object.keys(mapping).forEach((destKey) => {
				const transform = mapping[destKey];
				destination[destKey] = transform(source);
			});
		}

		return destination;
	}

	// Map an array of objects
	mapArray(sourceArray, sourceType, destinationType) {
		return sourceArray.map((item) =>
			this.map(item, sourceType, destinationType)
		);
	}
}

module.exports = new Mapper();
