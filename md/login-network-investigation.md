# Root Cause

The exact cause of the reported Android failure is **not yet established**. The physical device's runtime output, failed-attempt backend logs, and a captured successful Bruno transaction were not available. Do not infer a TLS failure solely from Axios `Network Error`.

One material difference is proven: local Bruno preferences have `preferences.request.sslVerification: false`; React Native uses the native HTTPS trust checks. However, independent certificate-verifying curl and OpenSSL probes succeeded. Disabling verification in Bruno therefore does not establish that today's production certificate is broken.

# Evidence

Inspected the current working tree, including existing uncommitted user changes. Live probes ran on September 22, 2026 around 01:46–01:48 UTC (08:46–08:48 WIB).

| Property | React Native source | Local Bruno saved request/settings |
| --- | --- | --- |
| Base URL | `.env`: `https://api.otokas.co.id/api/v1`; same fallback in `src/lib/api.ts` | Absolute request URL |
| Full login URL | `https://api.otokas.co.id/api/v1/auth/login` | Identical |
| Method | POST | POST |
| Content type | `application/json` | JSON body mode; no explicit header override |
| Accept | Axios default `application/json, text/plain, */*` | No explicit header; actual transport header not captured |
| Body | `email`, `password`, `deviceId` | Same three fields |
| Email | Trimmed and lowercased | Saved email already trimmed and lowercase |
| Password | Passed unchanged | Saved string; device-entered value cannot be compared |
| Device ID | Generated/persisted per installation, fallback on storage failure | Saved string; equality with device cannot be confirmed |
| Authorization | Public login skips SecureStore lookup, but an existing Axios default Authorization header can still be inherited | `auth: inherit`; collection has no auth configured |
| Timeout | 15000 ms | Request and global setting: 0 |
| Redirects | No custom override; native XHR transport controls redirects | Follow enabled, maximum 5 |
| TLS verification | Native platform validation | Global SSL verification disabled; custom CA disabled |

Bruno files inspected without outputting credentials:

- `/Users/fajar-julianto/Documents/bruno/Otokas/Login.yml`
- `/Users/fajar-julianto/Documents/bruno/Otokas/opencollection.yml`
- `/Users/fajar-julianto/Library/Application Support/bruno/preferences.json`

These are saved configurations, not proof of the exact historical on-wire request. Cookie jars, native headers, proxy behavior, and current unsaved Bruno edits still require a captured request. No stored credentials were replayed; live POST probes used deliberately invalid diagnostic credentials.

Configuration inspection:

- No `app.config.*` found in the main project. `app.json` contains no API URL or Android network security override. No native Android manifest/security config found in the main project.
- `eas.json` defines development/preview/production builds without inline API environment overrides. Remote EAS environment values were not inspected; they do not establish the value in an already running Expo Go bundle.
- Babel uses the Expo preset. Metro has no API rewrite; it drops console output in minified builds. The diagnostics are intended for development.
- The current shell had no `EXPO_PUBLIC_API_URL` override. This cannot establish the environment of an already running Metro process.
- Runtime diagnostics print the bundled environment URL, normalized base URL, and prepared full URL. Only output from the actual phone can rule out a stale bundle. Expo documents that environment changes need a full reload: https://docs.expo.dev/guides/environment-variables/.

Request lifecycle:

1. `useLogin` calls `authServices.login`, which obtains a device ID before Axios. Device storage failure normally falls back to a generated ID.
2. Axios prepares JSON and uses the available XHR adapter first. The installed XHR adapter maps its native `onerror` event to an Axios network error; this does not identify DNS vs TCP vs TLS by itself.
3. Public login neither loads the access token from SecureStore nor triggers the 401 refresh flow.
4. The response interceptor currently converts every error without `error.response` into a generic connectivity message and replaces the original Axios error with `ApiError`. That loses the transport code/config at the UI; the added logging captures them before conversion.
5. `useLogin` checks for a top-level `access_token`. A mismatched response shape produces `Token tidak ditemukan dari server.`, a distinct error.
6. After login succeeds, the screen saves the refresh token, sets the default Authorization header, requests `/users/profile`, calls `signIn` to save the access token/session, then navigates. Its catch reports a profile failure even for storage/navigation errors. New stage diagnostics identify that distinction without logging credentials.

`hasRequest: true` means an Axios request object exists, **not** proof that HTTP bytes left the phone or that the server received them. An HTTP response proves a responder was reached; correlating backend/access logs establishes origin receipt. No Android attempt has yet been correlated.

# Exact file causing the issue

