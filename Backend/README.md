# Loan Management System (LMS) — Backend Documentation

A robust, enterprise-grade **Loan Management System (LMS)** backend built with **ASP.NET Core 8 Web API**, **Entity Framework Core 8 Code First**, **SQL Server (LocalDB / Express / Enterprise)**, and **Clean Architecture**.

---

## 1. Technology Stack

- **Framework**: .NET 8 (C# 12)
- **Web API**: ASP.NET Core 8 Web API
- **ORM**: Entity Framework Core 8 (Code First)
- **Database**: Microsoft SQL Server (LocalDB / SQL Express / Standard / Enterprise)
- **Authentication**: JWT Bearer Token (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- **Authorization**: Dynamic Permission-Based Authorization (`IAuthorizationPolicyProvider` + `AuthorizationHandler<PermissionRequirement>`)
- **Documentation**: Swagger / OpenAPI (Swashbuckle) with JWT Bearer scheme
- **File Storage**: Secure local storage for loan documents with MIME-type and size validation
- **Reporting**: Native dependency-free CSV export and statement generation

---

## 2. Clean Architecture Structure

```text
Backend/
├── LMS.Domain/                 # Core Domain Entities & BaseEntity
│   ├── Common/                 # BaseEntity (Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted)
│   └── Entities/               # User, Role, Status, LoanType, LoanApplication, LoanDocument,
│                               # LoanGuarantor, LoanApproval, Loan, RepaymentSchedule, Repayment,
│                               # Menu, RoleMenu, UserMenu, Permission, RolePermission, UserPermission,
│                               # LoanApplicationAssignment, AuditLog
│
├── LMS.Application/            # Application Layer (Interfaces, DTOs, Requirements)
│   ├── Authorization/          # PermissionRequirement
│   ├── DTO/                    # Request & Response DTOs grouped by module
│   │   ├── Auth/
│   │   ├── Users/
│   │   ├── Roles/
│   │   ├── Menus/
│   │   ├── RoleMenus/
│   │   ├── UserMenus/
│   │   ├── Permissions/
│   │   ├── RolePermissions/
│   │   ├── UserPermissions/
│   │   ├── Statuses/
│   │   ├── LoanApplications/
│   │   ├── LoanApprovals/
│   │   ├── LoanDocuments/
│   │   ├── LoanGuarantors/
│   │   ├── Loans/
│   │   ├── Repayments/
│   │   ├── Dashboard/
│   │   ├── Reports/
│   │   └── AuditLogs/
│   ├── Repositories/Interfaces/# Repository contracts
│   └── Services/Interfaces/    # Business service contracts
│
├── LMS.Infrastructure/         # Infrastructure Layer (Data, Persistence, Business Logic)
│   ├── Data/                   # ApplicationDbContext, Model configurations, SeedData
│   ├── DataAccess/             # Repository implementations (EF Core DbContext queries)
│   ├── BusinessLogic/          # Service implementations (business validation, transactions)
│   ├── Authorization/          # Dynamic PermissionPolicyProvider & PermissionAuthorizationHandler
│   ├── Migrations/             # Code-First database migrations
│   └── Services/               # JwtTokenGenerator
│
└── LMS.API/                    # Web API Presentation Layer
    ├── Controllers/            # Thin REST Controllers with permission policy annotations
    ├── wwwroot/uploads/        # Secure upload storage folder for loan documents
    ├── appsettings.json        # Configuration (Connection strings, JWT settings, CORS)
    └── Program.cs              # DI container, middleware pipeline, authentication & Swagger
```

---

## 3. Prerequisites (Any Windows Machine)

1. **.NET 8 SDK** (v8.0.x or higher)
   ```powershell
   dotnet --list-sdks
   ```
2. **SQL Server LocalDB** (included with Visual Studio) or **SQL Server Express**
   ```powershell
   sqllocaldb info MSSQLLocalDB
   ```
3. **EF Core Global CLI Tool**
   ```powershell
   dotnet tool install --global dotnet-ef --version 8.*
   ```

---

## 4. Configuration (`appsettings.json`)

Configure your database and security settings in `Backend/LMS.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=LoanManagementSystemDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "<STRONG_64_CHAR_SECRET_KEY_STORED_IN_ENVIRONMENT_FOR_PRODUCTION>",
    "Issuer": "LMS.API",
    "Audience": "LMS.Client",
    "ExpiryMinutes": 60
  },
  "Authentication": {
    "DefaultRegistrationRoleKey": "CUSTOMER"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

> **Security Note:** In production/staging, never commit secrets to version control. Set `Jwt__Key` and `ConnectionStrings__DefaultConnection` via IIS Environment Variables or Windows Machine Environment Variables.

---

## 5. Database Setup & Seed Data

### Step 1: Restore and Build
```powershell
dotnet restore Backend/LMS.sln
dotnet build Backend/LMS.sln -c Release
```

### Step 2: Apply Migrations (Creates DB & Schema)
```powershell
dotnet ef database update --project Backend/LMS.Infrastructure --startup-project Backend/LMS.API
```

### Step 3: Seed Initial Data
When `LMS.API` launches, `SeedData.InitializeAsync` automatically seeds:
- The default **Admin** role (`ADMIN`).
- The initial **Admin User** (`admin@lms.local` / `Admin@12345`).
- The 4 core system roles:
  | RoleId | Role Name | Role Key | Purpose |
  |---|---|---|---|
  | 1 | Admin | `ADMIN` | Full system administration and configuration |
  | 2 | Head Manager | `MANAGER` | Branch management, loan approvals, disbursements, payment verification |
  | 3 | Loan Officer | `OFFICER` | Loan application review, document/guarantor verification, repayments |
  | 4 | Customer | `CUSTOMER` | Public registration, loan application, document upload, repayments |

---

## 6. Running the API

```powershell
dotnet run --project Backend/LMS.API
```
- **API Base URL**: `https://localhost:7081` (or configured port)
- **Swagger Documentation**: `https://localhost:7081/swagger`

---

## 7. Dynamic Permission System

Authorization is implemented dynamically via policies formatted as:
```csharp
[Authorize(Policy = "Permission:PERMISSION_KEY")]
```

### Access Resolution Priority:
1. **Admin Role Bypass**: Any authenticated user with role `ADMIN` automatically bypasses all permission requirements.
2. **Direct Active User Permission**: Checked first (`UserPermissions` table).
3. **Default Menu View**: Assigning a menu in `UserMenus` grants view-only (`*_VIEW`) access to that page.
4. **Explicit User Revocation**: If a permission was explicitly revoked in `UserPermissions` (`RevokedAt IS NOT NULL`), access is denied even if the user's role has that permission.
5. **Role Permission**: Checked in `RolePermissions` table.

---

## 8. API Module & Endpoint Directory

### Authentication & Profiles (`AuthController`, `UsersController`, `RolesController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `POST` | `/api/Auth/register` | Anonymous | Customer registration (auto-assigned `CUSTOMER`) |
| `POST` | `/api/Auth/login` | Anonymous | Authenticate & receive JWT token |
| `GET` | `/api/Users` | `Permission:USER_VIEW` | Paginated users list with search & role filter |
| `GET` | `/api/Users/{id}` | `Permission:USER_VIEW` | User profile details |
| `POST` | `/api/Users` | `Permission:USER_CREATE` | Create staff or customer user |
| `PUT` | `/api/Users/{id}` | `Permission:USER_UPDATE` | Update user profile |
| `DELETE` | `/api/Users/{id}` | `Permission:USER_DELETE` | Soft-delete user |
| `GET` | `/api/Roles` | `Permission:ROLE_VIEW` | Roles list |

### Dynamic Menus & Permissions (`MenusController`, `RoleMenusController`, `UserMenusController`, `PermissionsController`, `RolePermissionsController`, `UserPermissionsController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `GET` | `/api/Menus/user/{userId}` | `Permission:DASHBOARD_VIEW` | User's effective hierarchical menus |
| `GET` | `/api/Menus` | `Permission:MENU_VIEW` | All system menus |
| `GET` | `/api/RoleMenus` | `Permission:ROLE_MENU_VIEW` | Role menu assignments |
| `POST` | `/api/RoleMenus` | `Permission:MENU_MANAGE` | Assign menu to role |
| `DELETE` | `/api/RoleMenus/{id}` | `Permission:MENU_MANAGE` | Remove role menu |
| `GET` | `/api/UserMenus` | `Permission:USER_MENU_VIEW` | Direct user menu assignments |
| `GET` | `/api/Permissions` | `Permission:PERMISSION_VIEW` | All system permissions |
| `GET` | `/api/RolePermissions` | `Permission:ROLE_PERMISSION_VIEW` | Role permission assignments |
| `POST` | `/api/RolePermissions` | `Permission:PERMISSION_MANAGE` | Assign permission to role |
| `DELETE` | `/api/RolePermissions/{id}` | `Permission:PERMISSION_MANAGE` | Remove role permission |
| `GET` | `/api/UserPermissions` | `Permission:USER_PERMISSION_VIEW` | User permissions list |
| `POST` | `/api/UserPermissions` | `Permission:PERMISSION_MANAGE` | Assign permission to user |
| `POST` | `/api/UserPermissions/{id}/revoke`| `Permission:PERMISSION_MANAGE`| Revoke individual permission |

### Loan Types Management (`LoanTypesController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `GET` | `/api/LoanTypes` | `Permission:LOAN_TYPE_VIEW` | All loan types with pagination, search, status filter |
| `GET` | `/api/LoanTypes/active` | `Authorize` | Active loan types for application creation dropdowns |
| `GET` | `/api/LoanTypes/{id}` | `Permission:LOAN_TYPE_VIEW` | Loan type details by ID |
| `POST` | `/api/LoanTypes` | `Permission:LOAN_TYPE_MANAGE` | Create new loan product/type |
| `PUT` | `/api/LoanTypes/{id}` | `Permission:LOAN_TYPE_MANAGE` | Update loan type configuration |
| `DELETE` | `/api/LoanTypes/{id}` | `Permission:LOAN_TYPE_MANAGE` | Delete loan type (safely guards against active applications) |
| `PATCH` | `/api/LoanTypes/{id}/status` | `Permission:LOAN_TYPE_MANAGE` | Activate / deactivate loan type |

### Loan Applications & Workflow (`LoanApplicationsController`, `LoanApplicationAssignmentsController`, `LoanApprovalsController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `POST` | `/api/LoanApplications` | `Permission:LOAN_APPLICATION_CREATE` | Customer submits loan application |
| `GET` | `/api/LoanApplications` | `Permission:LOAN_APPLICATION_VIEW` | Role-scoped list of applications |
| `PUT` | `/api/LoanApplications/{id}/review` | `Permission:LOAN_APPLICATION_REVIEW` | Officer reviews application |
| `POST` | `/api/LoanApplicationAssignments` | `Permission:APPLICATION_ASSIGNMENT_MANAGE` | Assign application to Officer |
| `POST` | `/api/LoanApprovals/{id}/approve` | `Permission:LOAN_APPLICATION_APPROVE` | Manager/Admin approves application |
| `POST` | `/api/LoanApprovals/{id}/reject` | `Permission:LOAN_APPLICATION_REJECT` | Manager/Admin rejects application |

### Loan Documents Management (`LoanDocumentsController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `POST` | `/api/LoanDocuments` | `Permission:LOAN_DOCUMENT_CREATE` | Upload document (PDF/JPG/PNG max 5MB) |
| `GET` | `/api/LoanDocuments/application/{appId}`| `Permission:LOAN_DOCUMENT_VIEW` | Documents of application (role-scoped) |
| `GET` | `/api/LoanDocuments/{id}` | `Permission:LOAN_DOCUMENT_VIEW` | Single document metadata |
| `GET` | `/api/LoanDocuments/{id}/download` | `Permission:LOAN_DOCUMENT_VIEW` | Stream document file bytes |
| `PUT` | `/api/LoanDocuments/{id}/verify` | `Permission:LOAN_APPLICATION_REVIEW` | Staff verifies document |
| `PUT` | `/api/LoanDocuments/{id}/reject` | `Permission:LOAN_APPLICATION_REVIEW` | Staff rejects document with remarks |

### Loan Guarantors Management (`LoanGuarantorsController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `POST` | `/api/LoanGuarantors` | `Permission:LOAN_APPLICATION_CREATE` | Add guarantor with duplicate checks |
| `GET` | `/api/LoanGuarantors/application/{appId}`| `Permission:LOAN_APPLICATION_VIEW` | Guarantors of application |
| `GET` | `/api/LoanGuarantors/{id}` | `Permission:LOAN_APPLICATION_VIEW` | Single guarantor details |
| `PUT` | `/api/LoanGuarantors/{id}` | `Permission:LOAN_APPLICATION_CREATE` | Update guarantor details |
| `DELETE` | `/api/LoanGuarantors/{id}` | `Permission:LOAN_APPLICATION_CREATE` | Soft-delete guarantor |
| `PUT` | `/api/LoanGuarantors/{id}/verify` | `Permission:LOAN_APPLICATION_REVIEW` | Staff verifies guarantor |
| `PUT` | `/api/LoanGuarantors/{id}/reject` | `Permission:LOAN_APPLICATION_REVIEW` | Staff rejects guarantor with remarks |

### Loans & Disbursements (`LoansController`, `LoanDisbursementsController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `POST` | `/api/LoanDisbursements/{appId}/disburse`| `Permission:LOAN_DISBURSE` | Disburse approved loan & create Loan record |
| `GET` | `/api/Loans` | `Permission:LOAN_VIEW` | Paginated loans (scoped by role) |
| `GET` | `/api/Loans/my-loans` | `Permission:LOAN_VIEW` | Customer's own active/closed loans |
| `GET` | `/api/Loans/{id}` | `Permission:LOAN_VIEW` | Full loan details with schedule & receipts |
| `GET` | `/api/Loans/{id}/repayment-schedule` | `Permission:LOAN_VIEW` | Loan's installment schedule |
| `GET` | `/api/Loans/{id}/repayments` | `Permission:LOAN_VIEW` | Loan's payment history |

### Repayments & Schedules (`RepaymentsController`, `RepaymentSchedulesController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `POST` | `/api/RepaymentSchedules/{loanId}/generate`| `Permission:LOAN_DISBURSE` | Generate monthly repayment schedule |
| `GET` | `/api/RepaymentSchedules/loan/{loanId}` | `Permission:REPAYMENT_SCHEDULE_VIEW`| Retrieve loan repayment schedule |
| `POST` | `/api/Repayments` | `Permission:REPAYMENT_CREATE` | Customer submits repayment |
| `GET` | `/api/Repayments` | `Permission:REPAYMENT_VIEW` | All repayments (paginated, filtered) |
| `GET` | `/api/Repayments/my-payments` | `Permission:REPAYMENT_VIEW` | Customer's payment history |
| `GET` | `/api/Repayments/{id}` | `Permission:REPAYMENT_VIEW` | Single repayment record |
| `GET` | `/api/Repayments/pending` | `Permission:REPAYMENT_VIEW` | Pending payments awaiting verification |
| `POST` | `/api/Repayments/{id}/verify` | `Permission:REPAYMENT_VERIFY` | Verify payment with serializable transaction |
| `POST` | `/api/Repayments/{id}/reject` | `Permission:REPAYMENT_VERIFY` | Reject payment with remarks |

### Dashboard & Analytics (`DashboardController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `GET` | `/api/Dashboard/summary` | `Permission:DASHBOARD_VIEW` | Role-specific dashboard stats & workloads |

### Reports & CSV Exports (`ReportsController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `GET` | `/api/Reports/loans` | `Permission:LOAN_VIEW` | Comprehensive loan report |
| `GET` | `/api/Reports/loans/export-csv` | `Permission:LOAN_VIEW` | Export loan report to CSV |
| `GET` | `/api/Reports/customer-statement/{loanId}` | `Permission:LOAN_VIEW` | Full customer loan statement |
| `GET` | `/api/Reports/customer-statement/{loanId}/export-csv` | `Permission:LOAN_VIEW` | Export loan statement to CSV |
| `GET` | `/api/Reports/repayments` | `Permission:REPAYMENT_VIEW` | Repayment collection report |
| `GET` | `/api/Reports/repayments/export-csv` | `Permission:REPAYMENT_VIEW` | Export repayments to CSV |
| `GET` | `/api/Reports/outstanding` | `Permission:LOAN_VIEW` | Outstanding loan portfolio |
| `GET` | `/api/Reports/outstanding/export-csv` | `Permission:LOAN_VIEW` | Export outstanding report to CSV |
| `GET` | `/api/Reports/pending-installments` | `Permission:REPAYMENT_VIEW` | Upcoming pending installments |
| `GET` | `/api/Reports/pending-installments/export-csv`| `Permission:REPAYMENT_VIEW` | Export pending installments to CSV |
| `GET` | `/api/Reports/overdue-installments` | `Permission:REPAYMENT_VIEW` | Overdue installments report |
| `GET` | `/api/Reports/overdue-installments/export-csv`| `Permission:REPAYMENT_VIEW` | Export overdue installments to CSV |
| `GET` | `/api/Reports/disbursements` | `Permission:LOAN_VIEW` | Loan disbursement ledger |
| `GET` | `/api/Reports/disbursements/export-csv` | `Permission:LOAN_VIEW` | Export disbursement ledger to CSV |

### Audit Logs (`AuditLogsController`)
| HTTP Method | Route | Permission / Policy | Description |
|---|---|---|---|
| `GET` | `/api/AuditLogs` | Admin Only (`Roles = "ADMIN"`) | Full audit trail with action, entity, user & IP |

---

## 9. IIS Deployment Guide (Windows Server)

### Step 1: Install ASP.NET Core Hosting Bundle
Download and install the **.NET Core Hosting Bundle (v8.0)** on the Windows Server:
- Enables IIS `AspNetCoreModuleV2`.
- Run in PowerShell after installation:
  ```powershell
  net stop was /y
  net start w3svc
  ```

### Step 2: Publish the API Project
Publish the API in Release mode:
```powershell
dotnet publish Backend/LMS.API/LMS.API.csproj -c Release -o C:\inetpub\wwwroot\lms-api
```

### Step 3: Configure IIS Application Pool & Website
1. Open **IIS Manager (`inetmgr`)**.
2. Add Application Pool:
   - Name: `LmsApiPool`
   - .NET CLR Version: `No Managed Code`
   - Managed Pipeline Mode: `Integrated`
3. Add Website:
   - Site Name: `LMS.API`
   - Physical Path: `C:\inetpub\wwwroot\lms-api`
   - Port: `80` (or `443` with SSL)
   - Application Pool: `LmsApiPool`

### Step 4: Storage Directory Permissions
Grant `IIS AppPool\LmsApiPool` (or `IUSR`) Modify permissions on the upload folder:
```powershell
icacls "C:\inetpub\wwwroot\lms-api\wwwroot\uploads" /grant "IIS AppPool\LmsApiPool":(OI)(CI)M
```

---

## 10. Security & Best Practices Verified
- **No Physical Paths Exposed**: File downloads use streamed byte arrays with MIME headers.
- **Strict Role Scoping**: Customers can never query other customers' loans, applications, documents, or repayments.
- **ACID Financial Transactions**: Payment verification and loan disbursements run in explicit database transactions with serializable concurrency protection.
- **Audit Logging**: Important events automatically record actor ID, action, entity, timestamp, and client IP without recording sensitive credentials.
- **Zero Schema Breaking Changes**: Extends existing Entity Framework Core Code First models without breaking existing schema or requiring destructive migrations.
