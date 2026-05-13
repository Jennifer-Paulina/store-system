FROM mcr.microsoft.com/mssql/server:2022-latest

USER root
COPY init-sqlserver.sql /init-sqlserver.sql
COPY init-sqlserver-entrypoint.sh /init-sqlserver-entrypoint.sh
RUN chmod +x /init-sqlserver-entrypoint.sh

USER mssql
ENTRYPOINT ["/bin/bash", "/init-sqlserver-entrypoint.sh"]