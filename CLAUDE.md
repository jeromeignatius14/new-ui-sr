# CLAUDE.md — Southern Railway Block Management System (BMS)

> **IMPORTANT — READ FIRST:**
> - Active working branch: `BMS-TVC` ONLY
> - Main/merge target: `new-ui`
> - NEVER touch `new-ui` or any other branch directly
> - Production app — 5000+ users daily. Be careful with every change.

---

## What This System Does

Southern Railway **Block Requisition Management System**. When a maintenance crew needs to take a section of track offline for maintenance (called a **"block"**), they submit a request here. The system manages the full lifecycle: submission → disconnection approvals → supervisor approval → admin optimization → sanction → availing confirmation → reporting.

---

## CRITICAL: Role Names vs Real-World Names

The code was developed in a hurry with inconsistent naming. Here is the mapping between what the code calls the roles and what they actually mean in railway terminology:

| Code Role | Real Name | Description |
|---|---|---|
| `JE` | Junior Engineer (JE) | Field-level staff. Submits block requests. Views own requests and other JEs' requests in same depot. Can view but the backend enforces their disconnect approvals differently. |
| `USER` | SSE (Sub-Section Engineer) | Senior to JE. Submits block requests. **Approves other departments' disconnection requests**. Sees ALL requests raised in their DEPOT. |
| `DEPT_CONTROLLER` | Department Controller / Section Engineer-in-charge | Supervisory role. First-level gate: can edit timings, add TPC remarks, approve or reject requests. Also sees and manages disconnection requests for their dept. |
| `BRANCH_OFFICER` / `JUNIOR_OFFICER` / `SENIOR_OFFICER` | Officer hierarchy | Various seniority levels of officers, all use the manager layout. View all subordinate requests. |
| `ADMIN` | Sr.DOM (Senior Divisional Operations Manager) / Section Controller | Final approver. Optimizes all accepted requests, sanctions blocks. |
| `BOARD_CONTROLLER` | TPC (Train Protection Controller) | View-only: sees upcoming sanctioned blocks in 8/16/24 hour windows. |
| `DRM` | DRM (Divisional Railway Manager) | Reporting only — no actions. |
| `HQ` | HQ (Headquarters) | Reporting only — no actions. |
| `BO` | Branch Officer | View-only role with hierarchical scope. |
| `SM` | SM (Station Master) | Redirected to external SMR dashboard. Not part of this app. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Auth | NextAuth v4, JWT strategy, ~100yr session (effectively permanent) |
| State/Fetch | TanStack React Query v5 |
| HTTP | Axios + automatic token-refresh interceptor |
| Forms | React Hook Form + Zod validation |
| Styling | Tailwind CSS v4, React-Select |
| Notifications | Firebase FCM (push notifications) |
| Reports | XLSX export, PapaParse CSV |
| Dates | date-fns, dayjs |
| PWA | next-pwa (installable on mobile) |
| Toast | react-hot-toast, react-toastify |

**Backend API base URL:** `process.env.NEXT_PUBLIC_BACKEND_URL`
**Dev command:** `npm run dev` (turbopack)

---

## Directory Structure

