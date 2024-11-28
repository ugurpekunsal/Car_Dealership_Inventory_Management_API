document.addEventListener("DOMContentLoaded", () => {
	// Get DOM elements
	const carList = document.getElementById("carList");
	const clientList = document.getElementById("clientList");
	const addCarForm = document.getElementById("addCarForm");
	const addClientForm = document.getElementById("addClientForm");
	const tabButtons = document.querySelectorAll(".tab-btn");
	const tabContents = document.querySelectorAll(".tab-content");

	// Function definitions
	async function loadCars() {
		try {
			const response = await fetch("/car-dealership-api/cars");
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const cars = await response.json();
			displayCars(cars);
		} catch (error) {
			console.error("Error:", error);
			carList.innerHTML = "<p>Error loading cars</p>";
		}
	}

	async function loadClients() {
		try {
			const response = await fetch("/car-dealership-api/clients");
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const clients = await response.json();
			displayClients(clients);
		} catch (error) {
			console.error("Error:", error);
			clientList.innerHTML = "<p>Error loading clients</p>";
		}
	}

	function displayCars(cars) {
		carList.innerHTML = "";
		cars.forEach((car) => {
			const carCard = document.createElement("div");
			carCard.className = "car-card";
			carCard.innerHTML = `
				<h3>${car.make} ${car.model}</h3>
				<p>Year: ${car.year}</p>
				<p>Price: $${car.price.toLocaleString()}</p>
				<p class="status-${car.status?.toLowerCase()}">${car.status || "available"}</p>
				<div class="car-actions">
					${
						car.status === "available"
							? `<button class="status-btn" data-carid="${car.id}">Mark as Sold</button>`
							: `<button class="status-btn" data-carid="${car.id}" data-status="available">Mark as Available</button>`
					}
					<button class="delete-btn" data-carid="${car.id}">Delete</button>
				</div>
		 `;
			carList.appendChild(carCard);
		});

		// Add event listeners to all buttons
		document.querySelectorAll(".status-btn").forEach((button) => {
			button.addEventListener("click", function () {
				const carId = this.dataset.carid;
				const currentStatus = this.dataset.status;

				if (currentStatus === "available") {
					updateCarStatus(carId, "available");
				} else {
					selectedCarId = carId;
					showClientSelectionModal();
				}
			});
		});

		// Add event listeners for delete buttons
		document.querySelectorAll(".delete-btn").forEach((button) => {
			button.addEventListener("click", function () {
				deleteCar(this.dataset.carid);
			});
		});
	}

	function displayClients(clients) {
		clientList.innerHTML = "";
		clients.forEach((client) => {
			const clientCard = document.createElement("div");
			clientCard.className = "client-card";
			clientCard.innerHTML = `
				<h3>${client.name}</h3>
				<p>Email: ${client.email}</p>
				<p>Phone: ${client.phone}</p>
				<p>Address: ${client.address}</p>
				<div class="client-actions">
					<button class="delete-btn" data-clientid="${client.id}">Delete</button>
				</div>
		 `;
			clientList.appendChild(clientCard);
		});

		// Add event listeners to the new buttons
		document
			.querySelectorAll(".client-actions .delete-btn")
			.forEach((button) => {
				button.addEventListener("click", function () {
					deleteClient(this.dataset.clientid);
				});
			});
	}

	// Tab functionality
	tabButtons.forEach((button) => {
		button.addEventListener("click", () => {
			tabButtons.forEach((btn) => btn.classList.remove("active"));
			tabContents.forEach((content) => content.classList.remove("active"));
			button.classList.add("active");
			const tabId = button.dataset.tab;
			document.getElementById(tabId).classList.add("active");
			if (tabId === "sales") {
				loadSales();
			}
		});
	});

	// Form submissions
	addCarForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const carData = {
			make: document.getElementById("make").value,
			model: document.getElementById("model").value,
			year: parseInt(document.getElementById("year").value),
			price: parseFloat(document.getElementById("price").value),
			status: "available",
		};

		try {
			const response = await fetch("/car-dealership-api/cars", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(carData),
			});

			if (response.ok) {
				addCarForm.reset();
				loadCars();
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to add car");
			}
		} catch (error) {
			console.error("Error:", error);
			alert("Failed to add car: " + error.message);
		}
	});

	addClientForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const clientData = {
			name: document.getElementById("clientName").value,
			email: document.getElementById("clientEmail").value,
			phone: document.getElementById("clientPhone").value,
			address: document.getElementById("clientAddress").value,
		};

		try {
			const response = await fetch("/car-dealership-api/clients", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(clientData),
			});

			if (response.ok) {
				addClientForm.reset();
				loadClients();
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to add client");
			}
		} catch (error) {
			console.error("Error:", error);
			alert("Failed to add client: " + error.message);
		}
	});

	// Initial load
	loadCars();
	loadClients();
	if (
		document
			.querySelector('.tab-btn[data-tab="sales"]')
			.classList.contains("active")
	) {
		loadSales();
	}

	// Add this function inside your DOMContentLoaded event listener
	async function updateCarStatus(carId, newStatus, clientId = null) {
		try {
			const updateData = {
				status: newStatus,
			};

			if (clientId) {
				updateData.clientId = clientId;
			}

			const response = await fetch(`/car-dealership-api/cars/${carId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});

			if (response.ok) {
				loadCars();
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update car status");
			}
		} catch (error) {
			console.error("Error:", error);
			alert("Failed to update car status: " + error.message);
		}
	}

	// Also add the delete function if it's missing
	async function deleteCar(carId) {
		if (confirm("Are you sure you want to delete this car?")) {
			try {
				const response = await fetch(`/car-dealership-api/cars/${carId}`, {
					method: "DELETE",
				});

				if (response.ok) {
					loadCars(); // Reload the car list
					updateSalesSelects(); // Update the sales dropdown if it exists
				} else {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to delete car");
				}
			} catch (error) {
				console.error("Error:", error);
				alert("Failed to delete car: " + error.message);
			}
		}
	}

	// And the delete client function
	async function deleteClient(clientId) {
		if (confirm("Are you sure you want to delete this client?")) {
			try {
				const response = await fetch(`/car-dealership-api/clients/${clientId}`, {
					method: "DELETE",
				});

				if (response.ok) {
					loadClients(); // Reload the client list
					updateSalesSelects(); // Update the sales dropdown if it exists
				} else {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to delete client");
				}
			} catch (error) {
				console.error("Error:", error);
				alert("Failed to delete client: " + error.message);
			}
		}
	}

	// Add this function inside your DOMContentLoaded event listener
	async function updateSalesSelects() {
		const carSelect = document.getElementById("carSelect");
		const clientSelect = document.getElementById("clientSelect");

		if (!carSelect || !clientSelect) return; // Guard clause in case elements don't exist

		try {
			// Load available cars
			const carsResponse = await fetch("/car-dealership-api/cars");
			const cars = await carsResponse.json();

			carSelect.innerHTML = '<option value="">Select a Car</option>';
			cars
				.filter((car) => car.status === "available")
				.forEach((car) => {
					carSelect.innerHTML += `
						<option value="${car.id}">${car.year} ${car.make} ${
						car.model
					} - $${car.price.toLocaleString()}</option>
					`;
				});

			// Load all clients
			const clientsResponse = await fetch("/car-dealership-api/clients");
			const clients = await clientsResponse.json();

			clientSelect.innerHTML = '<option value="">Select a Client</option>';
			clients.forEach((client) => {
				clientSelect.innerHTML += `
					<option value="${client.id}">${client.name} - ${client.email}</option>
				`;
			});
		} catch (error) {
			console.error("Error updating select options:", error);
			carSelect.innerHTML = '<option value="">Error loading cars</option>';
			clientSelect.innerHTML =
				'<option value="">Error loading clients</option>';
		}
	}

	// Also add the sales form submission handler
	document
		.getElementById("recordSaleForm")
		?.addEventListener("submit", async (e) => {
			e.preventDefault();

			const carId = document.getElementById("carSelect").value;
			const clientId = document.getElementById("clientSelect").value;

			if (!carId || !clientId) {
				alert("Please select both a car and a client");
				return;
			}

			try {
				// Update car status to sold
				const response = await fetch(`/car-dealership-api/cars/${carId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						status: "sold",
						clientId: clientId, // If you want to track which client bought the car
					}),
				});

				if (response.ok) {
					alert("Sale recorded successfully!");
					document.getElementById("recordSaleForm").reset();
					loadCars();
					updateSalesSelects();
				} else {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to record sale");
				}
			} catch (error) {
				console.error("Error:", error);
				alert("Failed to record sale: " + error.message);
			}
		});

	let selectedCarId = null;
	const modal = document.getElementById("clientSelectionModal");
	const closeBtn = document.querySelector(".close");

	// Update the status button click handler
	document.querySelectorAll(".status-btn").forEach((button) => {
		button.addEventListener("click", function () {
			const newStatus = this.dataset.status;
			if (newStatus === "sold") {
				selectedCarId = this.dataset.carid;
				showClientSelectionModal();
			} else {
				updateCarStatus(this.dataset.carid, newStatus);
			}
		});
	});

	// Add these new functions
	function showClientSelectionModal() {
		modal.style.display = "block";
		loadClientsForModal();
	}

	async function loadClientsForModal() {
		const tbody = document.querySelector("#clientSelectionTable tbody");
		tbody.innerHTML = '<tr><td colspan="4">Loading clients...</td></tr>';

		try {
			const response = await fetch("/car-dealership-api/clients");
			const clients = await response.json();

			tbody.innerHTML = "";
			clients.forEach((client) => {
				const row = document.createElement("tr");
				row.innerHTML = `
					<td>${client.name}</td>
					<td>${client.email}</td>
					<td>${client.phone}</td>
					<td>
						<button class="select-client-btn" data-clientid="${client.id}">Select</button>
					</td>
				`;
				tbody.appendChild(row);
			});

			// Add click handlers for select buttons
			document.querySelectorAll(".select-client-btn").forEach((button) => {
				button.addEventListener("click", function () {
					const clientId = this.dataset.clientid;
					updateCarStatus(selectedCarId, "sold", clientId);
					modal.style.display = "none";
				});
			});
		} catch (error) {
			console.error("Error:", error);
			tbody.innerHTML = '<tr><td colspan="4">Error loading clients</td></tr>';
		}
	}

	// Close modal handlers
	closeBtn.addEventListener("click", () => {
		modal.style.display = "none";
		selectedCarId = null;
	});

	window.addEventListener("click", (event) => {
		if (event.target === modal) {
			modal.style.display = "none";
			selectedCarId = null;
		}
	});

	// Add these functions to your existing code
	async function loadSales() {
		try {
			const response = await fetch("/car-dealership-api/cars");
			const cars = await response.json();
			const soldCars = cars.filter((car) => car.status === "sold");
			displaySales(soldCars);
		} catch (error) {
			console.error("Error:", error);
			document.getElementById("salesList").innerHTML =
				"<p>Error loading sales data</p>";
		}
	}

	function displaySales(soldCars) {
		const salesList = document.getElementById("salesList");
		salesList.innerHTML = "";

		if (soldCars.length === 0) {
			salesList.innerHTML = "<p>No sales records found</p>";
			return;
		}

		soldCars.forEach((car) => {
			const saleCard = document.createElement("div");
			saleCard.className = "sale-card";
			saleCard.innerHTML = `
				<h3>${car.make} ${car.model}</h3>
				<div class="sale-info">
					<p>Year: ${car.year}</p>
					<p>Sale Price: $${car.price.toLocaleString()}</p>
					${car.clientId ? `<p>Client ID: ${car.clientId}</p>` : ""}
					<p class="sale-date">Sold on: ${new Date(
						car.updatedAt || car.createdAt
					).toLocaleDateString()}</p>
				</div>
		 `;
			salesList.appendChild(saleCard);
		});
	}
});
