namespace inventory_management_cap;

entity Products
{
    key ID : UUID;
    name : String(30);
    description : String(100);
    price : Decimal;
    quantity : Integer;
}
