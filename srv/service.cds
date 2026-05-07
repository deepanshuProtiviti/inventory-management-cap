using { inventory_management_cap as my } from '../db/schema';

@path : '/service/InventoryService'
service InventoryService
{
    entity Products as projection on my.Products;
}

//annotate InventoryService with @requires :
//[
//    'authenticated-user'
//];

annotate InventoryService.Products with @UI.LineItem: [
  { Value: name },
  { Value: description },
  { Value: price },
  { Value: quantity }
];

annotate InventoryService.Products with @UI.SelectionFields: [
    name
];