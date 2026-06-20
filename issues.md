# Issues Log - Inventory Management CAP UI & Security Fixes

This file documents the issues identified and resolved to enable the UI applications and OData endpoints to run locally on port `8080` without authentication blocks.

## 1. Issue: UI Applications Returning 401 Unauthorized
**Problem:** Visiting the static UI pages (e.g., `/dashboard-ui/webapp/index.html`) or fetching OData endpoints returned `401 Unauthorized`.

**Root Cause:** The CAP Java SDK automatically enables security when mock users are defined or spring security configurations are detected. Even with `cds.security.authentication.mode: never`, default Spring Security filter chains intercept and block all HTTP requests.

**Actions Taken:**
*   **Added Compile-Time Security Dependency:** Added `spring-boot-starter-security` to [srv/pom.xml](file:///home/user/projects/inventory-management-cap/srv/pom.xml) so that Spring Security classes are available during compilation.
*   **Created Security Bypass Configuration:** Implemented a custom Java security configuration [SecurityConfig.java](file:///home/user/projects/inventory-management-cap/srv/src/main/java/customer/inventory_management_cap/SecurityConfig.java) using `WebSecurityCustomizer` to ignore all paths (`/**`) during local development:
    ```java
    package customer.inventory_management_cap;

    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

    @Configuration
    public class SecurityConfig {

        @Bean
        public WebSecurityCustomizer webSecurityCustomizer() {
            return (web) -> web.ignoring().requestMatchers("/**");
        }
    }
    ```

---

## 2. Issue: UI Projects Failing to Fetch OData (404 / 401)
**Problem:** The UI applications failed to load data, throwing `404 Not Found` or path routing errors when fetching products.

**Root Causes:**
1.  **Prefix Mismatch:** The default OData V4 servlet prefix was mapped to `/odata/v4`, making OData endpoints available under `/odata/v4/service/InventoryService`. However, the frontend UI applications (e.g., `products-ui`, `reports-ui`) were configured to query `/service/InventoryService`.
2.  **Dashboard UI Inconsistency:** The Dashboard UI's [manifest.json](file:///home/user/projects/inventory-management-cap/app/dashboard-ui/webapp/manifest.json) and [Component.js](file:///home/user/projects/inventory-management-cap/app/dashboard-ui/webapp/Component.js) were inconsistently hardcoded to `/odata/v4/service/InventoryService/` instead of `/service/InventoryService/`.

**Actions Taken:**
*   **Aligned Dashboard UI Configuration:** Updated [manifest.json](file:///home/user/projects/inventory-management-cap/app/dashboard-ui/webapp/manifest.json) and [Component.js](file:///home/user/projects/inventory-management-cap/app/dashboard-ui/webapp/Component.js) in the Dashboard UI to match the `/service/InventoryService/` OData path pattern used by all other UI modules.
*   **Configured Base Endpoint in Java Backend:** Modified [application.yaml](file:///home/user/projects/inventory-management-cap/srv/src/main/resources/application.yaml) to map the base OData servlet prefix directly to `/`:
    ```yaml
    cds:
      odataV4:
        endpoint:
          path: /
    ```
    This successfully aligns the backend servlet path so that Tomcat routes `/service/InventoryService/Products` directly to the CAP OData servlet.

---

## 3. Local Testing URLs (Port 8080)
*   **Index Page:** [http://localhost:8080/](http://localhost:8080/)
*   **Dashboard UI:** [http://localhost:8080/dashboard-ui/webapp/index.html](http://localhost:8080/dashboard-ui/webapp/index.html)
*   **Products UI:** [http://localhost:8080/products-ui/webapp/index.html](http://localhost:8080/products-ui/webapp/index.html)
*   **Reports UI:** [http://localhost:8080/reports-ui/webapp/index.html](http://localhost:8080/reports-ui/webapp/index.html)
*   **Approvals UI:** [http://localhost:8080/approvals-ui/webapp/index.html](http://localhost:8080/approvals-ui/webapp/index.html)
*   **Transactions UI:** [http://localhost:8080/transactions-ui/webapp/index.html](http://localhost:8080/transactions-ui/webapp/index.html)
