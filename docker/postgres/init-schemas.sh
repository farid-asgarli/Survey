#!/bin/bash

set -e
set -u

# This script creates all required schemas for the SurveyApp database
# Schemas provide logical separation of database objects

echo "Creating database schemas..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Identity schema for ASP.NET Identity tables
    CREATE SCHEMA IF NOT EXISTS identity;
    
    -- Core schema for main business entities (Users, Namespaces, etc.)
    CREATE SCHEMA IF NOT EXISTS core;
    
    -- Survey schema for survey-related entities
    CREATE SCHEMA IF NOT EXISTS survey;
    
    -- Templates schema for reusable survey templates
    CREATE SCHEMA IF NOT EXISTS templates;
    
    -- Themes schema for survey themes and branding
    CREATE SCHEMA IF NOT EXISTS themes;
    
    -- Distribution schema for email distribution entities
    CREATE SCHEMA IF NOT EXISTS distribution;
    
    -- Scheduling schema for recurring survey entities
    CREATE SCHEMA IF NOT EXISTS scheduling;
    
    -- Internationalization schema for all translation entities
    CREATE SCHEMA IF NOT EXISTS i18n;
    
    -- Grant all privileges on schemas to postgres user
    GRANT ALL ON SCHEMA identity TO postgres;
    GRANT ALL ON SCHEMA core TO postgres;
    GRANT ALL ON SCHEMA survey TO postgres;
    GRANT ALL ON SCHEMA templates TO postgres;
    GRANT ALL ON SCHEMA themes TO postgres;
    GRANT ALL ON SCHEMA distribution TO postgres;
    GRANT ALL ON SCHEMA scheduling TO postgres;
    GRANT ALL ON SCHEMA i18n TO postgres;
    
    -- Set search path to include all schemas
    ALTER DATABASE $POSTGRES_DB SET search_path TO public, core, survey, templates, themes, distribution, scheduling, i18n, identity;
EOSQL

echo "Database schemas created successfully!"
