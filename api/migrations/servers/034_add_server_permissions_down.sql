DELETE FROM feature_flags
WHERE feature_name = 'server';

DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions WHERE resource = 'server'
);

DELETE FROM permissions
WHERE resource = 'server';
