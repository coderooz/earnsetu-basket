# API Integration — EarnSetu Basket

> **Status: NO API INTEGRATION EXISTS.** The app makes no network requests and there is no
> backend contract to document.

## 1. Verified current state

| Concern | Reality |
|---------|---------|
| HTTP client | **None** (no fetch wrapper, no axios) |
| Base URL | **None** |
| Endpoints called | **None** |
| Auth headers | **None** |
| Request/response contracts | **None** |
| Backend service | **Exists in the parent** (`coderooz/EarnSetu` Next.js API routes); **no Basket-facing contract** |
| Placeholder | `src/lib/fetchData.ts` is a **0-byte** file |

Evidence: absence of any network code in `src/`; `App.tsx` only calls Expo's notifications
API (a device SDK call, not an application backend).

## 2. External calls actually made

The only outbound calls are to **Expo services** via `expo-notifications`
(`requestPermissionsAsync`, `getExpoPushTokenAsync`) at app start. These are SDK calls, not
application API endpoints, and the resulting token is only `console.log`ged — nothing
consumes it.

## 3. Why no contract is documented

- The client calls no endpoints, so there is nothing to document.
- The parent EarnSetu backend **exists** (`coderooz/EarnSetu` Next.js API routes), but
  **no route definitions or contracts are published for the Basket client**, and the client
  calls no endpoints. **Fabricating contracts would be incorrect.**

See [`architecture/INTEGRATION_BOUNDARIES.md`](architecture/INTEGRATION_BOUNDARIES.md).

## 4. What must exist before API documentation can be written

1. An authoritative **Basket-facing** EarnSetu contract (base URLs, environments) — the
   parent backend exists, but is not exposed to Basket.
2. Published route/contract definitions (OpenAPI, GraphQL schema, or equivalent).
3. An authentication and authorization scheme for the client.
4. Versioning and error-format conventions.

Until then, any API section in these docs is a placeholder.

## 5. Conventions to adopt (when APIs exist)

For every endpoint, document: method + path, purpose, auth requirement, request/response
shape, validation, error behaviour, contract source, implementation status, and related
tests. Distinguish endpoints that **exist in the backend** from endpoints merely **called
by the client**, and flag mismatches.

## 6. Proposed integration seam (NOT implemented)

`src/lib/fetchData.ts` appears intended as the data-access module (it is empty). Whether
data access lives there, in a dedicated `api/` module, or via a data layer is a decision
requiring an ADR.

## Related documents

- [`SYNCHRONIZATION.md`](SYNCHRONIZATION.md)
- [`AUTHENTICATION.md`](AUTHENTICATION.md)
- [`architecture/INTEGRATION_BOUNDARIES.md`](architecture/INTEGRATION_BOUNDARIES.md)
