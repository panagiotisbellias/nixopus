CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to generate server names
CREATE OR REPLACE FUNCTION generate_server_name() RETURNS VARCHAR(255) AS $$
DECLARE
    prefixes TEXT[] := ARRAY['web', 'api', 'db', 'app', 'srv', 'node', 'host', 'prod', 'dev', 'stage'];
    suffixes TEXT[] := ARRAY['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa'];
    numbers TEXT[] := ARRAY['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
    prefix TEXT;
    suffix TEXT;
    number TEXT;
BEGIN
    prefix := prefixes[1 + floor(random() * array_length(prefixes, 1))::int];
    suffix := suffixes[1 + floor(random() * array_length(suffixes, 1))::int];
    number := numbers[1 + floor(random() * array_length(numbers, 1))::int];
    
    RETURN prefix || '-' || suffix || '-' || number;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT generate_server_name(),
    description TEXT DEFAULT 'Auto Generated Server',
    host VARCHAR(255) NOT NULL DEFAULT 'localhost',
    port INT NOT NULL DEFAULT 22,
    username VARCHAR(255) NOT NULL DEFAULT 'root',
    ssh_password VARCHAR(255),
    ssh_private_key_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT ssh_auth_check CHECK (
        (ssh_password IS NOT NULL AND ssh_private_key_path IS NULL) OR
        (ssh_password IS NULL AND ssh_private_key_path IS NOT NULL)
    )
);

CREATE INDEX idx_servers_user_id ON servers(user_id);
CREATE INDEX idx_servers_organization_id ON servers(organization_id);