No source file is proven to cause the Android transport failure.

`src/lib/api.ts` is the confirmed source of lost diagnostic detail. The SSL-verification mismatch is in Bruno's preferences file, not the React Native source. Neither fact alone proves the production login failure's cause.

# Exact code fix

Implemented development-only instrumentation, preserving the request behavior:

- `src/lib/api.ts`: runtime URL, prepared full URL, method, timeout, content type, Accept, Authorization-presence boolean, success status, response URL, and the requested Axios error fields before conversion to `ApiError`.
- `src/lib/networkDiagnostics.ts`: strips query/fragment/userinfo from logged URLs, allows known transport messages, and suppresses response values. `error.response.data` retains only known envelope field names with redacted values. Arbitrary error messages are suppressed because they can echo credentials.
- `src/services/authServices.ts`: device-ID preparation and HTTP success stages.
- `app/(auth)/login.tsx`: refresh-token storage, profile fetch, session storage, and navigation stages.
- `src/lib/__tests__/networkDiagnostics.test.ts`: verifies credentials echoed in unexpected fields/messages do not appear in diagnostics.

No password, token, request body, full Axios config, or raw error object is logged by this instrumentation. No transport workaround is justified yet. No changes to CORS, TLS verification, API URL, or timeout were made.

Validation: TypeScript and targeted ESLint passed. Three targeted Jest suites passed, 19 tests. The repository contains a `.kilo` worktree with duplicate test mocks; the final test run explicitly excluded it. These tests validate code, not physical-device connectivity.

# Backend/server configuration fix if needed

No server configuration change is currently justified. The tested responder identifies itself as `Google Frontend`, with `via: 1.1 google` and Express headers. This is evidence of a Google-facing proxy, not proof of the entire infrastructure. No Nginx/Cloudflare configuration or backend logs were available in this frontend workspace.

For the next failed phone attempt, query the edge/load-balancer and application logs by UTC timestamp, POST method, and `/api/v1/auth/login`. Include status, latency, request/trace ID, upstream result, and user agent; exclude credentials and bodies. Check edge logs even when application logs have no entry. Absence from sampled/disabled logs is not proof that no request arrived.

Known probe correlation: POST at `2026-09-22T01:46:44Z`, status 401, returned Google trace ID `91641740758a750f439d7edabe06dd11`. The HTTP/1.1 probe at `01:48:08Z` returned trace ID `aac8c97f7a66d4711ad50aa1c8941eb8`. A backend operator can use these to validate log coverage first.

If actual infrastructure is Google Cloud, a starting Logs Explorer filter is:

```text
timestamp >= "<attempt-start-UTC>"
timestamp <= "<attempt-end-UTC>"
httpRequest.requestMethod="POST"
httpRequest.requestUrl:"/api/v1/auth/login"
```

Adapt fields to the service's log schema; application logs may not have `httpRequest`. If Nginx exists, inspect the matching access/error logs and effective `server_name`, certificate chain, and upstream timeout configuration. If Cloudflare exists, inspect the matching security event and origin result. Their presence has not been confirmed.

Only if later evidence shows a missing chain at the actual TLS terminator, install the leaf plus required intermediate certificates (for Nginx, the correct `fullchain.pem` in `ssl_certificate`) and verify before reloading. If a stale/broken DNS address is found, correct that specific record. Do not disable client verification or broadly loosen network security.

The response contains `access-control-allow-origin: http://localhost:3000`. This is not evidence of a native CORS cause: React Native explicitly documents that native requests do not use the browser CORS model: https://reactnative.dev/docs/network.

# TLS/DNS findings

- Local resolver returned A `34.107.169.189`, no AAAA, no CNAME. Thus there was no IPv6 destination to compare from this resolver. Android's resolver/network, including DNS64, private DNS, VPN, and device trust state, remain untested.
- curl verified the hostname against SAN `*.otokas.co.id`; CN is `otokas.co.id`. There is no hostname mismatch in the observed certificate.
- Leaf validity: August 14, 2026 10:49:17 UTC through November 12, 2026 11:45:12 UTC; valid at probe time.
- Server supplied the leaf, WR3 intermediate, and a cross-signed GTS Root R1 issued by GlobalSign Root CA. OpenSSL built a trusted path to GTS Root R1 and returned `Verify return code: 0 (ok)`.
- TLS 1.3 negotiated successfully. No missing intermediate, malformed TLS response, or socket closure was observed on these probes. This is not a universal claim about all clients or transient failures.
- GET on the login URL returned 404, as expected for a POST route. JSON POST with invalid diagnostic credentials returned normal 401 JSON under both HTTP/2 and HTTP/1.1, within the app's 15-second timeout.
- Neither HTTPS POST returned 3xx or a `Location` header. No HTTP-to-HTTPS or hostname redirect is involved in the observed HTTPS login request. Port 80 behavior was not needed to test a request that begins on HTTPS.
- The initial sandbox curl DNS failure disappeared on the approved outside-sandbox probe. It is not evidence of production DNS failure.