```
app/
  (dashboard)/
    (user)/           → JE + USER (SSE) roles
      create-block-request/   → Submit a new block request
      request-table/          → Own requests + OTHER DEPT's disconnection approvals (for SSE)
      other-requests/         → Dedicated disconnection requests page
      view-request/[id]/      → View request detail
      view-other-request/[id]/ → View disconnection request detail
      sanctioned-table/       → View sanctioned blocks + record avail/not-avail
      optimised-table/        → View optimised blocks
      generate-reports/       → User-level reports
      edit-request/[id]/      → Edit own request (before approval)
      layout.tsx              → Guards: role must be "USER" or "JE"

    (manager)/        → DEPT_CONTROLLER + Officers (BRANCH/JUNIOR/SENIOR_OFFICER)
      manage/
        pending-requests/     → KEY: Approve/reject pending requests + disconnections
        request-table/        → All requests for this manager's section/dept
        view-request/[id]/    → View request detail
        block-summary/        → Block summary view
        manage-users/         → Manage SSEs and JEs under this controller
        manage-pc/            → Manage PC installations
        optimised-table/      → View optimised blocks
        sanctioned-table/     → View sanctioned blocks
      layout.tsx              → Guards: BRANCH_OFFICER | JUNIOR_OFFICER | SENIOR_OFFICER | DEPT_CONTROLLER

    (admin)/          → ADMIN (Sr.DOM) only
      admin/
        request-table/        → All accepted requests, master view with filters
        optimise-table/       → Optimize block timings
        optimised-table-data/ → View/manage optimized data
        draft-table-data/     → Draft table
        sanction-table-data/  → Sanction approved requests
        revise-block/[id]/    → Revise individual block details
        manage-users/         → Manage all users
        view-request/[id]/    → View request detail
      layout.tsx              → Guards: ADMIN only

    (tpc)/            → BOARD_CONTROLLER (TPC) only
      tpc/                    → View sanctioned blocks in 8/16/24hr time windows
      layout.tsx              → Guards: BOARD_CONTROLLER only

    (drm)/            → DRM only
      drm/generate-report/    → DRM reporting dashboard
      layout.tsx              → Guards: DRM only

    (hq)/             → HQ only
      hq/generate-report/     → HQ reporting dashboard
      layout.tsx              → Guards: HQ only

    (bo)/             → BO only
      bo/view-request/[id]/
      bo/generate-report/
      layout.tsx

    dashboard/        → Generic dashboard landing
    profile/          → User profile
    settings/         → Settings

  auth/login/               → Login page (email+password or phone OTP)
  api/auth/[...nextauth]/   → NextAuth handler
  auth.ts                   → NextAuth config
  components/
    ViewRequest.tsx           → SHARED view for all roles — handle with care
    dashboard/Header.tsx      → Top navigation bar
    dashboard/Sidebar.tsx     → Side navigation
    ui/                       → Loader, Modals, WeeklySwitcher, DaySwitcher, ShowAllToggle
    NotificationsInit.tsx     → FCM push token registration
    AddToHomeScreenPrompt.tsx → PWA install banner
  service/
    api/              → Raw axios service functions
    mutation/         → React Query useMutation hooks
    query/            → React Query useQuery hooks
  lib/
    store.ts          → ALL static data: sections, block sections, work types, depots, depot-section mapping (HUGE file — read in chunks)
    helper.ts         → Date/time formatters, Thursday cutoff logic
    optimse.ts        → Optimization logic
  utils/
    axiosInstance.ts  → Axios + token refresh interceptor
    routeHandler.ts   → Post-login role-based redirect
    formatTime.ts     → Time formatter
  context/
    UrgentModeContext.tsx → Global urgent-mode toggle stored in localStorage
  validation/
    user-request.ts   → Zod schema for the block request form
    auth.ts           → Zod schema for login form
lib/firebase.ts       → Firebase FCM init + push token getter
middleware.ts         → NextAuth middleware (route guard for /dashboard/*)
public/
  roadData.json       → Road/corridor data for TVC section
  manifest.json       → PWA manifest
  sw.js               → Service worker
```

---

## The Complete Block Request Flow (Verified from Code)

### STEP 1 — JE or SSE Creates a Block Request
- **Who:** `JE` or `USER` (SSE) role
- **Route:** `/create-block-request`
- **File:** `app/(dashboard)/(user)/create-block-request/page.tsx` (HUGE — read in chunks)
- **API:** `POST /api/user-request`
- **Key form fields:**
  - `date` — date of the work
  - `selectedSection` — major section (e.g., `TVC-NCJ`)
  - `missionBlock` — block sub-section(s), comma-separated
  - `workType`, `activity` — type of maintenance
  - `corridorType` — `"Corridor"` | `"Outside Corridor"` | `"Urgent Block"`
  - `demandTimeFrom`, `demandTimeTo` — requested time window
  - `workLocationFrom`, `workLocationTo` — site location (alphanumeric, max 7 chars)
  - `selectedDepo` — user's depot code
  - `powerBlockRequired` → TRD disconnection needed?
  - `sntDisconnectionRequired` → S&T disconnection needed?
  - `enggDisconnectionsRequired` → ENGG disconnection needed?
  - `sigDisconnection` → Signal disconnection needed?
  - `processedLineSections` — array of line section details
