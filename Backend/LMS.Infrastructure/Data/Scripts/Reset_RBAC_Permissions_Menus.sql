-- =========================================================================================
-- LMS RESET & SEED SCRIPT: ROLES, MENUS, PERMISSIONS & ROLE ASSIGNMENTS
-- Target DB: LoanManagementSystemDb
-- Description:
--   1. Identifies the Admin User (or defaults to 1).
--   2. Clears existing RoleMenus, RolePermissions, UserMenus, and UserPermissions.
--   3. Synchronizes standard Roles (ADMIN, MANAGER, LOAN_OFFICER, CUSTOMER).
--   4. Inserts/updates standardized Menus with icons, routes, display order.
--   5. Inserts/updates all 33 backend Permissions mapped to their corresponding MenuId.
--   6. Generates full RoleMenus and RolePermissions assignments.
--   7. All created/updated records have CreatedBy = @AdminUserId (or 1).
-- =========================================================================================

SET NOCOUNT ON;
BEGIN TRANSACTION;

BEGIN TRY
    -- -------------------------------------------------------------------------------------
    -- 1. Identify Admin User ID (or default to 1)
    -- -------------------------------------------------------------------------------------
    DECLARE @AdminUserId INT = 1;

    SELECT TOP 1 @AdminUserId = u.Id
    FROM Users u
    INNER JOIN Roles r ON u.RoleId = r.Id
    WHERE r.[Key] = 'ADMIN' AND u.IsDeleted = 0;

    IF @AdminUserId IS NULL
        SET @AdminUserId = 1;

    DECLARE @Now DATETIME2 = GETUTCDATE();

    PRINT '>>> Setting up system RBAC using Admin User ID: ' + CAST(@AdminUserId AS VARCHAR(10));

    -- -------------------------------------------------------------------------------------
    -- 2. Clear existing junction mappings (clean slate)
    -- -------------------------------------------------------------------------------------
    PRINT '>>> Clearing existing Role & User Menu/Permission assignments...';

    DELETE FROM UserPermissions;
    DELETE FROM UserMenus;
    DELETE FROM RolePermissions;
    DELETE FROM RoleMenus;

    -- -------------------------------------------------------------------------------------
    -- 3. Upsert Roles
    -- -------------------------------------------------------------------------------------
    PRINT '>>> Synchronizing Roles...';

    DECLARE @RolesTable TABLE (
        [Key] NVARCHAR(100),
        [Name] NVARCHAR(100),
        [Description] NVARCHAR(500)
    );

    INSERT INTO @RolesTable ([Key], [Name], [Description])
    VALUES
        ('ADMIN', 'System Administrator', 'Full system access and security governance.'),
        ('MANAGER', 'Branch / Credit Manager', 'Oversees loan pipeline, case assignments, approvals, disbursements, and payment verifications.'),
        ('OFFICER', 'Loan Officer', 'Evaluates applications, reviews files, verifies documents, and manages loan processing.'),
        ('CUSTOMER', 'Customer / Borrower', 'Applicant who applies for loans, uploads documents, tracks status, and submits repayments.');

    -- Upsert Roles
    MERGE Roles AS target
    USING @RolesTable AS source
    ON target.[Key] = source.[Key]
    WHEN MATCHED THEN
        UPDATE SET 
            target.[Name] = source.[Name],
            target.[Description] = source.[Description],
            target.IsActive = 1,
            target.IsDeleted = 0,
            target.UpdatedAt = @Now,
            target.UpdatedBy = @AdminUserId
    WHEN NOT MATCHED THEN
        INSERT ([Key], [Name], [Description], IsActive, CreatedAt, CreatedBy, IsDeleted)
        VALUES (source.[Key], source.[Name], source.[Description], 1, @Now, @AdminUserId, 0);

    -- -------------------------------------------------------------------------------------
    -- 4. Upsert Menus
    -- -------------------------------------------------------------------------------------
    PRINT '>>> Synchronizing Menus...';

    DECLARE @MenusTable TABLE (
        [Key] NVARCHAR(100),
        [Name] NVARCHAR(100),
        [Route] NVARCHAR(250),
        [Icon] NVARCHAR(100),
        [DisplayOrder] INT
    );

    INSERT INTO @MenusTable ([Key], [Name], [Route], [Icon], [DisplayOrder])
    VALUES
        ('DASHBOARD', 'Dashboard', '/dashboard', 'dashboard', 1),
        ('LOAN_APPLICATIONS', 'Loan Applications', '/loan-applications', 'file-text', 2),
        ('LOANS', 'Active Loans', '/loans', 'wallet', 3),
        ('REPAYMENTS', 'Repayments', '/repayments', 'credit-card', 4),
        ('LOAN_DOCUMENTS', 'Loan Documents', '/loan-documents', 'folder', 5),
        ('LOAN_GUARANTORS', 'Guarantors', '/loan-guarantors', 'user-check', 6),
        ('REPORTS', 'Reports & Analytics', '/reports', 'list-checks', 7),
        ('LOAN_TYPES', 'Loan Products', '/loan-types', 'layers', 8),
        ('STATUSES', 'Workflow Statuses', '/statuses', 'settings', 9),
        ('USERS', 'Users Management', '/users', 'users', 10),
        ('ROLES', 'Roles', '/roles', 'shield-check', 11),
        ('ROLE_PERMISSIONS', 'Role Permissions', '/role-permissions', 'shield-check', 12),
        ('USER_PERMISSIONS', 'User Permissions', '/user-permissions', 'shield-check', 13),
        ('PERMISSIONS', 'Permissions', '/permissions', 'key-round', 14),
        ('MENUS', 'Menu Settings', '/menus', 'settings', 15),
        ('ROLE_MENUS', 'Role Menus', '/role-menus', 'settings', 16),
        ('USER_MENUS', 'User Menus', '/user-menus', 'settings', 17),
        ('AUDIT_LOGS', 'Audit Logs', '/audit-logs', 'history', 18);

    MERGE Menus AS target
    USING @MenusTable AS source
    ON target.[Key] = source.[Key]
    WHEN MATCHED THEN
        UPDATE SET 
            target.[Name] = source.[Name],
            target.[Route] = source.[Route],
            target.[Icon] = source.[Icon],
            target.[DisplayOrder] = source.[DisplayOrder],
            target.IsActive = 1,
            target.IsDeleted = 0,
            target.UpdatedAt = @Now,
            target.UpdatedBy = @AdminUserId
    WHEN NOT MATCHED THEN
        INSERT ([Key], [Name], [Route], [Icon], [DisplayOrder], IsActive, CreatedAt, CreatedBy, IsDeleted)
        VALUES (source.[Key], source.[Name], source.[Route], source.[Icon], source.[DisplayOrder], 1, @Now, @AdminUserId, 0);

    -- -------------------------------------------------------------------------------------
    -- 5. Upsert Permissions (with MenuId linking)
    -- -------------------------------------------------------------------------------------
    PRINT '>>> Synchronizing Permissions...';

    DECLARE @PermissionsTable TABLE (
        [Key] NVARCHAR(100),
        [Name] NVARCHAR(150),
        [Description] NVARCHAR(500),
        [MenuKey] NVARCHAR(100)
    );

    INSERT INTO @PermissionsTable ([Key], [Name], [Description], [MenuKey])
    VALUES
        -- Dashboard
        ('DASHBOARD_VIEW', 'View Dashboard', 'Access dashboard summary metrics, KPIs, and portfolio charts.', 'DASHBOARD'),

        -- Applications
        ('LOAN_APPLICATION_CREATE', 'Create Loan Application', 'Submit new loan application.', 'LOAN_APPLICATIONS'),
        ('LOAN_APPLICATION_UPDATE', 'Update Loan Application', 'Update existing loan application details.', 'LOAN_APPLICATIONS'),
        ('LOAN_APPLICATION_VIEW', 'View Loan Applications', 'Browse and inspect loan applications.', 'LOAN_APPLICATIONS'),
        ('LOAN_APPLICATION_REVIEW', 'Review Loan Applications', 'Perform underwriting review and recommend decision.', 'LOAN_APPLICATIONS'),
        ('LOAN_APPLICATION_ASSIGN', 'Assign Loan Applications', 'Assign applications to loan officers.', 'LOAN_APPLICATIONS'),
        ('LOAN_APPLICATION_APPROVE', 'Approve Loan Application', 'Final credit approval of loan application.', 'LOAN_APPLICATIONS'),
        ('LOAN_APPLICATION_REJECT', 'Reject Loan Application', 'Final rejection of loan application.', 'LOAN_APPLICATIONS'),

        -- Documents
        ('LOAN_DOCUMENT_CREATE', 'Create Loan Document', 'Register and initialize borrower documents.', 'LOAN_DOCUMENTS'),
        ('LOAN_DOCUMENT_UPLOAD', 'Upload Loan Documents', 'Upload borrower identification and income proofs.', 'LOAN_DOCUMENTS'),
        ('LOAN_DOCUMENT_VIEW', 'View Loan Documents', 'Inspect and download applicant documentation.', 'LOAN_DOCUMENTS'),
        ('LOAN_DOCUMENT_VERIFY', 'Verify Loan Document', 'Review and approve submitted borrower documents.', 'LOAN_DOCUMENTS'),
        ('LOAN_DOCUMENT_REJECT', 'Reject Loan Document', 'Reject invalid or insufficient documents.', 'LOAN_DOCUMENTS'),

        -- Guarantors
        ('LOAN_GUARANTOR_MANAGE', 'Manage Loan Guarantors', 'Add, update, or remove loan guarantors.', 'LOAN_GUARANTORS'),

        -- Loans & Disbursement
        ('LOAN_DISBURSE', 'Disburse Loans', 'Execute disbursement and initiate amortization schedule.', 'LOANS'),
        ('LOAN_VIEW', 'View Loans', 'Inspect active and closed loan accounts.', 'LOANS'),
        ('LOAN_MANAGE', 'Manage Loans', 'Modify loan terms, statuses, or configurations.', 'LOANS'),

        -- Repayments
        ('REPAYMENT_SCHEDULE_VIEW', 'View Repayment Schedule', 'Inspect installment schedules and due dates.', 'REPAYMENTS'),
        ('REPAYMENT_CREATE', 'Submit Repayment', 'Record an installment payment receipt.', 'REPAYMENTS'),
        ('REPAYMENT_VIEW', 'View Repayments', 'Browse repayment transaction records.', 'REPAYMENTS'),
        ('REPAYMENT_VERIFY', 'Verify Repayments', 'Approve or reject customer submitted payments.', 'REPAYMENTS'),
        ('REPAYMENT_MANAGE', 'Manage Repayments', 'Adjust, waive, or manage repayment entries.', 'REPAYMENTS'),

        -- Audit Logs
        ('AUDIT_LOG_VIEW', 'View Audit Logs', 'Browse and inspect security and system audit logs.', 'AUDIT_LOGS'),

        -- Loan Types
        ('LOAN_TYPE_VIEW', 'View Loan Types', 'Browse active loan schemes and interest parameters.', 'LOAN_TYPES'),
        ('LOAN_TYPE_MANAGE', 'Manage Loan Types', 'Create, update, and manage loan products.', 'LOAN_TYPES'),

        -- Users
        ('USER_VIEW', 'View Users', 'Browse user accounts in the directory.', 'USERS'),
        ('USER_CREATE', 'Create Users', 'Create new staff or customer user profiles.', 'USERS'),
        ('USER_UPDATE', 'Update Users', 'Edit user information, status, and role.', 'USERS'),
        ('USER_DELETE', 'Delete Users', 'Deactivate or soft-delete user accounts.', 'USERS'),

        -- Roles
        ('ROLE_VIEW', 'View Roles', 'Browse system roles.', 'ROLES'),
        ('ROLE_MANAGE', 'Manage Roles', 'Create and modify role profiles.', 'ROLES'),
        ('ROLE_DELETE', 'Delete Roles', 'Deactivate system roles.', 'ROLES'),

        -- Permissions & Overrides
        ('PERMISSION_VIEW', 'View Permissions', 'Inspect system permissions catalog.', 'PERMISSIONS'),
        ('PERMISSION_MANAGE', 'Manage Permissions', 'Modify system permission catalog.', 'PERMISSIONS'),
        ('ROLE_PERMISSION_VIEW', 'View Role Permissions', 'Inspect role-permission mapping matrix.', 'ROLE_PERMISSIONS'),
        ('USER_PERMISSION_VIEW', 'View User Permissions', 'Inspect individual user-permission overrides.', 'USER_PERMISSIONS'),

        -- Menus
        ('MENU_VIEW', 'View Menus', 'Inspect navigation menu catalog.', 'MENUS'),
        ('MENU_MANAGE', 'Manage Menus', 'Create and modify navigation items.', 'MENUS'),
        ('ROLE_MENU_VIEW', 'View Role Menus', 'Inspect role-menu access mapping.', 'ROLE_MENUS'),
        ('USER_MENU_VIEW', 'View User Menus', 'Inspect user-menu override mapping.', 'USER_MENUS'),

        -- Statuses
        ('STATUS_MANAGE', 'Manage Statuses', 'Configure workflow lifecycle status definitions.', 'STATUSES');

    MERGE Permissions AS target
    USING (
        SELECT pt.[Key], pt.[Name], pt.[Description], m.Id AS MenuId
        FROM @PermissionsTable pt
        LEFT JOIN Menus m ON pt.MenuKey = m.[Key]
    ) AS source
    ON target.[Key] = source.[Key]
    WHEN MATCHED THEN
        UPDATE SET 
            target.[Name] = source.[Name],
            target.[Description] = source.[Description],
            target.MenuId = source.MenuId,
            target.IsActive = 1,
            target.IsDeleted = 0,
            target.UpdatedAt = @Now,
            target.UpdatedBy = @AdminUserId
    WHEN NOT MATCHED THEN
        INSERT ([Key], [Name], [Description], MenuId, IsActive, CreatedAt, CreatedBy, IsDeleted)
        VALUES (source.[Key], source.[Name], source.[Description], source.MenuId, 1, @Now, @AdminUserId, 0);

    -- -------------------------------------------------------------------------------------
    -- 6. Assign RoleMenus
    -- -------------------------------------------------------------------------------------
    PRINT '>>> Assigning Role Menus...';

    DECLARE @RoleMenusMap TABLE (
        RoleKey NVARCHAR(100),
        MenuKey NVARCHAR(100)
    );

    -- ADMIN: All 18 Menus
    INSERT INTO @RoleMenusMap (RoleKey, MenuKey)
    SELECT 'ADMIN', [Key] FROM @MenusTable;

    -- MANAGER: 8 Operational Menus
    INSERT INTO @RoleMenusMap (RoleKey, MenuKey)
    VALUES
        ('MANAGER', 'DASHBOARD'),
        ('MANAGER', 'LOAN_APPLICATIONS'),
        ('MANAGER', 'LOANS'),
        ('MANAGER', 'REPAYMENTS'),
        ('MANAGER', 'LOAN_DOCUMENTS'),
        ('MANAGER', 'LOAN_GUARANTORS'),
        ('MANAGER', 'REPORTS'),
        ('MANAGER', 'LOAN_TYPES');

    -- OFFICER: 8 Operational Menus
    INSERT INTO @RoleMenusMap (RoleKey, MenuKey)
    VALUES
        ('OFFICER', 'DASHBOARD'),
        ('OFFICER', 'LOAN_APPLICATIONS'),
        ('OFFICER', 'LOAN_DOCUMENTS'),
        ('OFFICER', 'LOAN_GUARANTORS'),
        ('OFFICER', 'LOANS'),
        ('OFFICER', 'REPAYMENTS'),
        ('OFFICER', 'REPORTS'),
        ('OFFICER', 'LOAN_TYPES');

    -- Also support alias 'LOAN_OFFICER' if present
    INSERT INTO @RoleMenusMap (RoleKey, MenuKey)
    SELECT 'LOAN_OFFICER', MenuKey FROM @RoleMenusMap WHERE RoleKey = 'OFFICER';

    -- CUSTOMER: 8 Borrower Menus
    INSERT INTO @RoleMenusMap (RoleKey, MenuKey)
    VALUES
        ('CUSTOMER', 'DASHBOARD'),
        ('CUSTOMER', 'LOAN_APPLICATIONS'),
        ('CUSTOMER', 'LOANS'),
        ('CUSTOMER', 'REPAYMENTS'),
        ('CUSTOMER', 'LOAN_DOCUMENTS'),
        ('CUSTOMER', 'LOAN_GUARANTORS'),
        ('CUSTOMER', 'REPORTS'),
        ('CUSTOMER', 'LOAN_TYPES');

    -- Insert into RoleMenus
    INSERT INTO RoleMenus (RoleId, MenuId, CreatedAt, CreatedBy, IsDeleted)
    SELECT r.Id, m.Id, @Now, @AdminUserId, 0
    FROM @RoleMenusMap rm
    INNER JOIN Roles r ON rm.RoleKey = r.[Key] AND r.IsDeleted = 0
    INNER JOIN Menus m ON rm.MenuKey = m.[Key] AND m.IsDeleted = 0;

    -- -------------------------------------------------------------------------------------
    -- 7. Assign RolePermissions
    -- -------------------------------------------------------------------------------------
    PRINT '>>> Assigning Role Permissions...';

    DECLARE @RolePermsMap TABLE (
        RoleKey NVARCHAR(100),
        PermKey NVARCHAR(100)
    );

    -- ADMIN: All 33 Permissions
    INSERT INTO @RolePermsMap (RoleKey, PermKey)
    SELECT 'ADMIN', [Key] FROM @PermissionsTable;

    -- MANAGER: 16 Permissions
    INSERT INTO @RolePermsMap (RoleKey, PermKey)
    VALUES
        ('MANAGER', 'DASHBOARD_VIEW'),
        ('MANAGER', 'LOAN_APPLICATION_VIEW'),
        ('MANAGER', 'LOAN_APPLICATION_ASSIGN'),
        ('MANAGER', 'LOAN_APPLICATION_REVIEW'),
        ('MANAGER', 'LOAN_APPLICATION_APPROVE'),
        ('MANAGER', 'LOAN_APPLICATION_REJECT'),
        ('MANAGER', 'LOAN_DOCUMENT_VIEW'),
        ('MANAGER', 'LOAN_DOCUMENT_UPLOAD'),
        ('MANAGER', 'LOAN_DISBURSE'),
        ('MANAGER', 'LOAN_VIEW'),
        ('MANAGER', 'REPAYMENT_SCHEDULE_VIEW'),
        ('MANAGER', 'REPAYMENT_VIEW'),
        ('MANAGER', 'REPAYMENT_VERIFY'),
        ('MANAGER', 'REPAYMENT_CREATE'),
        ('MANAGER', 'LOAN_TYPE_VIEW'),
        ('MANAGER', 'USER_VIEW');

    -- OFFICER: 16 Permissions (including all document verification and loan processing)
    INSERT INTO @RolePermsMap (RoleKey, PermKey)
    VALUES
        ('OFFICER', 'DASHBOARD_VIEW'),
        ('OFFICER', 'LOAN_APPLICATION_VIEW'),
        ('OFFICER', 'LOAN_APPLICATION_REVIEW'),
        ('OFFICER', 'LOAN_DOCUMENT_VIEW'),
        ('OFFICER', 'LOAN_DOCUMENT_UPLOAD'),
        ('OFFICER', 'LOAN_DOCUMENT_CREATE'),
        ('OFFICER', 'LOAN_DOCUMENT_VERIFY'),
        ('OFFICER', 'LOAN_DOCUMENT_REJECT'),
        ('OFFICER', 'LOAN_GUARANTOR_MANAGE'),
        ('OFFICER', 'LOAN_VIEW'),
        ('OFFICER', 'REPAYMENT_SCHEDULE_VIEW'),
        ('OFFICER', 'REPAYMENT_VIEW'),
        ('OFFICER', 'REPAYMENT_CREATE'),
        ('OFFICER', 'REPAYMENT_VERIFY'),
        ('OFFICER', 'LOAN_TYPE_VIEW'),
        ('OFFICER', 'USER_VIEW');

    -- Also support alias 'LOAN_OFFICER' if present
    INSERT INTO @RolePermsMap (RoleKey, PermKey)
    SELECT 'LOAN_OFFICER', PermKey FROM @RolePermsMap WHERE RoleKey = 'OFFICER';

    -- CUSTOMER: 10 Permissions
    INSERT INTO @RolePermsMap (RoleKey, PermKey)
    VALUES
        ('CUSTOMER', 'DASHBOARD_VIEW'),
        ('CUSTOMER', 'LOAN_APPLICATION_CREATE'),
        ('CUSTOMER', 'LOAN_APPLICATION_VIEW'),
        ('CUSTOMER', 'LOAN_DOCUMENT_UPLOAD'),
        ('CUSTOMER', 'LOAN_DOCUMENT_VIEW'),
        ('CUSTOMER', 'LOAN_VIEW'),
        ('CUSTOMER', 'REPAYMENT_SCHEDULE_VIEW'),
        ('CUSTOMER', 'REPAYMENT_CREATE'),
        ('CUSTOMER', 'REPAYMENT_VIEW'),
        ('CUSTOMER', 'LOAN_TYPE_VIEW');

    -- Insert into RolePermissions
    INSERT INTO RolePermissions (RoleId, PermissionId, CreatedAt, CreatedBy, IsDeleted)
    SELECT r.Id, p.Id, @Now, @AdminUserId, 0
    FROM @RolePermsMap rpm
    INNER JOIN Roles r ON rpm.RoleKey = r.[Key] AND r.IsDeleted = 0
    INNER JOIN Permissions p ON rpm.PermKey = p.[Key] AND p.IsDeleted = 0;

    -- Ensure ADMIN always receives ALL active Permissions by default
    INSERT INTO RolePermissions (RoleId, PermissionId, CreatedAt, CreatedBy, IsDeleted)
    SELECT r.Id, p.Id, @Now, @AdminUserId, 0
    FROM Roles r
    CROSS JOIN Permissions p
    WHERE r.[Key] = 'ADMIN' 
      AND r.IsDeleted = 0 
      AND p.IsActive = 1 
      AND p.IsDeleted = 0
      AND NOT EXISTS (
          SELECT 1 FROM RolePermissions rp 
          WHERE rp.RoleId = r.Id AND rp.PermissionId = p.Id AND rp.IsDeleted = 0
      );

    COMMIT TRANSACTION;
    PRINT '>>> SUCCESS! RBAC roles, menus, and permissions reset and synced perfectly.';

    -- -------------------------------------------------------------------------------------
    -- Verification Query Results
    -- -------------------------------------------------------------------------------------
    SELECT r.[Key] AS RoleKey, COUNT(DISTINCT rp.PermissionId) AS AssignedPermissions, COUNT(DISTINCT rm.MenuId) AS AssignedMenus
    FROM Roles r
    LEFT JOIN RolePermissions rp ON r.Id = rp.RoleId AND rp.IsDeleted = 0
    LEFT JOIN RoleMenus rm ON r.Id = rm.RoleId AND rm.IsDeleted = 0
    WHERE r.IsDeleted = 0
    GROUP BY r.[Key]
    ORDER BY AssignedPermissions DESC;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    PRINT '>>> ERROR ENCOUNTERED: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
