ALTER TABLE servers ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'inactive';

ALTER TABLE servers ADD CONSTRAINT check_server_status CHECK (status IN ('active', 'inactive', 'maintenance'));

-- unique partial index to ensure only one active server per organization
CREATE UNIQUE INDEX idx_servers_active_per_org 
ON servers(organization_id) 
WHERE status = 'active' AND deleted_at IS NULL;

-- Function to automatically set other servers to inactive when one becomes active
CREATE OR REPLACE FUNCTION ensure_single_active_server() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND NEW.deleted_at IS NULL THEN
        UPDATE servers 
        SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = NEW.organization_id 
          AND id != NEW.id 
          AND status = 'active' 
          AND deleted_at IS NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single active server per organization
CREATE TRIGGER trigger_ensure_single_active_server
    BEFORE INSERT OR UPDATE ON servers
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_server();


CREATE INDEX idx_servers_status ON servers(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_servers_org_status ON servers(organization_id, status) WHERE deleted_at IS NULL;