- **Initial DB State:**
  - `status: "PENDING"`
  - `managerAcceptance: false`
  - `adminAcceptance: false`
  - `isSanctioned: false`

---

### STEP 2 — Simultaneous Notification: Disconnection SSEs + DEPT_CONTROLLER

Once submitted, the request simultaneously becomes visible to:

**A) All SSEs (USER role) in the relevant depot/department** whose department matches the disconnection type required:
- If `powerBlockRequired = true` → TRD dept SSEs can see this as a disconnection request
- If `sntDisconnectionRequired = true` → S&T dept SSEs can see it
- If `enggDisconnectionsRequired = true` → ENGG dept SSEs can see it
- They see this in: `/request-table` (main table has a section for other-dept disconnection requests) AND `/other-requests` (dedicated page)
- Status field shown: `DisconnAcceptance` (PENDING / ACCEPTED / REJECTED)

**B) DEPT_CONTROLLER** sees the request in their `/manage/pending-requests` page:
- Under the `disconnections` tab via `data.data.specialDeptRequests` (a separate array from regular requests)
- Filtered by department: `ENGG` sees `enggDisconnectionsRequired`, `S&T` sees `sntDisconnectionRequired`, `TRD` sees `powerBlockRequired`
- DEPT_CONTROLLER can also see the regular pending requests under the urgent/corridor/non-corridor tabs

---

### STEP 3 — SSEs (USER role) Approve/Reject Disconnections

**Who:** SSE (USER role) in the relevant department/depot
**Route:** `/request-table` (embedded section) OR `/other-requests` (dedicated page)
**File:** `app/(dashboard)/(user)/request-table/page.tsx` and `other-requests/page.tsx`
**API:** `PUT /api/user-request/other/{id}?accept=true|false`
**Mutation:** `useUpdateOtherRequest()`
**Body:**
- Accept: `{ acceptRemarks: "reason", userDepartement: "TRD"|"S&T"|"ENGG", mobileView: "..." }`
- Reject: `{ disconnectionRequestRejectRemarks: "reason", userDepartement: "...", mobileView: "..." }`

**Friday 12PM Rule (enforced in frontend):** SSE CANNOT accept requests for dates from Saturday to next Sunday if the current time is Friday after 12:00 PM. Exception: Urgent Blocks bypass this rule.

Updates the relevant disconnection array:
- `trdDisconnections[].status` for TRD
- `sntDisconnections[].status` for S&T
- `enggDisconnections[].status` for ENGG

---

### STEP 4 — DEPT_CONTROLLER Reviews and Approves/Rejects

**Who:** `DEPT_CONTROLLER` role
**Route:** `/manage/pending-requests`
**File:** `app/(dashboard)/(manager)/manage/pending-requests/page.tsx`
**Tabs in UI:**
- `urgent` — Urgent Block requests (flash red with animation)
- `corridor` — Corridor type requests
- `non-corridor` — Outside Corridor requests
- `disconnections` — Disconnection requests pending for this dept
- `multi-line` — Multi-line requests
- `rejected` — Returned requests

**Filter applied:** `status === 'PENDING' && managerAcceptance === false`

**Actions available to DEPT_CONTROLLER:**
1. **Accept:** `PUT /api/user-request/manager/accept/{id}` with `{ isAccept: true, remark?, mobileView: true }`
   → sets `managerAcceptance = true`, request moves to ADMIN queue
2. **Reject:** Same API with `{ isAccept: false, remark }` → sets `status = "REJECTED"`
3. **Edit:** `PUT /api/user-request/manager/edit/{id}` with `{ date, demandTimeFrom, demandTimeTo, tpcRemarks }`
   → DEPT_CONTROLLER can change date, time, add TPC remarks BEFORE approving

**Friday 12PM Rule also applies here** — same date restriction as in SSE approvals.

> **NOTE: Hardcoded User IDs in code (lines 44–52 of pending-requests/page.tsx):**
> These map department → specific shared controller user IDs used to fetch requests for that dept:
> - `02e51371-5ea6-4d5c-b857-a605ee76f745` → ENGG DEPT_CONTROLLER
> - `19ee94a1-e3b0-4e24-bfe5-994af3d92ecd` → TRD DEPT_CONTROLLER
> - `1dc95756-fe6f-460b-b9b7-2c8905ebf3a8` → S&T DEPT_CONTROLLER
> DO NOT change these IDs — they are real production user IDs.

