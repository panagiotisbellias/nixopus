DROP INDEX IF EXISTS idx_servers_organization_id;
DROP INDEX IF EXISTS idx_servers_user_id;

DROP TABLE IF EXISTS servers;
DROP FUNCTION IF EXISTS generate_server_name();
