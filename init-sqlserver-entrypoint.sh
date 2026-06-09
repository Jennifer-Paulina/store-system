#!/bin/bash

/opt/mssql/bin/sqlservr &
SQLSERVER_PID=$!

echo "Esperando a SQL Server..."
until /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT 1" > /dev/null 2>&1; do
    echo "SQL Server no está listo, esperando..."
    sleep 5
done

echo "Ejecutando script de inicialización..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -i /init-sqlserver.sql

echo "Inicialización completada."
wait $SQLSERVER_PID