---

### STEP 5 — ADMIN (Sr.DOM) Reviews All Accepted Requests

**Who:** `ADMIN` role
**Route:** `/admin/request-table`
**File:** `app/(dashboard)/(admin)/admin/request-table/page.tsx`
**API:** `GET /api/user-request/admin/users-requests` (via managerService.getUserRequestsByAdmin)

ADMIN sees ALL requests across ALL sections and departments where:
- `managerAcceptance = true` (approved by DEPT_CONTROLLER)
- All required disconnections have been accepted

ADMIN can:
- **Accept/Reject individual requests:** `PUT /api/user-request/admin/accept/{id}?accept=true|false`
  Body: `{ adminRequestStatus: "ACCEPTED"|"REJECTED", remark?, isMobileView: "mobileView" }`
- **Approve all pending:** `PUT /api/user-request/admin/approve-all-pending`
- **Return to applicant:** sets `overAllStatus = "return to applicant by optg"` etc.

---

### STEP 6 — ADMIN Optimizes Blocks

**Who:** `ADMIN` role
**Route:** `/admin/optimise-table`
**File:** `app/(dashboard)/(admin)/admin/optimise-table/page.tsx`

ADMIN views all accepted requests and can:
- Adjust time slots to avoid conflicts between blocks on the same section/line
- Group blocks efficiently
- **Save optimized:** `POST /api/user-request/admin/save-optimized-requests` with `{ optimizedData }`
- **Save combined:** `POST /api/user-request/admin/save-optimized-requests-combined`
- **Update optimize times:** `POST /api/user-request/updateOptimizeTimes` with ISO datetime strings
- **Edit request:** `POST /api/user-request/editRequest` with `{ requestId, optimizeTimeFrom, optimizeTimeTo, date, mobileView: true, sanctionedRemark }`

---

### STEP 7 — ADMIN Sanctions Blocks

**Who:** `ADMIN` role
**Route:** `/admin/sanction-table-data`
**API:** `PUT /api/user-request/admin/sanction` with `{ requestIds: string[] }`

After sanctioning:
- `isSanctioned = true`
- `overAllStatus = "Sanctioned, Pending with SSE For Acceptance"`
- `grantedFromTime` and `grantedToTime` are set

---

### STEP 8 — BOARD_CONTROLLER (TPC) Views Upcoming Blocks

**Who:** `BOARD_CONTROLLER` role
**Route:** `/tpc`
**File:** `app/(dashboard)/(tpc)/tpc/page.tsx`
**API:** `GET /api/board-controller/sanctioned-requests?hours=8|16|24`

TPC views sanctioned blocks happening in the next 8, 16, or 24 hours.
Data is organized by section → line type (Up Slow, Down Slow, Up Fast, Down Fast, Single Line, etc.)
This is **VIEW ONLY** — no actions available.

---

### STEP 9 — SSE/JE Confirms Whether Block Was Availed

**Who:** `USER` (SSE) or `JE` role
**Route:** `/sanctioned-table`
**File:** `app/(dashboard)/(user)/sanctioned-table/page.tsx`
**API for recording avail:** `POST /api/user-request/userResponse` with `{ requestId, userResponse: "availed"|"not availed", reason }`

The SSE/JE records:
- **Availed** — block was used for maintenance as planned
- **Not Availed** — block was not used, with a reason

After recording:
- `overAllStatus` → `"Sanctioned and Accepted by SSE"` (availed)
- `overAllStatus` → `"Sanctioned and Rejected by SSE"` (not availed)

**Exceeded time alert:** If `AvailedDuration > GrantedDuration`, the request shows in RED in ViewRequest.tsx.

Also in the request-table, after sanctioning, SSE/JE can:
- `PUT /api/user-request/accept/{id}` → accept the sanctioned timing (acceptUserRequestRemark)
- `PUT /api/user-request/reject/{id}` → reject with remarks (rejectUserRequestRemark)

---

### STEP 10 — DRM / HQ Reporting (View Only)

