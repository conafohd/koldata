# Kongo Local Data

The KolData platform is developed by Cartong for the [Conafohd](https://conafohd.org)

# 🛠️ Tech Stack

## Frontend

- **_Vue 3_**- JavaScript framework with Composition API and TypeScript
- **Vue Router** - Official routing for Vue.js
- **Pinia** - State management store for Vue
- **Vuetify** - Material Design UI framework for Vue
- **Vue I18n** - Internationalization plugin for Vue.js
- **Zod/Vee-validate** - Forms validation
- **Supabase SDK** - JavaScript client for Supabase integration

## Backend

- **Supabase** - Open source Backend-as-a-Service (BaaS) platform
- **PostGIS** - PostgreSQL extension for geospatial data

# Project Setup

- Set the VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY env variables in a env.local file

```sh
npm install
npm run dev
```

# 📁 Frontend Architecture

### Directory Structure:

- **Views/Components** - Page views and components related to these views
- **Models** - TypeScript enums and interfaces, selector lists via translation files
- **Generic Components** - Shared/common components across the application
- **Plugins** - Vue plugins configuration and setup
- **Router** - Application routing configuration
- **Services** - Business logic and data processing services
- **Stores** - Pinia state management stores

### Data Flow Organization

```
Views ↔ Stores ↔ External Call Services ↔ API
Components ↔ Processing Data Services
```

### Architecture Pattern:

- Views communicate with Stores for shared state management
- Stores handle External Call Services for API interactions
- Components use Processing Data Services for data manipulation
- Clear separation between UI, state, and business logic layers

# 🗄️ Backend Architecture - Supabase

## **Database Tables:**

_Tables referenced via frontend enums_

- users_profiles: Extends Supabase Auth table with 3 user roles: reader / editor / admin
- associations: Public table containing validated NGO data, admin-only write access
- associations_maj: Private staging table for NGO updates submitted by editors
- projets: Public table containing validated project data, admin-only write access
- projets_maj: Private staging table for project updates submitted by editors
- projets_new: Private staging table for new projects created by NGO editors

**Staging Tables Workflow**:

Editors submit to staging tables → Admin reviews and validates → Data merged to public tables → Staging entries deleted

## Row Level Security (RLS)

**Policies ensure:**

- Only admins can write to public tables
- Editors can only write to staging tables for their assigned NGOs
- Editors can only read their own staging table entries

**Data Flow Cycle**

```
Admin → Direct write to source tables
Editor → Write to update/new tables → Admin validation → Merge to public tables
```

## **PostgreSQL Functions**

- is_admin - Verifies if user has admin role
- handle_new_user - On user registration, auto-assigns editor role if email matches NGO's editing contact
- can_edit_association - Verifies user has editor role for specific NGO
- submit_association_update - Handles NGO updates: replaces existing entry or creates new one in associations_update table
- submit_project_update - Same logic as above for projects
- get_db_stats - Calculates dashboard statistics

_Functions are referenced via enums in frontend_
