# Development Log - Inventory Management CAP

This file documents the issues found and the steps taken to fix the `Products` entity and local authentication issues.

## 1. Issue: Missing Fields in HANA DB
**Problem:** The `Products` table in HANA was missing the UUID primary key and `managed` fields (`createdAt`, `createdBy`, etc.).

**Root Causes:**
1.  **Outdated Artifacts:** The generated HANA files in `db/src/gen` were not in sync with `db/schema.cds`.
2.  **Field Naming Inconsistency:** `srv/service.cds` used capitalized names (e.g., `Name`), while the schema used lowercase (`name`).

**Actions Taken:**
*   **Regenerated Artifacts:** Ran `cds build --production` to update `db/src/gen/inventory_management_cap.Products.hdbtable`.
*   **Fixed Service Layer:** Updated `srv/service.cds` to use lowercase field names to match the schema.

## 2. Issue: Local Authentication Error (401 Unauthorized)
**Problem:** Sending requests to the local service as user `alice` resulted in a 401 error.

**Action Taken:**
*   **Updated Security Config:** Modified `srv/src/main/resources/application.yaml`.
    *   Set `cds.security.authentication.mode: mock`.
    *   Added `alice` to the `mock.users` list with the `authenticated-user` role.

## 3. Issue: Deployment Error
**Problem:** `cds deploy --to hana` was failing with `Error: Option parameter is not supported`.

**Action Taken:**
*   **Fixed Deployment Script:** Updated `db/package.json` to remove the unsupported `--parameter com.sap.hana.di.table/try_fast_table_migration=true` flag from the `start` script.

---

## Next Steps

### A. Deploy to HANA
Run this command to push the schema changes to your database:
```bash
cds deploy --to hana
```

### B. Run the Application
Start the Java backend:
```bash
mvn spring-boot:run
```

### C. Test with Postman
*   **URL:** `http://localhost:8080/service/InventoryService/Products`
*   **Method:** `POST`
*   **Auth:** Basic Auth (Username: `alice`, Password: leave empty)
*   **Body (JSON):**
    ```json
    {
        "name": "Laptop",
        "description": "High performance gaming laptop",
        "price": 1200.50,
        "quantity": 10
    }
    ```

### D. Full Cloud Deployment
To sync everything to BTP:
```bash
mbt build
cf deploy mta_archives/inventory-management-cap_1.0.0.mtar
```
