# Demo flow

1. **Create tenant** – `POST /v1/identity/tenants` with payload `{ "name": "Demo Health", "slug": "demo" }`.
2. **Invite HR user** – `POST /v1/identity/users` with roles `["HR_BUSINESS_PARTNER"]`.
3. **Import employees** – upload CSV to `/v1/directory/employees/import` or call `POST /v1/directory/employees` for each record.
4. **Set goals** – `POST /v1/performance/goals` and align using the UI goal tree.
5. **Launch review cycle** – `POST /v1/performance/review-cycles` with participant IDs, then collect 360 feedback.
6. **Request leave** – employee uses `/v1/leave/requests`; manager approves via `/v1/leave/requests/{id}`.
7. **Assign learning** – HR selects courses in the Learning catalogue and assigns to roles.
8. **Schedule webhook** – configure `/v1/webhooks/endpoints` for `employee.created` events and observe deliveries.
9. **Run reports** – open dashboards in the Reporting area and export CSV for payroll.