# Verification commands

Run on macOS, retaining SSL verification. This first command is GET and may legitimately return 404:

```sh
curl -v --connect-timeout 10 --max-time 15 https://api.otokas.co.id/api/v1/auth/login

curl -v --connect-timeout 10 --max-time 15 \
  https://api.otokas.co.id/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/plain, */*' \
  --data '{"email":"network-diagnostic@example.invalid","password":"invalid-diagnostic-only","deviceId":"network-diagnostic"}'

openssl s_client -connect api.otokas.co.id:443 -servername api.otokas.co.id

openssl s_client -connect api.otokas.co.id:443 \
  -servername api.otokas.co.id -showcerts \
  -verify_return_error -verify_hostname api.otokas.co.id </dev/null

dig api.otokas.co.id A
dig api.otokas.co.id AAAA
dig api.otokas.co.id CNAME
```

Repeat the POST command with `-4 --http1.1` to compare IPv4/HTTP/1.1; use `-6` only to investigate IPv6 resolution/reachability, recognizing that no AAAA was observed. Do not add `-L` initially: inspect any 3xx and `Location` before sending credentials to a redirected host. Do not use `-k` or an insecure TLS option.

In OpenSSL output check `Verification: OK`, `Verify return code: 0 (ok)`, matching SAN, and validity dates against the phone's clock. Each supplied certificate's issuer should link to the next intermediate or a trusted root. The server does not need to send a self-signed root. `unable to get local issuer certificate` can indicate a missing intermediate or a missing local trust anchor; inspect the chain and client trust store to distinguish them. The plain command alone does not explicitly enforce hostname verification, so use the stricter command as well. If Apple's bundled OpenSSL lacks these options, use a current OpenSSL binary.

To inspect native failures after installing Android platform tools and authorizing USB debugging:

```sh
adb devices
adb logcat -v threadtime | rg 'SSLHandshakeException|CertPathValidatorException|Trust anchor|UnknownHostException|SocketTimeoutException|ConnectException|CLEARTEXT|NetworkSecurityConfig|OkHttp'
```

`adb` was not available in this session. A missing matching log line does not rule out a native failure. Review log output for secrets before sharing.

# Final end-to-end test steps

1. In Bruno, enable SSL certificate verification, keep custom CA disabled unless intentionally required, and set timeout to 15000 ms for comparison. Re-run the saved login request. Preserve status/duration and sanitized request headers; do not publish credentials or tokens. The current preference must not be treated as proof of historical behavior.
2. Stop the existing Metro process. From this project's root start `npx expo start --clear`; ensure the launching shell has no unwanted API override. Fully reload Expo Go from this Metro session. Expo Go uses its own native container; editing this project's Android manifest settings would not alter that installed container.
3. Read `[api diagnostic: runtime config]` on the actual phone. Verify base URL `https://api.otokas.co.id/api/v1` and prepared full URL `https://api.otokas.co.id/api/v1/auth/login`, POST, timeout 15000. This establishes the running bundle's value, which source inspection alone cannot do.
4. Attempt one login with the same credentials and record UTC time, Android version, Expo Go version, and network used. Read development logs in React Native DevTools/console. The device ID is intentionally not logged.
5. If `device-id:ready` is missing, investigate preparation. If `hasRequest` is true but there is no response, inspect native DNS/TLS/socket diagnostics and correlate edge logs. If 401 arrives, transport worked and credential/body comparison is appropriate. If timeout is reported, compare measured server latency before changing it.
6. Have the backend operator find that exact attempt in edge and origin logs. Distinguish no edge entry, edge rejection, upstream failure, and successful origin response. Use the known curl traces first to confirm logging works.
7. For a 200 login, verify `login:http-success`, successful token-shape validation, profile request success, session save, and `complete`. A `failed-after-login-success` stage identifies the separate post-login failure.
8. Confirm tabs navigation and session restoration after an app restart. Repeat on Wi-Fi and mobile data only if the failure persists, to isolate device/network dependence. End-to-end completion and the exact root cause remain pending these device/server observations.