**DRM:** `/drm/generate-report` → `GET api/drm/generate-report?startDate&endDate&location&department&blockType`
**HQ:** `/hq/generate-report` → `GET api/hq/generate-report?startDate&endDate&majorSections&department&blockType&globalWorkType&globalActivity&durationOperator&durationValue&pcInstalledStation`

Both get:
- `pastBlockSummary` — per section: Demanded / Approved / Granted / Availed / %
- `detailedData` — list of individual upcoming/past blocks

These are strictly read-only analytics dashboards.

---

## Full Flow Summary Diagram

```
JE or SSE (USER)
  submits block request
  POST /api/user-request
  [status: PENDING, managerAcceptance: false]
          │
          ├──────────────────────────────────────────────────────┐
          │                                                      │
          ▼                                                      ▼
  SSEs of involved depts see it                   DEPT_CONTROLLER sees it
  in /request-table or /other-requests            in /manage/pending-requests
  (TRD / S&T / ENGG based on depot/dept)          (disconnections tab)
          │
  SSE can: Accept (with remarks) or Reject
  PUT /api/user-request/other/{id}?accept=true|false
  Updates: trdDisconnections / sntDisconnections / enggDisconnections
          │
  [All required disconnections ACCEPTED]
          │
          ▼
  DEPT_CONTROLLER acts
  /manage/pending-requests
  PUT /api/user-request/manager/accept/{id}
  ├── Can EDIT date/time/TPC remarks before acting
  ├── ACCEPT → [managerAcceptance: true] → moves to ADMIN
  └── REJECT → [status: REJECTED] → END
          │
          ▼
  ADMIN (Sr.DOM) reviews
  /admin/request-table
  PUT /api/user-request/admin/accept/{id}?accept=true
  [adminAcceptance: true]
          │
          ▼
  ADMIN Optimizes
  /admin/optimise-table
  POST /api/user-request/admin/save-optimized-requests
  (adjust timings, avoid conflicts)
          │
          ▼
  ADMIN Sanctions
  /admin/sanction-table-data
  PUT /api/user-request/admin/sanction
  [isSanctioned: true]
  [overAllStatus: "Sanctioned, Pending with SSE For Acceptance"]
  [grantedFromTime / grantedToTime set]
          │
          ├─────────────────────────────────────────┐
          │                                         │
          ▼                                         ▼
  BOARD_CONTROLLER (TPC)                   SSE / JE confirms availing
  /tpc                                     /sanctioned-table
  View only — next 8/16/24 hrs             POST /api/user-request/userResponse
                                           userResponse: "availed" | "not availed"
                                                    │
                              ┌─────────────────────┴─────────────────────┐
                              │                                           │
                    "Sanctioned and                             "Sanctioned and
                    Accepted by SSE"                           Rejected by SSE"
                    (block used)                               (block not used, with reason)

                              │
                              ▼
                  DRM / HQ view in reports
                  /drm/generate-report
                  /hq/generate-report
```

---

## Key Data Fields on a Block Request

| Field | Values | Meaning |
|---|---|---|
| `status` | `PENDING` / `APPROVED` / `REJECTED` | Basic lifecycle status |
| `overAllStatus` | (string) | Human-readable full status |
| `managerAcceptance` | `false` / `true` | DEPT_CONTROLLER approved? |
| `adminAcceptance` | `false` / `true` | Admin (Sr.DOM) approved? |
| `isSanctioned` | `false` / `true` | Block officially sanctioned? |
| `corridorType` | `"Corridor"` / `"Outside Corridor"` / `"Urgent Block"` | Block category |
| `trdDisconnections[]` | `{depot, status, approvedAt, remarks}[]` | Per-depot TRD approvals |
| `sntDisconnections[]` | same | Per-depot S&T approvals |
| `enggDisconnections[]` | same | Per-depot ENGG approvals |
| `DisconnAcceptance` | `PENDING` / `ACCEPTED` / `REJECTED` | Overall disconnection status |
| `grantedFromTime` / `grantedToTime` | ISO datetime | Sanctioned time window |
| `AvailedTimeFrom` / `AvailedTimeTo` | ISO datetime | Actual used time |
| `userResponse` | `"availed"` / `"not availed"` | SSE/JE's confirmation |
| `demandTimeFrom` / `demandTimeTo` | ISO datetime | Original requested time |
| `sanctionedTimeFrom` / `sanctionedTimeTo` | ISO datetime | Admin-set sanctioned time |
| `tpcRemarks` | string | DEPT_CONTROLLER's remarks |
| `sanctionedRemarks` | string | Admin's remarks |
| `remarkByManager` | string | Manager's remarks |
| `disconnectionRequestRejectRemarks` | string | Rejection reason |

