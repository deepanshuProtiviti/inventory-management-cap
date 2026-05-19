sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/GenericTile",
	"sap/m/TileContent",
	"sap/m/NumericContent"
], function (Controller, JSONModel, MessageBox, GenericTile, TileContent, NumericContent) {
	"use strict";

	return Controller.extend("inventory.ui.dashboardui.controller.Dashboard", {
		onInit: function () {
			console.log("Dashboard.onInit() called");
			const oComponent = this.getOwnerComponent();

			// Create a products model for the view
			const oProductsModel = new JSONModel({
				products: []
			});
			this.getView().setModel(oProductsModel, "products");
			console.log("Products model set");

			// Get the view model for busy state
			const oViewModel = oComponent.getModel("view");
			this.getView().setModel(oViewModel, "view");
			console.log("View model set");

			// Load products data
			this.loadProducts();
		},

		loadProducts: function () {
			const oView = this.getView();
			const oViewModel = oView.getModel("view");

			console.log("loadProducts() called");
			oViewModel.setProperty("/busy", true);

			// Use fetch to call OData service
			fetch("/service/InventoryService/Products")
				.then(response => {
					console.log("Fetch response received, status:", response.status);
					if (!response.ok) {
						throw new Error("HTTP error, status = " + response.status);
					}
					return response.json();
				})
				.then(oData => {
					console.log("Products data received:", oData);
					const aProducts = oData.value || [];
					console.log("Number of products:", aProducts.length);
					const oProductsModel = oView.getModel("products");
					oProductsModel.setProperty("/products", aProducts);
					oViewModel.setProperty("/busy", false);

					// Bind the grid container items to products
					this._bindGridItems(aProducts);
				})
				.catch(error => {
					console.error("Error loading products:", error);
					oViewModel.setProperty("/busy", false);
					MessageBox.error("Failed to load products: " + error.message);
				});
		},

		_bindGridItems: function (aProducts) {
			const oGrid = this.getView().byId("gridContainer");
			console.log("_bindGridItems called with", aProducts.length, "products");
			console.log("Grid container found:", !!oGrid);

			if (!oGrid) {
				console.error("Grid container not found!");
				return;
			}

			// Clear existing items
			oGrid.destroyItems();

			// Store products for later use
			this._aProducts = aProducts;

			// Create a summary tile showing total products
			const oSummaryNumericContent = new NumericContent({
				value: aProducts.length,
				valueColor: "Neutral",
				icon: "sap-icon://inventory",
				withMargin: false,
				state: "Loaded"
			});

			const oSummaryTileContent = new TileContent({
				unit: "Products",
				content: oSummaryNumericContent
			});

			const oSummaryTile = new GenericTile({
				header: "Total Inventory",
				subheader: "Available Products",
				tileContent: [oSummaryTileContent],
				press: this._onSummaryTilePress.bind(this)
			});
			oSummaryTile.addStyleClass("sapUiSmallMargin");

			oGrid.addItem(oSummaryTile);
			console.log("Summary tile created. Total items in grid:", oGrid.getItems().length);
		},

		_onSummaryTilePress: function () {
			const oGrid = this.getView().byId("gridContainer");

			// If product tiles already exist, collapse them
			if (oGrid.getItems().length > 1) {
				// Keep only the summary tile
				while (oGrid.getItems().length > 1) {
					oGrid.removeItem(oGrid.getItems()[oGrid.getItems().length - 1]);
				}
				console.log("Product tiles collapsed");
				return;
			}

			// Otherwise, expand to show product tiles
			this._aProducts.forEach((oProduct) => {
				const oNumericContent = new NumericContent({
					value: oProduct.stockQuantity || oProduct.quantity || 0,
					valueColor: "Good",
					icon: "sap-icon://product",
					withMargin: false,
					state: "Loaded"
				});

				const oTileContent = new TileContent({
					unit: "Units",
					content: oNumericContent
				});

				const oTile = new GenericTile({
					header: oProduct.productName || oProduct.name || "N/A",
					subheader: "ID: " + (oProduct.productID || oProduct.id || "N/A"),
					press: this.onCardPress.bind(this, oProduct),
					tileContent: [oTileContent]
				});
				oTile.addStyleClass("sapUiSmallMargin");

				oGrid.addItem(oTile);
			});
			console.log("Product tiles expanded. Total items in grid:", oGrid.getItems().length);
		},

		onRefresh: function () {
			this.loadProducts();
		},

		onCardPress: function (oProduct) {
			const productName = oProduct.productName || oProduct.name || "Unknown";
			MessageBox.information("Selected: " + productName + " (ID: " + (oProduct.productID || oProduct.id) + ")");
		}
	});
});
