DROP TRIGGER IF EXISTS trigger_ensure_single_active_server ON servers;
DROP FUNCTION IF EXISTS ensure_single_active_server();

DROP INDEX IF EXISTS idx_servers_org_status;
DROP INDEX IF EXISTS idx_servers_status;
DROP INDEX IF EXISTS idx_servers_active_per_org;


ALTER TABLE servers DROP CONSTRAINT IF EXISTS check_server_status;

ALTER TABLE servers DROP COLUMN IF EXISTS status;