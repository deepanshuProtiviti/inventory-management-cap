using InventoryService as service from '../../srv/service';

annotate service.Products with @(
    UI.Identification: [
        { Value: ID }
    ],
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'Product Name',
            Value: name
        },
        {
            $Type: 'UI.DataField',
            Label: 'Description',
            Value: description
        },
        {
            $Type: 'UI.DataField',
            Label: 'Price',
            Value: price
        },
        {
            $Type: 'UI.DataField',
            Label: 'Quantity',
            Value: quantity
        }
    ],
    UI.HeaderInfo: {
        TypeName: 'Product',
        TypeNamePlural: 'Products',
        Title: { Value: name },
        Description: { Value: description }
    }
);
