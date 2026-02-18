# EMS (Employee Management System) — Backend Overview

> **Tech Stack:** Node.js · TypeScript · Express · MongoDB (Mongoose) · JWT · PBAC  
> **Entry Point:** `src/server.ts` → `src/app.ts`  
> **Default Port:** `5002`

---

## Architecture

```
src/
├── config/            # Environment, DB connection, logger (Winston)
├── middleware/         # Global middleware (JWT auth, error handler)
├── models/            # 9 Mongoose schemas
├── modules/           # 7 feature modules (controller → service → routes)
├── access-control/    # Policy-Based Access Control engine
│   ├── engine/        # PolicyLoader, PolicyEvaluator, ConditionEvaluator
│   ├── middleware/     # authorize() Express middleware
│   └── services/      # PolicyService, AuditService
├── seed/              # Startup seeders (roles, policies, admin user)
├── types/             # TypeScript interfaces & enums
└── utils/             # ApiError class, asyncHandler wrapper
```

### Startup Flow

1. Connect to MongoDB
2. Seed default roles, PBAC policies, and admin/employee users (idempotent)
3. Start Express server on port `5002`

---

## Data Models

| Model | Key Fields | Purpose |
|---|---|---|
| **User** | `name`, `email`, `password`, `role`, `otp`, `resetPasswordOtp` | Authentication & identity |
| **Employee** | `employeeId`, `name`, `workEmail`, `department`, `position`, `salary`, `allocatedLeaves`, `availableLeaves`, `userId` (ref → User) | Employee profile (linked 1:1 with User) |
| **Attendance** | `employeeId`, `date`, `status` (Present/Absent/Half Day/On Leave/Holiday), `checkIn`, `checkOut`, `workingHours` | Daily attendance tracking |
| **LeaveRequest** | `employeeId`, `leaveType` (Casual/Sick/Earned/Compensatory/Other), `fromDate`, `toDate`, `days`, `reason`, `status` (Pending/Approved/Rejected), `reviewedBy` | Leave application workflow |
| **Holiday** | `name`, `date`, `type` | Company-wide holidays |
| **Notification** | `userId`, `title`, `message`, `read` | In-app notifications |
| **Policy** | `name`, `effect` (allow/deny), `priority`, `subject.roles`, `resource`, `actions`, `conditions` | PBAC authorization rules |
| **Role** | `name`, `description`, `permissions` | Role definitions |
| **AuditLog** | action, subject, resource, decision | Authorization decision audit trail |

### Enums

- **Departments:** HR, IT, Sales, Finance, Marketing, Operations, Support, R&D, Production
- **User Roles:** `admin`, `employee`, `manager`, `hr`, `team_lead`
- **Leave Types:** Casual, Sick, Earned, Compensatory, Other
- **Leave Statuses:** Pending, Approved, Rejected

---

## API Endpoints

All routes are prefixed with `/api`.

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | ✗ | Login with email & password → returns JWT |
| `POST` | `/register` | ✗ | Register a new user |
| `PUT` | `/change-password` | ✔ | Change own password |
| `GET` | `/profile` | ✔ | Get own profile (includes employee data if not admin) |

---

### Admin (`/api/admin`)

| Method | Path | Auth | PBAC | Description |
|---|---|---|---|---|
| `GET` | `/employees` | ✔ | `employee:list` | List all employees (paginated) |
| `GET` | `/employees/:id` | ✔ | `employee:read` | Get employee by ID |
| `POST` | `/employees` | ✔ | `employee:create` | Create new employee |
| `PUT` | `/employees/:id` | ✔ | `employee:update` | Update employee |
| `DELETE` | `/employees/:id` | ✔ | `employee:delete` | Delete employee |
| `GET` | `/dashboard` | ✔ | `dashboard:read` | Get admin dashboard stats |

---

### Employee (`/api/employee`)

| Method | Path | Auth | PBAC | Description |
|---|---|---|---|---|
| `GET` | `/profile` | ✔ | `employee:read` | View own profile |
| `PUT` | `/profile` | ✔ | `employee:update` | Update own profile |
| `PUT` | `/change-password` | ✔ | — | Change password |
| `GET` | `/dashboard` | ✔ | `dashboard:read` | Get personal dashboard |

---

### Leave (`/api/leave`)

| Method | Path | Auth | PBAC | Description |
|---|---|---|---|---|
| `POST` | `/` | ✔ | `leave_request:create` | Apply for leave |
| `GET` | `/my` | ✔ | `leave_request:list` | View own leave requests |
| `GET` | `/` | ✔ | `leave_request:list` | View all leave requests (admin) |
| `PUT` | `/:id` | ✔ | `leave_request:approve` | Approve/reject leave (with resource loader) |