---

## overAllStatus Values (in order of lifecycle)

```
"PENDING"
"Sanctioned, Pending with SSE For Acceptance"
"Sanctioned and Accepted by SSE"
"Sanctioned and Rejected by SSE"
"return to applicant by optg"
"return to applicant by trd."
"return to applicant by s&t and trd."
"return to applicant by s&t."
```

---

## Geography / Sections

**Major Sections (from `app/lib/store.ts`):**
```
MAS: MAS-GDR, MAS-AJJ, AJJ-KPD, KPD-JTJ, AJJ-RU, AJJ-CGL, MSB-VM, MSB-VLCY
TPJ: TPJ-VM, VM-MV, TPJ-MV, TJ-KIK, MV-TVR, NMJ-MQ, VM-PDY, KPD-VM, CUPJ-VRI, TPJ-TP, NGT-VLNK, TVR-KKDI, TTP-AGX
SA:  JTJ-ED, ED-PTJ, ED-TPJ, KRR-DG, SA-VRI, SA-MTDM, SA-KRR, CBE-MTP, MTP-UAM, PTJ-CNV
TVC: SRR-CHTS, TCR-GUV, ERS-KTYM-KYJ, ERS-ALLP-KYJ, KYJ-QLN, QLN-TVC, TVC-NCJ, NCJ-TEN, NCJ-CAPE
```

**Board Controller Division Map:**
- A: MAS-GDR, MAS-AJJ, MSB-VM
- B: TPJ-VM, VM-MV, TPJ-MV
- C: JTJ-ED, ED-PTJ, ED-TPJ
- D: KYJ-QLN, QLN-TVC, TVC-NCJ ← TVC Division

**Departments:** TRD (Traction), S&T (Signals & Telecom), ENGG (Engineering)

---

## Business Rules (Enforced in Frontend)

1. **Friday 12PM cutoff rule:** SSE (USER) and DEPT_CONTROLLER cannot accept non-urgent requests for dates between Saturday and next Sunday if current time is Friday after 12:00 PM. Urgent Blocks bypass this.

2. **Thursday 4PM planning cycle:** `isDateAfterThursdayCutoff()` in helper.ts. Weekly planning cycle runs Thursday 4PM → Sunday 23:59. Affects which dates can be selected in the create form.

3. **Availed time exceeded:** If `AvailedDuration > GrantedDuration`, the request shows in red in ViewRequest. Calculated by comparing `AvailedTimeFrom/To` vs `grantedFromTime/grantedToTime`.

4. **Urgent blocks flash red** in DEPT_CONTROLLER's pending requests table (CSS animation every 5s).

5. **Accept requires remarks:** Both accept and reject actions for disconnections require the SSE to enter a reason/remark before confirming.

---

## Key API Endpoints

