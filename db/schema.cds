namespace inventory_management_cap;
using { cuid, managed } from '@sap/cds/common';
entity Products : cuid, managed {
    name         : String(100);
    description  : String(500);
    category     : String(50);
    price        : Decimal(10,2);
    quantity     : Integer;
    reorderLevel : Integer;
    status       : String(20);
}
entity InventoryTransactions : cuid, managed {
    product       : Association to Products;
    transactionType : String(20);
    quantity      : Integer;
    remarks       : String(500);
}
entity ApprovalRequests : cuid, managed {
    product       : Association to Products;
    quantity      : Integer;
    reason        : String(500);
    status        : String(20);
}