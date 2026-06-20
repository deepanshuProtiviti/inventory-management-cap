sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/GenericTile",
	"sap/m/TileContent",
	"sap/m/NumericContent",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/m/HBox"
], function (Controller, JSONModel, MessageBox, GenericTile, TileContent, NumericContent, Dialog, Button, Text, VBox, HBox) {
	"use strict";

	return Controller.extend("inventory.ui.dashboardui.controller.Dashboard", {
		onInit: function () {
			console.log("Dashboard.onInit() called");
			const oComponent = this.getOwnerComponent();

			// Create a products model for the view
			const oProductsModel = new JSONModel({
				products: [],
				currentPage: 1,
				totalPages: 0,
				pageSize: 6
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
					const iPageSize = oProductsModel.getProperty("/pageSize");
					oProductsModel.setProperty("/totalPages", Math.ceil(aProducts.length / iPageSize));
					oViewModel.setProperty("/busy", false);

					// Bind the grid container items to products
					this._bindGridItems(aProducts);is i
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
			oSummaryTile.addStyleClass("kpiTile");


			oGrid.addItem(oSummaryTile);
			console.log("Summary tile created. Total items in grid:", oGrid.getItems().length);

			// Create Low Stock KPI tile
			const aLowStock = aProducts.filter(p => (p.quantity || 0) < 10);
			const oLowStockNumericContent = new NumericContent({
				value: aLowStock.length,
				valueColor: "Critical",
				icon: "sap-icon://warning",
				withMargin: false,
				state: "Loaded"
			});

			const oLowStockTileContent = new TileContent({
				unit: "Items",
				content: oLowStockNumericContent
			});

			const oLowStockTile = new GenericTile({
				header: "Low Stock Products",
				subheader: "Qty below 10 units",
				tileContent: [oLowStockTileContent],
				press: this._onLowStockTilePress.bind(this)
			});
			oLowStockTile.addStyleClass("sapUiSmallMargin");
			oLowStockTile.addStyleClass("kpiTile");


			oGrid.addItem(oLowStockTile);
			console.log("Low Stock tile created. Total items in grid:", oGrid.getItems().length);
		},

		_onSummaryTilePress: function () {
			const oModel = this.getView().getModel("products");

			//Always start on page 1 when dialog opens
			oModel.setProperty("/currentPage", 1);

			//Build the grid area for the dialog
			this._oDialogTileContainer = new VBox({
				alignItems: "Center",
				width: "100%"
			});

			//create left arrow button
			this._oLeftArrowButton = new Button({
				icon: "sap-icon://navigation-left-arrow",
				type: "Transparent",
				press: this._onPrevPage.bind(this)
			});

			//create right arrow button
			this._oRightArrowButton = new Button({
				icon: "sap-icon://navigation-right-arrow",
				type: "Transparent",
				press: this._onNextPage.bind(this)
			});

			//create a horizontal box to hold the arrows and grid
			const oContentHBox = new HBox({
				alignItems: "Center",
				justifyContent: "SpaceBetween",
				items: [this._oLeftArrowButton, this._oDialogTileContainer, this._oRightArrowButton]
			});

			//create pagination label at the bottom
			this._oPaginationText = new Text();

			//create the vertical box to hold the content and pagination
			const oDialogVBox = new VBox({
				alignItems: "Center",
				items: [oContentHBox, this._oPaginationText]
			});

			//create the dialog
			this._oDialog = new Dialog({
				title: "Product Catalog",
				contentWidth: "900px",
				contentHeight: "600px",
				content: [oDialogVBox],
				buttons: [new Button({
					text: "Close",
					press: function () {
						this._oDialog.close();
					}.bind(this)
				})]
			});

			//Attach the dialog to the view to ensure it is properly destroyed
			this.getView().addDependent(this._oDialog);

			//Render the first page of products in the dialog
			this._renderDialogPage();

			//Open the dialog
			this._oDialog.open();
			console.log("Summary tile pressed. Dialog opened");
		},

		onRefresh: function () {
			this.loadProducts();
		},

		onCardPress: function (oProduct) {
			const oModel = this.getView().getModel("products");

			//Always start on page 1 when dialog opens
			oModel.setProperty("/currentPage", 1);

			//Build the grid area for the dialog
			this._oDialogTileContainer = new VBox({
				alignItems: "Center",
				width: "100%"
			});

			//create left arrow button
			this._oLeftArrowButton = new Button({
				icon: "sap-icon://navigation-left-arrow",
				type: "Transparent",
				press: this._onPrevPage.bind(this)
			});

			//create right arrow button
			this._oRightArrowButton = new Button({
				icon: "sap-icon://navigation-right-arrow",
				type: "Transparent",
				press: this._onNextPage.bind(this)
			});

			//create a horizontal box to hold the arrows and grid
			const oContentHBox = new HBox({
				alignItems: "Center",
				justifyContent: "SpaceBetween",
				items: [this._oLeftArrowButton, this._oDialogTileContainer, this._oRightArrowButton]
			});

			//create pagination label at the bottom
			this._oPaginationText = new Text();

			//create the vertical box to hold the content and pagination
			const oDialogVBox = new VBox({
				alignItems: "Center",
				items: [oContentHBox, this._oPaginationText]
			});

			//create the dialog
			this._oDialog = new Dialog({
				title: "Product Catalog",
				contentWidth: "900px",
				contentHeight: "600px",
				content: [oDialogVBox],
				buttons: [new Button({
					text: "Close",
					press: function () {
						this._oDialog.close();
					}.bind(this)
				})]
			});

			//Attach the dialog to the view to ensure it is properly destroyed
			this.getView().addDependent(this._oDialog);

			//Render the first page of products in the dialog
			this._renderDialogPage();

			//Open the dialog
			this._oDialog.open();
			console.log("Product card pressed. Dialog opened for product:", oProduct);
		},

		_renderDialogPage: function() {
			const oModel = this.getView().getModel("products");
			const getAllProducts = oModel.getProperty("/products");
			const iPageSize = oModel.getProperty("/pageSize");
			const iCurrentPage = oModel.getProperty("/currentPage");
			const iTotalPages = oModel.getProperty("/totalPages");

			//slice the products for the current page
			const iStart = (iCurrentPage - 1) * iPageSize;
			const iEnd = iStart + iPageSize;
			const aProductsForPage = getAllProducts.slice(iStart, iEnd);

			//clear and rebuild the tile container
			this._oDialogTileContainer.removeAllItems();

			//create a wrapping hbox that will flow tiles in a grid like row
			const oFlexBox = new HBox({
				wrap: "Wrap",
				justifyContent: "Center"
			});

			aProductsForPage.forEach(function(oProduct) {
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
					tileContent: [oTileContent]
				});
				oTile.addStyleClass("sapUiSmallMargin");
				oTile.addStyleClass("productTile");

				oFlexBox.addItem(oTile);
			});

			this._oDialogTileContainer.addItem(oFlexBox);

			//update pagination text
			this._oPaginationText.setText("Page " + iCurrentPage + " of " + iTotalPages);

			//enable/disable navigation buttons
			this._oLeftArrowButton.setEnabled(iCurrentPage > 1);
			this._oRightArrowButton.setEnabled(iCurrentPage < iTotalPages);
		},

		_onNextPage: function () {
			const oModel = this.getView().getModel("products");
			const iCurrentPage = oModel.getProperty("/currentPage");
			const iTotalPages = oModel.getProperty("/totalPages");

			if (iCurrentPage < iTotalPages) {
				oModel.setProperty("/currentPage", iCurrentPage + 1);
				this._renderDialogPage();
			}
		},

		_onPrevPage: function () {
			const oModel = this.getView().getModel("products");
			const iCurrentPage = oModel.getProperty("/currentPage");

			if (iCurrentPage > 1) {
				oModel.setProperty("/currentPage", iCurrentPage - 1);
				this._renderDialogPage();
			}
		},

		_onLowStockTilePress: function () {
			const aLowStock = this._aProducts.filter(p => (p.quantity || 0) < 10);
			if (aLowStock.length === 0) {
				MessageBox.information("No products are currently low in stock.");
				return;
			}

			const sMessage = "Low Stock Products:\n" + aLowStock.map(p => {
				const name = p.productName || p.name || "N/A";
				const qty = p.quantity || 0;
				return `- ${name} (ID: ${p.productID || p.id}, Qty: ${qty})`;
			}).join("\n");

			MessageBox.information(sMessage);
			console.log("Low stock tile pressed. Low stock products:", aLowStock);
		}
	});
});