```
# AUTH
POST   /api/auth/login                          → Login (email/password)
POST   /api/auth/phone-login                    → Request OTP
POST   /api/auth/verify-phone-otp               → Verify OTP + login
POST   /api/auth/refresh-token                  → Refresh JWT
POST   /api/auth/logout

# BLOCK REQUESTS (JE/SSE)
POST   /api/user-request                        → Create block request
GET    /api/user-request/user?page&limit&start&end  → Get own requests
GET    /api/user-request/{id}                   → Get single request
PUT    /api/user-request/{id}                   → Update request (general)
DELETE /api/user-request/{id}                   → Delete/cancel
GET    /api/user-request/other/{depot}?userDepartement=  → Disconnection requests for SSE
PUT    /api/user-request/other/{id}?accept=true|false   → SSE approve/reject disconnection
PUT    /api/user-request/accept/{id}            → SSE accept sanctioned block
PUT    /api/user-request/reject/{id}            → SSE reject sanctioned block (with remarks)
POST   /api/user-request/userResponse           → Record availed/not-availed
GET    /api/user-request/summary-requests/{section}  → Sanctioned block summary

# DEPT_CONTROLLER (Manager)
GET    /api/user-request/manager/users-requests → All requests in manager's scope
PUT    /api/user-request/manager/accept/{id}    → Approve/reject request
PUT    /api/user-request/manager/edit/{id}      → Edit date/time/tpcRemarks
GET    /api/user-request/manager/manager-optimise-status → Manager optimise status
GET    /api/user-request/manager/pending        → Pending requests

# ADMIN
GET    /api/user-request/admin/users-requests   → All requests (admin scope)
PUT    /api/user-request/admin/accept/{id}?accept=  → Admin accept/reject
GET    /api/user-request/admin/approved         → Get approved requests
GET    /api/user-request/admin/optimized        → Get optimized requests
PUT    /api/user-request/admin/sanction         → Sanction block(s)
PUT    /api/user-request/admin/approve-all-pending → Bulk approve all
POST   /api/user-request/admin/save-optimized-requests → Save optimization
POST   /api/user-request/admin/save-optimized-requests-combined → Save combined
PUT    /api/user-request/admin/save-optimized-requests-status → Update status
PUT    /api/user-request/admin/edit/{id}        → Admin edit request
GET    /api/user-request/user-data              → Admin's user data view
POST   /api/user-request/updateOptimizeTimes    → Update optimize times
POST   /api/user-request/editRequest            → Edit with full fields
POST   /api/user-request/updateSanctionStatus   → Update sanction status
POST   /api/user-request/updatedStatus          → Update request status
POST   /api/user-request/userResponse           → Record avail response
DELETE /api/user-request/delet-optimiseData/{id} → Delete optimized data

# BOARD CONTROLLER (TPC)
GET    /api/board-controller/sanctioned-requests?hours=8|16|24

# REPORTING
GET    api/drm/generate-report?startDate&endDate&location&department&blockType
GET    api/hq/generate-report?startDate&endDate&majorSections&department&blockType&globalWorkType&...

# USER MANAGEMENT
GET    /api/dept-controller/users               → Get SSEs
POST   /api/dept-controller/users               → Add SSE
PATCH  /api/dept-controller/users/{id}          → Edit SSE
DELETE /api/dept-controller/users/{id}          → Delete SSE
GET    /api/dept-controller/users/{id}/jes      → Get JEs under an SSE
POST   /api/dept-controller/jes                 → Add JE (needs managerId)
PATCH  /api/dept-controller/jes/{id}            → Edit JE
DELETE /api/dept-controller/jes/{id}            → Delete JE
GET    /api/dept-controller/stations            → Get stations
POST   /api/dept-controller/stations            → Add station
DELETE /api/dept-controller/stations/{id}       → Delete station
GET    /api/traffic-controller/users            → Get SMs
POST   /api/traffic-controller/users            → Add SM (role: "SM")
PATCH  /api/traffic-controller/users/{id}
DELETE /api/traffic-controller/users/{id}
GET    /api/auth/users/manager                  → Manager: get users
POST   /api/auth/register-user                  → Register user
POST   /api/auth/register-manager              → Register manager
```

---

## Authentication Flow

1. Login via `/auth/login`
2. Either: email + password → `POST /api/auth/login`
   Or: phone → `POST /api/auth/phone-login` → OTP → `POST /api/auth/verify-phone-otp`
3. On success: `signIn('credentials', { accessToken, refreshToken, user })`
4. NextAuth stores JWT with: `id, name, email, role, department, depot, phone, location, accessToken, refreshToken`
5. Axios interceptor attaches `Bearer {accessToken}` on all requests
6. On 401: tries token refresh → updates session → retries original request
7. On refresh failure: `signOut()` + redirect to `/auth/login`
8. After login, `routeHandler.ts` redirects based on role:
   - `DEPT_CONTROLLER` → `/manage/request-table`
   - `SM` → external `smr-dashboard.plattorian.tech?cugNumber=...&stationCode=...&user=SM&token=...`
   - `BOARD_CONTROLLER` → `/tpc`
   - `ADMIN` → `/admin/request-table`
   - Others → `/dashboard`

---

## Static Data in store.ts

`store.ts` is a VERY large file (60k+ tokens). Read it in chunks using offset/limit.

