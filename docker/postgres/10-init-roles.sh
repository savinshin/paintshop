#!/usr/bin/env bash

# The image may source non-executable init scripts; keep shell options local.
(
    set +x
    set -Eeuo pipefail

    for secret in paintshop_migrator_password paintshop_app_password; do
        if [[ ! -r "/run/secrets/$secret" ]]; then
            printf 'Cannot read required secret: %s\n' "$secret" >&2
            exit 1
        fi
    done

    migrator_password=$(< /run/secrets/paintshop_migrator_password)
    app_password=$(< /run/secrets/paintshop_app_password)

    # The documented generator produces fixed-length hex, safe for psql's
    # variable syntax and without whitespace or metacharacters.
    if [[ ! "$migrator_password" =~ ^[0-9a-f]{64}$ || ! "$app_password" =~ ^[0-9a-f]{64}$ ]]; then
        printf 'Role secrets must contain exactly 64 lowercase hexadecimal characters.\n' >&2
        exit 1
    fi

    if ! {
        printf '\\set migrator_password %s\n' "$migrator_password"
        printf '\\set app_password %s\n' "$app_password"
        cat <<'SQL'
SET log_statement = 'none';
SET log_min_duration_statement = -1;
SET log_duration = off;
SET log_min_error_statement = 'panic';
CREATE ROLE paintshop_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD :'migrator_password';
CREATE ROLE paintshop_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD :'app_password';
\unset migrator_password
\unset app_password
ALTER DATABASE paintshop OWNER TO paintshop_migrator;
REVOKE ALL ON DATABASE paintshop FROM PUBLIC;
GRANT CONNECT ON DATABASE paintshop TO paintshop_migrator, paintshop_app;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO paintshop_app;
SQL
    } | psql -X -q --no-password -v ON_ERROR_STOP=1 --single-transaction --file=- \
        --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" >/dev/null 2>&1; then
        printf 'Role initialization failed. Do not restart until the database state has been inspected.\n' >&2
        exit 1
    fi

    unset migrator_password app_password
)
