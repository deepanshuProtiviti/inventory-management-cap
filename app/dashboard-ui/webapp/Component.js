sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataModel"
], function (UIComponent, JSONModel, ODataModel) {
    "use strict";

    return UIComponent.extend("inventory.ui.dashboardui.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            console.log("Component.init() called");
            // Call the base component's init first
            UIComponent.prototype.init.apply(this, arguments);

            // Create a model for UI state
            const oViewModel = new JSONModel({
                busy: false,
                products: []
            });
            this.setModel(oViewModel, "view");

            // Create OData model for the default (unnamed) model
            try {
                console.log("Creating ODataModel...");
                const oDataModel = new ODataModel({
                    serviceUrl: "/odata/v4/service/InventoryService/",
                    synchronizationMode: "None",
                    autoExpandSelect: true
                });
                console.log("ODataModel created:", oDataModel);
                this.setModel(oDataModel);
                console.log("ODataModel set as default model");
            } catch (e) {
                console.error("Error creating ODataModel:", e);
            }
        },

        getContentDensityClass: function () {
            return "sapUiSizeCompact";
        }
    });
});
