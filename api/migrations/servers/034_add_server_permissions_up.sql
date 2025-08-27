INSERT INTO permissions (id, name, description, resource, created_at, updated_at) VALUES
(uuid_generate_v4(), 'create', 'Create servers', 'server', NOW(), NOW()),
(uuid_generate_v4(), 'read', 'Read servers', 'server', NOW(), NOW()),
(uuid_generate_v4(), 'update', 'Update servers', 'server', NOW(), NOW()),
(uuid_generate_v4(), 'delete', 'Delete servers', 'server', NOW(), NOW());

WITH admin_role AS (
    SELECT id FROM roles WHERE name = 'admin'
)
INSERT INTO role_permissions (id, role_id, permission_id, created_at, updated_at)
SELECT uuid_generate_v4(), admin_role.id, permissions.id, NOW(), NOW()
FROM admin_role, permissions
WHERE permissions.resource = 'server';

WITH viewer_role AS (
    SELECT id FROM roles WHERE name = 'viewer'
),
read_permissions AS (
    SELECT id FROM permissions 
    WHERE name = 'read' 
    AND resource = 'server'
)
INSERT INTO role_permissions (id, role_id, permission_id, created_at, updated_at)
SELECT uuid_generate_v4(), viewer_role.id, read_permissions.id, NOW(), NOW()
FROM viewer_role, read_permissions;

WITH member_role AS (
    SELECT id FROM roles WHERE name = 'member'
),
member_permissions AS (
    SELECT id FROM permissions 
    WHERE name = 'read'
    AND resource = 'server'
)
INSERT INTO role_permissions (id, role_id, permission_id, created_at, updated_at)
SELECT uuid_generate_v4(), member_role.id, member_permissions.id, NOW(), NOW()
FROM member_role, member_permissions;

INSERT INTO feature_flags (id, organization_id, feature_name, is_enabled, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    o.id,
    'server',
    true,
    NOW(),
    NOW()
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM feature_flags ff 
    WHERE ff.organization_id = o.id 
    AND ff.feature_name = 'server'
);