---

### Holidays (`/api/holidays`)

| Method | Path | Auth | PBAC | Description |
|---|---|---|---|---|
| `GET` | `/` | ✔ | `holiday:list` | List holidays (optional `?year=` filter) |
| `POST` | `/` | ✔ | `holiday:create` | Create holiday |
| `PUT` | `/:id` | ✔ | `holiday:update` | Update holiday |
| `DELETE` | `/:id` | ✔ | `holiday:delete` | Delete holiday |

---

### Attendance (`/api/attendance`)

| Method | Path | Auth | PBAC | Description |
|---|---|---|---|---|
| `GET` | `/my` | ✔ | `attendance:read` | View own attendance |
| `GET` | `/` | ✔ | `attendance:list` | View all attendance (admin) |
| `POST` | `/` | ✔ | `attendance:create` | Mark attendance |

---

### Notifications (`/api/notifications`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✔ | Get own notifications |
| `PUT` | `/:id/read` | ✔ | Mark single notification as read |
| `PUT` | `/read-all` | ✔ | Mark all notifications as read |

---

### Health Check

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Returns `{ status: 'ok', timestamp }` |

---

## Access Control — PBAC (Policy-Based Access Control)

Authorization is handled via a custom **PBAC engine** that evaluates database-stored policies at runtime.

### How It Works

1. **`authenticate`** middleware verifies the JWT and attaches `req.user` (userId, role, email)
2. **`authorize(resource, action)`** middleware:
   - Builds a **Subject** (enriched with employee data: department, dateOfJoining)
   - Builds a **Context** (IP, user-agent, resourceId, resourceData)
   - Loads the resource data via optional `resourceLoader` callback
   - **PolicyEvaluator** fetches matching policies and evaluates conditions
   - Returns `allowed: true` or throws `403 Forbidden`

### Policy Structure

```typescript
{
  name: 'admin_full_employee_access',
  effect: 'allow',              // 'allow' or 'deny'
  priority: 100,                // Higher priority wins on conflict
  subject: { roles: ['admin'] },
  resource: 'employee',
  actions: ['create', 'read', 'update', 'delete', 'list'],
  conditions: [],               // Optional condition checks
  isActive: true
}
```

### Condition Types

| Type | Description |
|---|---|
| `ownership` | Subject owns the resource |
| `department_match` | Subject and resource share the same department |
| `threshold` | Numeric field comparison (e.g., leave days < 5) |
| `time_window` | Time-based restrictions |
| `probation_check` | Check if employee is within probation period |
| `date_range` | Valid within a date range |
| `custom` | Custom handler logic |

### Seeded Policies (13 total)

| Policy | Role | Resource | Status |
|---|---|---|---|
| Admin full employee access | admin | employee | ✔ Active |
| Admin full leave access | admin | leave_request | ✔ Active |
| Admin manage holidays | admin | holiday | ✔ Active |
| Admin manage attendance | admin | attendance | ✔ Active |
| Admin view dashboard | admin | dashboard | ✔ Active |
| Employee view own profile | employee | employee | ✔ Active |
| Employee apply leave | employee | leave_request | ✔ Active |
| Employee view own leaves | employee | leave_request | ✔ Active |
| Employee view own attendance | employee | attendance | ✔ Active |
| Employee view dashboard | employee | dashboard | ✔ Active |
| All view holidays | all roles | holiday | ✔ Active |
| Manager approve same-dept leave | manager | leave_request | ✗ Inactive |
| Manager approve < 5 days | manager | leave_request | ✗ Inactive |
| Deny leave during probation | employee | leave_request | ✗ Inactive |

---

## Seed Data

On startup, the server idempotently seeds:

- **Roles** — Default role definitions
- **Policies** — 13 PBAC policies (11 active, 3 inactive/future-ready)
- **Admin user** — Default admin account
- **Employee user** — Default employee account

---

## Infrastructure

| Component | File | Description |
|---|---|---|
| Environment Config | `config/env.ts` | Loads `.env` vars with defaults (port, MongoDB URI, JWT secret) |
| Database | `config/db.ts` | MongoDB connection via Mongoose |
| Logger | `config/logger.ts` | Winston logger |
| JWT Authentication | `middleware/authenticate.ts` | Verifies Bearer token, attaches `req.user` |
| Error Handler | `middleware/errorHandler.ts` | Global Express error handler (ApiError aware) |
| ApiError | `utils/ApiError.ts` | Custom error class with static factories (`badRequest`, `unauthorized`, `forbidden`, `notFound`, `internal`) |
| Async Handler | `utils/asyncHandler.ts` | Wraps async route handlers to catch promise rejections |
