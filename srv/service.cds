using { inventory_management_cap as my } from '../db/schema';

@path : '/service/InventoryService'
service InventoryService {
    entity Products as projection on my.Products;
    entity InventoryTransactions as projection on my.InventoryTransactions;
    entity ApprovalRequests as projection on my.ApprovalRequests;
}

annotate InventoryService.Products with @UI.LineItem: [
  { Value: name },
  { Value: category },
  { Value: price },
  { Value: quantity },
  { Value: reorderLevel },
  { Value: status }
];

annotate InventoryService.Products with @UI.SelectionFields: [
    name,
    category,
    status
];
annotate InventoryService.InventoryTransactions with @UI.LineItem: [
    { Value: product.name },
    { Value: transactionType },
    { Value: quantity },
    { Value: createdAt }
];
annotate InventoryService.ApprovalRequests with @UI.LineItem: [
    { Value: product.name },
    { Value: quantity },
    { Value: status },
    { Value: createdAt }
];