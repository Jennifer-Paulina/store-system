-- Crear usuario replicador si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname =
'replicator') THEN
    CREATE USER replicator WITH REPLICATION;
  END IF;
END
$$;