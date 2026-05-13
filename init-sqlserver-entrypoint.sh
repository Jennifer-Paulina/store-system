#!/bin/bash

/opt/mssql/bin/sqlservr &
SQLSERVER_PID=$!

echo "Esperando a SQL Server..."
sleep 45

echo "Ejecutando script de inicialización..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -i /init-sqlserver.sql

echo "Inicialización completada."
wait $SQLSERVER_PID