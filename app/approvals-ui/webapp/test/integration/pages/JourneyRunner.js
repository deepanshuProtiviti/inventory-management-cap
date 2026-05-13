sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"inventory/ui/inventoryui/test/integration/pages/ProductsList",
	"inventory/ui/inventoryui/test/integration/pages/ProductsObjectPage"
], function (JourneyRunner, ProductsList, ProductsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('inventory/ui/inventoryui') + '/test/flpSandbox.html#inventoryuiinventoryui-tile',
        pages: {
			onTheProductsList: ProductsList,
			onTheProductsObjectPage: ProductsObjectPage
        },
        async: true
    });

    return runner;
});