It contains:
- `MajorSection` — major section → block sections list
- `blockSection` — block section → individual sub-block list
- `workType` — array of work type strings
- `Activity` — workType → activities array map
- `lineData` — line types per section
- `streamData` — stream options
- `depot` — per section, per department → depot code list (used for auto-assigning TRD/S&T/ENGG depots)
- `blockSectionDepotAssignment` — block section → TRD/S&T/ENGG depot mapping
- `BoardControllerDepotMap` — division letter → sections
- `sectionsWithAlphanumericSiteLocation` — sections allowing alphanumeric site location input

---

## Key Components — Notes

| Component | Path | Note |
|---|---|---|
| `ViewRequest` | `app/components/ViewRequest.tsx` | Used by ALL roles. Handles edit (DEPT_CONTROLLER only), delete (PENDING status). Change carefully. |
| `UrgentModeContext` | `app/context/UrgentModeContext.tsx` | Toggles between day-view and week-view. Stored in localStorage. |
| `WeeklySwitcher` | `app/components/ui/WeeklySwitcher.tsx` | Navigation between weeks/days in tables. |
| `NotificationsInit` | `app/components/NotificationsInit.tsx` | Registers FCM token on login for push notifications. |

---

## Files to Read When Working on Specific Features

| Feature | Key Files |
|---|---|
| Create/edit block request | `create-block-request/page.tsx` (chunks), `validation/user-request.ts`, `service/api/user-request.ts`, `lib/store.ts` (chunks) |
| Disconnection approval (SSE) | `(user)/request-table/page.tsx`, `(user)/other-requests/page.tsx`, `service/api/user-request.ts` |
| DEPT_CONTROLLER approval | `(manager)/manage/pending-requests/page.tsx`, `service/api/manager.ts`, `service/mutation/manager.ts` |
| Admin sanction flow | `(admin)/admin/` pages, `service/api/admin.ts` |
| Sanctioned block avail response | `(user)/sanctioned-table/page.tsx`, `service/api/admin.ts` (updateUserResponse) |
| TPC view | `(tpc)/tpc/page.tsx`, `service/api/boardController.ts` |
| Reports | `(drm)/drm/generate-report/page.tsx`, `(hq)/hq/generate-report/page.tsx`, `service/api/drm.ts`, `service/api/hq.ts` |
| Auth | `app/auth.ts`, `utils/axiosInstance.ts`, `service/api/auth.ts` |
| User management | `service/api/dept-controller.ts`, `service/api/traffic-controller.ts` |

---

## Environment Variables

```
NEXT_PUBLIC_BACKEND_URL=         # Backend API base URL (e.g., https://api.example.com)
NEXT_PUBLIC_API_URL=             # Fallback, defaults to http://localhost:3001
NEXTAUTH_SECRET=                 # JWT signing secret
NEXTAUTH_URL=                    # App public URL
NEXT_PUBLIC_FIREBASE_VAPID_KEY=  # Firebase FCM VAPID key for push notifications
```

---

## Common Gotchas

1. **store.ts and create-block-request/page.tsx are HUGE** — always read in chunks with offset/limit
2. **ViewRequest.tsx is shared** across ALL roles — test all role scenarios after changes
3. **Session maxAge = 100 years** — JWT sessions never expire in practice
4. **Hardcoded production user IDs** in `pending-requests/page.tsx` lines 44–52 — DO NOT change
5. **SM role** is redirected to external URL with hardcoded auth token `W1IU66ZFEBFBF6C1dGmouN6PVyHARQJg` in URL — this is intentional
6. **DEPT_CONTROLLER** uses both `data.data.requests` (regular requests) AND `data.data.specialDeptRequests` (disconnection requests) — these are different arrays from the same API call
7. **Friday 12PM rule** is frontend-enforced for both SSE and DEPT_CONTROLLER accept actions
8. **`managerService` is misnamed** — it is used by multiple roles, not just managers; it contains functions for admin, dept_controller, and officers
9. **`userDepartement` (note the typo: "departement")** — this typo is in both frontend and backend, do NOT fix it or you'll break the API
10. **`mobileView` parameter** is passed in many requests — it's a flag the backend uses for certain logic. Always include it as `true` or `"mobileView"` when making mutations.
