--
-- PostgreSQL database dump - Clean Database
-- Generated on 2026-01-17 for Asset Management System
-- This is a clean database with only lookup/dropdown data and default Dev user
--

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: asset_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.asset_status AS ENUM (
    'In Use',
    'In Stock',
    'Under Repair',
    'Disposed'
);

ALTER TYPE public.asset_status OWNER TO postgres;

--
-- Name: expense_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expense_type AS ENUM (
    'Purchase',
    'Repair',
    'Maintenance',
    'Upgrade'
);

ALTER TYPE public.expense_type OWNER TO postgres;

--
-- Name: generate_repair_request_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_repair_request_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
        NEW.request_number := 'REQ-' || LPAD(nextval('repair_request_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_repair_request_number() OWNER TO postgres;

--
-- Name: update_repair_request_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_repair_request_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.update_repair_request_timestamp() OWNER TO postgres;

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Name: action_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_logs (
    id bigint NOT NULL,
    user_id integer,
    action_type character varying(50) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.action_logs OWNER TO postgres;

CREATE SEQUENCE public.action_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.action_logs_id_seq OWNER TO postgres;
ALTER SEQUENCE public.action_logs_id_seq OWNED BY public.action_logs.id;

--
-- Name: asset_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_attachments (
    id integer NOT NULL,
    asset_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size bigint,
    file_type character varying(100),
    storage_type character varying(20) DEFAULT 'server'::character varying,
    notes text,
    uploaded_by integer NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now(),
    CONSTRAINT asset_attachments_storage_type_check CHECK (((storage_type)::text = ANY ((ARRAY['server'::character varying, 'firebase'::character varying])::text[])))
);

ALTER TABLE public.asset_attachments OWNER TO postgres;
COMMENT ON TABLE public.asset_attachments IS 'Stores file attachments and notes related to assets';
COMMENT ON COLUMN public.asset_attachments.storage_type IS 'Where this specific file is stored: server or firebase';

CREATE SEQUENCE public.asset_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.asset_attachments_id_seq OWNER TO postgres;
ALTER SEQUENCE public.asset_attachments_id_seq OWNED BY public.asset_attachments.id;

--
-- Name: asset_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_statuses (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    is_available boolean DEFAULT false,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.asset_statuses OWNER TO postgres;

CREATE SEQUENCE public.asset_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.asset_statuses_id_seq OWNER TO postgres;
ALTER SEQUENCE public.asset_statuses_id_seq OWNED BY public.asset_statuses.id;

--
-- Name: asset_tag_prefixes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_tag_prefixes (
    id integer NOT NULL,
    asset_type_id integer NOT NULL,
    prefix character varying(20) NOT NULL,
    last_sequence integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.asset_tag_prefixes OWNER TO postgres;
COMMENT ON TABLE public.asset_tag_prefixes IS 'Stores prefix configurations for auto-generating unique asset tags based on asset type';

CREATE SEQUENCE public.asset_tag_prefixes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.asset_tag_prefixes_id_seq OWNER TO postgres;
ALTER SEQUENCE public.asset_tag_prefixes_id_seq OWNED BY public.asset_tag_prefixes.id;

--
-- Name: asset_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.asset_types OWNER TO postgres;

CREATE SEQUENCE public.asset_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.asset_types_id_seq OWNER TO postgres;
ALTER SEQUENCE public.asset_types_id_seq OWNED BY public.asset_types.id;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    id integer NOT NULL,
    asset_tag character varying(255) NOT NULL,
    asset_type character varying(255) NOT NULL,
    manufacturer character varying(255),
    model character varying(255),
    serial_number character varying(255) NOT NULL,
    status public.asset_status NOT NULL,
    purchase_date date,
    purchase_price numeric(10,2),
    notes text,
    asset_type_id integer,
    asset_status_id integer,
    branch_id integer
);

ALTER TABLE public.assets OWNER TO postgres;

CREATE SEQUENCE public.assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.assets_id_seq OWNER TO postgres;
ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;

--
-- Name: assignment_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment_attachments (
    id integer NOT NULL,
    assignment_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer NOT NULL,
    file_type character varying(100) NOT NULL,
    storage_type character varying(20) NOT NULL,
    notes text,
    uploaded_by integer NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assignment_attachments_storage_type_check CHECK (((storage_type)::text = ANY ((ARRAY['server'::character varying, 'firebase'::character varying])::text[])))
);

ALTER TABLE public.assignment_attachments OWNER TO postgres;
COMMENT ON TABLE public.assignment_attachments IS 'Stores file attachments associated with asset assignments';

CREATE SEQUENCE public.assignment_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.assignment_attachments_id_seq OWNER TO postgres;
ALTER SEQUENCE public.assignment_attachments_id_seq OWNED BY public.assignment_attachments.id;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignments (
    id integer NOT NULL,
    asset_id integer NOT NULL,
    employee_id integer NOT NULL,
    assignment_date date NOT NULL,
    return_date date,
    notes character varying(1000)
);

ALTER TABLE public.assignments OWNER TO postgres;

CREATE SEQUENCE public.assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.assignments_id_seq OWNER TO postgres;
ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    location character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.branches OWNER TO postgres;

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.branches_id_seq OWNER TO postgres;
ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;

--
-- Name: bulk_imported_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bulk_imported_users (
    id integer NOT NULL,
    bulk_import_id integer NOT NULL,
    user_id integer,
    employee_id integer,
    email character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    auto_generated_password character varying(255),
    password_changed boolean DEFAULT false,
    password_changed_at timestamp with time zone,
    password_sent boolean DEFAULT false,
    password_sent_at timestamp with time zone,
    import_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.bulk_imported_users OWNER TO postgres;
COMMENT ON TABLE public.bulk_imported_users IS 'Stores individual user records from bulk imports with their auto-generated passwords';
COMMENT ON COLUMN public.bulk_imported_users.auto_generated_password IS 'The auto-generated password for viewing purposes. Hidden once password is changed.';

CREATE SEQUENCE public.bulk_imported_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.bulk_imported_users_id_seq OWNER TO postgres;
ALTER SEQUENCE public.bulk_imported_users_id_seq OWNED BY public.bulk_imported_users.id;

--
-- Name: bulk_user_imports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bulk_user_imports (
    id integer NOT NULL,
    batch_id uuid DEFAULT gen_random_uuid() NOT NULL,
    imported_by integer,
    total_records integer DEFAULT 0,
    successful_records integer DEFAULT 0,
    failed_records integer DEFAULT 0,
    import_type character varying(10) DEFAULT 'excel'::character varying NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone
);

ALTER TABLE public.bulk_user_imports OWNER TO postgres;
COMMENT ON TABLE public.bulk_user_imports IS 'Stores metadata about bulk user import batches';

CREATE SEQUENCE public.bulk_user_imports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.bulk_user_imports_id_seq OWNER TO postgres;
ALTER SEQUENCE public.bulk_user_imports_id_seq OWNED BY public.bulk_user_imports.id;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.companies OWNER TO postgres;

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.companies_id_seq OWNER TO postgres;
ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.departments OWNER TO postgres;

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;
ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    first_name character varying(255) NOT NULL,
    branch_location character varying(255),
    department character varying(255),
    department_id integer,
    middle_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    branch_id integer,
    company character varying(100) DEFAULT 'Jirani'::character varying
);

ALTER TABLE public.employees OWNER TO postgres;
COMMENT ON COLUMN public.employees.company IS 'Company the employee works for: Jirani, Atana, Caretaker, Samani, Jirani Smart, Jirani Energies';

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;
ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;

--
-- Name: expense_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_attachments (
    id integer NOT NULL,
    expense_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size bigint,
    file_type character varying(100),
    storage_type character varying(20) DEFAULT 'server'::character varying,
    notes text,
    uploaded_by integer NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now(),
    CONSTRAINT expense_attachments_storage_type_check CHECK (((storage_type)::text = ANY ((ARRAY['server'::character varying, 'firebase'::character varying])::text[])))
);

ALTER TABLE public.expense_attachments OWNER TO postgres;
COMMENT ON TABLE public.expense_attachments IS 'Stores file attachments and notes related to expenses';
COMMENT ON COLUMN public.expense_attachments.storage_type IS 'Where this specific file is stored: server or firebase';

CREATE SEQUENCE public.expense_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.expense_attachments_id_seq OWNER TO postgres;
ALTER SEQUENCE public.expense_attachments_id_seq OWNED BY public.expense_attachments.id;

--
-- Name: expense_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.expense_types OWNER TO postgres;

CREATE SEQUENCE public.expense_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.expense_types_id_seq OWNER TO postgres;
ALTER SEQUENCE public.expense_types_id_seq OWNED BY public.expense_types.id;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    asset_id integer NOT NULL,
    date date NOT NULL,
    amount numeric(10,2) NOT NULL,
    vendor character varying(255),
    invoice_number character varying(255),
    notes text,
    expense_type_id integer NOT NULL,
    assigned_employee_id integer
);

ALTER TABLE public.expenses OWNER TO postgres;
COMMENT ON COLUMN public.expenses.assigned_employee_id IS 'The employee the asset was assigned to at the time of the expense';

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.expenses_id_seq OWNER TO postgres;
ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    token character varying(500) NOT NULL,
    user_id integer NOT NULL,
    expires_at timestamp with time zone NOT NULL
);

ALTER TABLE public.refresh_tokens OWNER TO postgres;

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;
ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;

--
-- Name: repair_request_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_request_attachments (
    id integer NOT NULL,
    repair_request_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size bigint,
    file_type character varying(100),
    storage_type character varying(20) DEFAULT 'server'::character varying,
    attachment_type character varying(50) DEFAULT 'general'::character varying,
    notes text,
    uploaded_by integer NOT NULL,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT repair_request_attachments_storage_type_check CHECK (((storage_type)::text = ANY ((ARRAY['server'::character varying, 'firebase'::character varying])::text[])))
);

ALTER TABLE public.repair_request_attachments OWNER TO postgres;
COMMENT ON TABLE public.repair_request_attachments IS 'Stores file attachments for repair requests';
COMMENT ON COLUMN public.repair_request_attachments.attachment_type IS 'Category: invoice, receipt, photo, document, general';

CREATE SEQUENCE public.repair_request_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.repair_request_attachments_id_seq OWNER TO postgres;
ALTER SEQUENCE public.repair_request_attachments_id_seq OWNED BY public.repair_request_attachments.id;

--
-- Name: repair_request_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_request_history (
    id integer NOT NULL,
    repair_request_id integer NOT NULL,
    action_type character varying(50) NOT NULL,
    from_status_id integer,
    to_status_id integer,
    performed_by integer NOT NULL,
    notes text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.repair_request_history OWNER TO postgres;
COMMENT ON TABLE public.repair_request_history IS 'Audit trail for repair request actions and status changes';

CREATE SEQUENCE public.repair_request_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.repair_request_history_id_seq OWNER TO postgres;
ALTER SEQUENCE public.repair_request_history_id_seq OWNED BY public.repair_request_history.id;

--
-- Name: repair_request_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_request_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.repair_request_number_seq OWNER TO postgres;

--
-- Name: repair_request_priorities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_request_priorities (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    color_code character varying(20) DEFAULT '#6c757d'::character varying,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.repair_request_priorities OWNER TO postgres;
COMMENT ON TABLE public.repair_request_priorities IS 'Stores priority levels for repair requests';

CREATE SEQUENCE public.repair_request_priorities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.repair_request_priorities_id_seq OWNER TO postgres;
ALTER SEQUENCE public.repair_request_priorities_id_seq OWNED BY public.repair_request_priorities.id;

--
-- Name: repair_request_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_request_statuses (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color_code character varying(20) DEFAULT '#6c757d'::character varying,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_terminal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.repair_request_statuses OWNER TO postgres;
COMMENT ON TABLE public.repair_request_statuses IS 'Stores status options for repair request workflow';
COMMENT ON COLUMN public.repair_request_statuses.color_code IS 'Hex color code for status badge display';
COMMENT ON COLUMN public.repair_request_statuses.is_terminal IS 'Whether this status represents a final state';

CREATE SEQUENCE public.repair_request_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.repair_request_statuses_id_seq OWNER TO postgres;
ALTER SEQUENCE public.repair_request_statuses_id_seq OWNED BY public.repair_request_statuses.id;

--
-- Name: repair_request_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_request_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.repair_request_types OWNER TO postgres;
COMMENT ON TABLE public.repair_request_types IS 'Stores types of repair requests for customization';

CREATE SEQUENCE public.repair_request_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.repair_request_types_id_seq OWNER TO postgres;
ALTER SEQUENCE public.repair_request_types_id_seq OWNED BY public.repair_request_types.id;

--
-- Name: repair_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_requests (
    id integer NOT NULL,
    request_number character varying(20) NOT NULL,
    asset_id integer,
    request_type_id integer NOT NULL,
    priority_id integer NOT NULL,
    status_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    requested_by integer NOT NULL,
    branch_id integer,
    department_id integer,
    ict_reviewed_by integer,
    ict_reviewed_at timestamp with time zone,
    ict_notes text,
    repair_started_at timestamp with time zone,
    repair_completed_at timestamp with time zone,
    repair_notes text,
    vendor_name character varying(255),
    invoice_number character varying(100),
    invoice_amount numeric(12,2),
    invoice_date date,
    invoice_uploaded_by integer,
    invoice_uploaded_at timestamp with time zone,
    finance_reviewed_by integer,
    finance_reviewed_at timestamp with time zone,
    finance_notes text,
    payment_reference character varying(100),
    payment_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone,
    expense_id integer,
    invoice_notes text
);

ALTER TABLE public.repair_requests OWNER TO postgres;
COMMENT ON TABLE public.repair_requests IS 'Main table for repair request management';
COMMENT ON COLUMN public.repair_requests.request_number IS 'Unique identifier like REQ-001, REQ-002';

CREATE SEQUENCE public.repair_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.repair_requests_id_seq OWNER TO postgres;
ALTER SEQUENCE public.repair_requests_id_seq OWNED BY public.repair_requests.id;

--
-- Name: repair_request_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.repair_request_stats AS
 SELECT count(*) AS total_requests,
    count(*) FILTER (WHERE ((rs.name)::text = 'Pending'::text)) AS pending_count,
    count(*) FILTER (WHERE ((rs.name)::text = ANY ((ARRAY['ICT Approved'::character varying, 'In Repair'::character varying, 'Awaiting Invoice'::character varying, 'Invoice Submitted'::character varying, 'Finance Approved'::character varying])::text[]))) AS in_progress_count,
    count(*) FILTER (WHERE ((rs.name)::text = 'Completed'::text)) AS completed_count,
    count(*) FILTER (WHERE ((rs.name)::text = ANY ((ARRAY['ICT Rejected'::character varying, 'Finance Rejected'::character varying, 'Cancelled'::character varying])::text[]))) AS rejected_count,
    COALESCE(sum(rr.invoice_amount) FILTER (WHERE ((rs.name)::text = 'Completed'::text)), (0)::numeric) AS total_completed_amount,
    COALESCE(sum(rr.invoice_amount) FILTER (WHERE ((rs.name)::text = 'Finance Approved'::text)), (0)::numeric) AS total_approved_amount
   FROM (public.repair_requests rr
     JOIN public.repair_request_statuses rs ON ((rr.status_id = rs.id)));

ALTER VIEW public.repair_request_stats OWNER TO postgres;

--
-- Name: repair_workflow_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_workflow_permissions (
    id integer NOT NULL,
    workflow_stage_id integer NOT NULL,
    role_id integer NOT NULL,
    can_execute boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.repair_workflow_permissions OWNER TO postgres;

CREATE SEQUENCE public.repair_workflow_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.repair_workflow_permissions_id_seq OWNER TO postgres;
ALTER SEQUENCE public.repair_workflow_permissions_id_seq OWNED BY public.repair_workflow_permissions.id;

--
-- Name: repair_workflow_stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_workflow_stages (
    id integer NOT NULL,
    stage_key character varying(50) NOT NULL,
    stage_name character varying(100) NOT NULL,
    description text,
    from_status_id integer,
    to_status_id integer,
    action_type character varying(50) NOT NULL,
    icon character varying(50) DEFAULT 'uil-check'::character varying,
    button_color character varying(20) DEFAULT 'success'::character varying,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    requires_notes boolean DEFAULT false,
    requires_invoice boolean DEFAULT false,
    requires_payment boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.repair_workflow_stages OWNER TO postgres;

CREATE SEQUENCE public.repair_workflow_stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.repair_workflow_stages_id_seq OWNER TO postgres;
ALTER SEQUENCE public.repair_workflow_stages_id_seq OWNED BY public.repair_workflow_stages.id;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(100),
    updated_at timestamp(6) with time zone,
    is_active boolean
);

ALTER TABLE public.roles OWNER TO postgres;

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;
ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);

ALTER TABLE public.session OWNER TO postgres;

--
-- Name: system_configuration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_configuration (
    id integer DEFAULT 1 NOT NULL,
    app_name character varying(255) DEFAULT 'Asset Management System'::character varying,
    company_logo_url character varying(500),
    company_email character varying(255),
    company_phone character varying(50),
    company_address text,
    storage_type character varying(20) DEFAULT 'server'::character varying,
    firebase_api_key character varying(500),
    firebase_auth_domain character varying(500),
    firebase_project_id character varying(255),
    firebase_storage_bucket character varying(500),
    firebase_messaging_sender_id character varying(255),
    firebase_app_id character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    auto_send_password boolean DEFAULT false,
    password_email_template text DEFAULT 'Dear {first_name},

Your account has been created in the Asset Management System.

Email: {email}
Temporary Password: {password}

Please login and change your password immediately.

Best regards,
{company_name}'::text,
    smtp_host character varying(255),
    smtp_port integer DEFAULT 587,
    smtp_secure boolean DEFAULT false,
    smtp_user character varying(255),
    smtp_password character varying(255),
    smtp_from_name character varying(255),
    smtp_from_email character varying(255),
    CONSTRAINT single_config_row CHECK ((id = 1)),
    CONSTRAINT system_configuration_storage_type_check CHECK (((storage_type)::text = ANY ((ARRAY['server'::character varying, 'firebase'::character varying])::text[])))
);

ALTER TABLE public.system_configuration OWNER TO postgres;
COMMENT ON TABLE public.system_configuration IS 'Stores system-wide configuration including app name, company info, and storage settings';
COMMENT ON COLUMN public.system_configuration.storage_type IS 'Storage location: server (local) or firebase (cloud)';
COMMENT ON COLUMN public.system_configuration.auto_send_password IS 'Whether to automatically send passwords to users after account creation';

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    employee_id integer,
    first_name character varying(255) NOT NULL,
    middle_name character varying(255),
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role_id integer NOT NULL,
    department_id integer,
    phone character varying(20),
    branch_id integer,
    is_active boolean,
    is_password_changed boolean DEFAULT false,
    password_changed_at timestamp with time zone,
    is_bulk_imported boolean DEFAULT false,
    company_id integer
);

ALTER TABLE public.users OWNER TO postgres;

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.users_id_seq OWNER TO postgres;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

--
-- Set DEFAULT values for id columns
--

ALTER TABLE ONLY public.action_logs ALTER COLUMN id SET DEFAULT nextval('public.action_logs_id_seq'::regclass);
ALTER TABLE ONLY public.asset_attachments ALTER COLUMN id SET DEFAULT nextval('public.asset_attachments_id_seq'::regclass);
ALTER TABLE ONLY public.asset_statuses ALTER COLUMN id SET DEFAULT nextval('public.asset_statuses_id_seq'::regclass);
ALTER TABLE ONLY public.asset_tag_prefixes ALTER COLUMN id SET DEFAULT nextval('public.asset_tag_prefixes_id_seq'::regclass);
ALTER TABLE ONLY public.asset_types ALTER COLUMN id SET DEFAULT nextval('public.asset_types_id_seq'::regclass);
ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);
ALTER TABLE ONLY public.assignment_attachments ALTER COLUMN id SET DEFAULT nextval('public.assignment_attachments_id_seq'::regclass);
ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);
ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);
ALTER TABLE ONLY public.bulk_imported_users ALTER COLUMN id SET DEFAULT nextval('public.bulk_imported_users_id_seq'::regclass);
ALTER TABLE ONLY public.bulk_user_imports ALTER COLUMN id SET DEFAULT nextval('public.bulk_user_imports_id_seq'::regclass);
ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);
ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);
ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);
ALTER TABLE ONLY public.expense_attachments ALTER COLUMN id SET DEFAULT nextval('public.expense_attachments_id_seq'::regclass);
ALTER TABLE ONLY public.expense_types ALTER COLUMN id SET DEFAULT nextval('public.expense_types_id_seq'::regclass);
ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);
ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);
ALTER TABLE ONLY public.repair_request_attachments ALTER COLUMN id SET DEFAULT nextval('public.repair_request_attachments_id_seq'::regclass);
ALTER TABLE ONLY public.repair_request_history ALTER COLUMN id SET DEFAULT nextval('public.repair_request_history_id_seq'::regclass);
ALTER TABLE ONLY public.repair_request_priorities ALTER COLUMN id SET DEFAULT nextval('public.repair_request_priorities_id_seq'::regclass);
ALTER TABLE ONLY public.repair_request_statuses ALTER COLUMN id SET DEFAULT nextval('public.repair_request_statuses_id_seq'::regclass);
ALTER TABLE ONLY public.repair_request_types ALTER COLUMN id SET DEFAULT nextval('public.repair_request_types_id_seq'::regclass);
ALTER TABLE ONLY public.repair_requests ALTER COLUMN id SET DEFAULT nextval('public.repair_requests_id_seq'::regclass);
ALTER TABLE ONLY public.repair_workflow_permissions ALTER COLUMN id SET DEFAULT nextval('public.repair_workflow_permissions_id_seq'::regclass);
ALTER TABLE ONLY public.repair_workflow_stages ALTER COLUMN id SET DEFAULT nextval('public.repair_workflow_stages_id_seq'::regclass);
ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

--
-- ============================================================================
-- DATA INSERTION - LOOKUP/DROPDOWN DATA ONLY
-- ============================================================================
--

--
-- Data for Name: action_logs; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No transaction logs
--

COPY public.action_logs (id, user_id, action_type, entity_type, entity_id, details, created_at) FROM stdin;
\.

--
-- Data for Name: asset_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No attachments
--

COPY public.asset_attachments (id, asset_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at) FROM stdin;
\.

--
-- Data for Name: asset_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Dropdown data
--

COPY public.asset_statuses (id, name, is_available, description, created_at, updated_at) FROM stdin;
1	In Use	f	Asset is currently assigned and deployed.	2025-10-09 18:12:23.042878+03	2025-10-09 18:12:23.042878+03
2	Under Repair	f	Asset is currently under repair.	2025-10-09 18:12:23.042878+03	2025-10-09 18:12:23.042878+03
3	In Stock	t	Asset is available in stock.	2025-10-09 18:12:42.355423+03	2025-10-09 18:12:42.355423+03
4	Disposed	f	Asset has been disposed.	2025-10-09 18:12:42.355423+03	2025-10-09 18:12:42.355423+03
\.

--
-- Data for Name: asset_tag_prefixes; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Configuration data with sequences reset to 0
--

COPY public.asset_tag_prefixes (id, asset_type_id, prefix, last_sequence, created_at, updated_at) FROM stdin;
1	1	ICT-LPT	0	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
2	3	ICT-RTR	0	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
3	4	ICT-PRT	0	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
4	5	ICT-PRJ	0	2026-01-10 11:05:09.548102+03	2026-01-10 11:05:09.548102+03
\.

--
-- Data for Name: asset_types; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Dropdown data
--

COPY public.asset_types (id, name, description, created_at, updated_at) FROM stdin;
1	Laptop	Portable computers assigned to staff, typically high-value assets.	2025-10-09 16:56:06.312923+03	2025-10-09 16:56:06.312923+03
3	Router	Router.	2025-10-18 12:20:32.117117+03	2025-10-18 12:20:32.117117+03
4	Printer	Printer.	2025-10-18 12:20:54.583249+03	2025-10-18 12:20:54.583249+03
5	Projector	Projector	2026-01-10 11:03:11.701957+03	2026-01-10 11:03:11.701957+03
\.

--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No assets
--

COPY public.assets (id, asset_tag, asset_type, manufacturer, model, serial_number, status, purchase_date, purchase_price, notes, asset_type_id, asset_status_id, branch_id) FROM stdin;
\.

--
-- Data for Name: assignment_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No attachments
--

COPY public.assignment_attachments (id, assignment_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at, created_at, updated_at) FROM stdin;
\.

--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No assignments
--

COPY public.assignments (id, asset_id, employee_id, assignment_date, return_date, notes) FROM stdin;
\.

--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Dropdown data
--

COPY public.branches (id, name, location, created_at, updated_at) FROM stdin;
1	HQ	Mwatate, Taita Taveta.	2025-09-20 11:29:51.759883+03	2025-09-20 11:29:51.759883+03
\.

--
-- Data for Name: bulk_imported_users; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No bulk imports
--

COPY public.bulk_imported_users (id, bulk_import_id, user_id, employee_id, email, first_name, last_name, auto_generated_password, password_changed, password_changed_at, password_sent, password_sent_at, import_status, error_message, created_at) FROM stdin;
\.

--
-- Data for Name: bulk_user_imports; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No bulk imports
--

COPY public.bulk_user_imports (id, batch_id, imported_by, total_records, successful_records, failed_records, import_type, status, created_at, completed_at) FROM stdin;
\.

--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Dropdown data
--

COPY public.companies (id, name, is_active, created_at, updated_at) FROM stdin;
1	Jirani	t	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
2	Atana	t	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
3	Caretaker	t	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
4	Samani	t	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
5	Jirani Smart	t	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
6	Jirani Energies	t	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
\.

--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Dropdown data
--

COPY public.departments (id, name, created_at, updated_at) FROM stdin;
1	Caretaker and Logistics	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
2	Audit, Risk and Compliance	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
3	Inventory	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
4	Procurement & Logistic	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
5	Security/Operations Support	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
6	ICT and Data entry	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
7	Corporate	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
8	Finance	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
10	Human Resource	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
11	Customer Care	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
12	Management	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
13	Business	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
17	Finance/Admin	2025-12-09 12:46:26.052585+03	2025-12-09 12:46:26.052585+03
\.

--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Only default Dev employee
--

COPY public.employees (id, first_name, branch_location, department, department_id, middle_name, last_name, branch_id, company) FROM stdin;
1	Dev	HQ	ICT and Data entry	6	Dev	Dev	1	Jirani Smart
\.

--
-- Data for Name: expense_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No attachments
--

COPY public.expense_attachments (id, expense_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at) FROM stdin;
\.

--
-- Data for Name: expense_types; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Dropdown data
--

COPY public.expense_types (id, name, description, created_at, updated_at) FROM stdin;
1	Purchase	Original capitalized cost of the asset.	2025-10-10 10:58:54.100412+03	2025-10-10 10:58:54.100412+03
3	Repair	Repair cost of the asset.	2025-10-10 11:07:44.784952+03	2025-10-10 11:07:44.784952+03
4	Logistics	Transport cost of the asset.	2025-10-10 11:08:14.682477+03	2025-10-10 11:08:14.682477+03
\.

--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No expenses
--

COPY public.expenses (id, asset_id, date, amount, vendor, invoice_number, notes, expense_type_id, assigned_employee_id) FROM stdin;
\.

--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No tokens
--

COPY public.refresh_tokens (id, token, user_id, expires_at) FROM stdin;
\.

--
-- Data for Name: repair_request_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No attachments
--

COPY public.repair_request_attachments (id, repair_request_id, file_name, file_path, file_size, file_type, storage_type, attachment_type, notes, uploaded_by, uploaded_at) FROM stdin;
\.

--
-- Data for Name: repair_request_history; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No history
--

COPY public.repair_request_history (id, repair_request_id, action_type, from_status_id, to_status_id, performed_by, notes, metadata, created_at) FROM stdin;
\.

--
-- Data for Name: repair_request_priorities; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Dropdown data
--

COPY public.repair_request_priorities (id, name, description, color_code, display_order, is_active, created_at, updated_at) FROM stdin;
1	Low	Non-urgent repairs that can wait	#28a745	1	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
2	Medium	Standard priority repairs	#ffc107	2	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
3	High	Urgent repairs needed soon	#fd7e14	3	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
4	Critical	Emergency repairs required immediately	#dc3545	4	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
\.

--
-- Data for Name: repair_request_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Dropdown data (workflow statuses)
--

COPY public.repair_request_statuses (id, name, description, color_code, display_order, is_active, is_terminal, created_at, updated_at) FROM stdin;
1	Pending	Request submitted, awaiting ICT review	#ffc107	1	t	f	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
2	ICT Approved	Approved by ICT department	#17a2b8	2	t	f	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
3	ICT Rejected	Rejected by ICT department	#dc3545	3	t	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
4	In Repair	Equipment is being repaired	#007bff	4	t	f	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
5	Awaiting Invoice	Repair complete, waiting for invoice upload	#6f42c1	5	t	f	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
6	Invoice Submitted	Invoice uploaded, awaiting finance approval	#fd7e14	6	t	f	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
7	Finance Approved	Payment approved by finance	#28a745	7	t	f	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
8	Finance Rejected	Payment rejected by finance	#dc3545	8	t	f	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
9	Completed	Repair request fully completed	#28a745	9	t	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
10	Cancelled	Request cancelled	#6c757d	10	t	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
\.

--
-- Data for Name: repair_request_types; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Dropdown data
--

COPY public.repair_request_types (id, name, description, is_active, created_at, updated_at) FROM stdin;
1	Hardware Repair	Physical hardware repairs and fixes	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
2	Software Issue	Software-related problems and troubleshooting	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
3	Replacement Request	Request for equipment replacement	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
4	Maintenance	Routine maintenance and servicing	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
5	Upgrade Request	Hardware or software upgrade requests	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
\.

--
-- Data for Name: repair_requests; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No repair requests
--

COPY public.repair_requests (id, request_number, asset_id, request_type_id, priority_id, status_id, title, description, requested_by, branch_id, department_id, ict_reviewed_by, ict_reviewed_at, ict_notes, repair_started_at, repair_completed_at, repair_notes, vendor_name, invoice_number, invoice_amount, invoice_date, invoice_uploaded_by, invoice_uploaded_at, finance_reviewed_by, finance_reviewed_at, finance_notes, payment_reference, payment_date, created_at, updated_at, completed_at, expense_id, invoice_notes) FROM stdin;
\.

--
-- Data for Name: repair_workflow_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Workflow configuration (permissions for Admin role only)
--

COPY public.repair_workflow_permissions (id, workflow_stage_id, role_id, can_execute, created_at) FROM stdin;
1	1	1	t	2026-01-17 00:00:00
2	2	1	t	2026-01-17 00:00:00
3	3	1	t	2026-01-17 00:00:00
4	4	1	t	2026-01-17 00:00:00
5	5	1	t	2026-01-17 00:00:00
6	6	1	t	2026-01-17 00:00:00
7	7	1	t	2026-01-17 00:00:00
8	8	1	t	2026-01-17 00:00:00
\.

--
-- Data for Name: repair_workflow_stages; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Workflow configuration
--

COPY public.repair_workflow_stages (id, stage_key, stage_name, description, from_status_id, to_status_id, action_type, icon, button_color, display_order, is_active, requires_notes, requires_invoice, requires_payment, created_at, updated_at) FROM stdin;
1	ict-approve	ICT Approval	ICT department approves the repair request	1	2	approve	uil-check	success	1	t	f	f	f	2026-01-14 11:59:59.864962	2026-01-14 11:59:59.864962
2	ict-reject	ICT Rejection	ICT department rejects the repair request	1	3	reject	uil-times	danger	2	t	t	f	f	2026-01-14 11:59:59.864962	2026-01-14 11:59:59.864962
3	in-repair	Mark In Repair	Mark the item as being repaired	2	4	transition	uil-wrench	warning	3	t	f	f	f	2026-01-14 11:59:59.864962	2026-01-14 11:59:59.864962
4	submit-invoice	Submit Invoice	Submit invoice details for finance approval	4	6	transition	uil-invoice	primary	4	t	f	t	f	2026-01-14 11:59:59.864962	2026-01-14 11:59:59.864962
5	finance-approve	Finance Approval	Finance department approves the invoice/payment	6	7	approve	uil-check-circle	success	5	t	f	f	t	2026-01-14 11:59:59.864962	2026-01-14 11:59:59.864962
6	finance-reject	Finance Rejection	Finance department rejects the invoice/payment	6	8	reject	uil-times-circle	danger	6	t	t	f	f	2026-01-14 11:59:59.864962	2026-01-14 11:59:59.864962
7	complete	Mark Complete	Mark the repair request as completed	7	9	complete	uil-check-square	success	7	t	f	f	f	2026-01-14 11:59:59.864962	2026-01-14 11:59:59.864962
8	cancel	Cancel Request	Cancel the repair request	\N	10	cancel	uil-ban	danger	8	t	t	f	f	2026-01-14 11:59:59.864962	2026-01-14 11:59:59.864962
\.

--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Dropdown data (only essential roles)
--

COPY public.roles (id, name, description, updated_at, is_active) FROM stdin;
1	Admin	System Administrator with full access	2026-01-17 00:00:00+03	t
2	Standard User	Regular system user	2026-01-17 00:00:00+03	t
\.

--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
-- EMPTY - No sessions
--

COPY public.session (sid, sess, expire) FROM stdin;
\.

--
-- Data for Name: system_configuration; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - System configuration (with sensitive data cleared)
--

COPY public.system_configuration (id, app_name, company_logo_url, company_email, company_phone, company_address, storage_type, firebase_api_key, firebase_auth_domain, firebase_project_id, firebase_storage_bucket, firebase_messaging_sender_id, firebase_app_id, created_at, updated_at, auto_send_password, password_email_template, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, smtp_from_name, smtp_from_email) FROM stdin;
1	Asset Management System	\N	\N	\N	\N	server	\N	\N	\N	\N	\N	\N	2026-01-17 00:00:00+03	2026-01-17 00:00:00+03	f	Dear {first_name},\n\nYour account has been created in the Asset Management System.\n\nEmail: {email}\nTemporary Password: {password}\n\nPlease login and change your password immediately.\n\nBest regards,\n{company_name}	\N	587	f	\N	\N	\N	\N
\.

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
-- KEPT - Only default Dev user (password: Dev@123)
--

COPY public.users (id, employee_id, first_name, middle_name, last_name, email, password, role_id, department_id, phone, branch_id, is_active, is_password_changed, password_changed_at, is_bulk_imported, company_id) FROM stdin;
1	1	Dev	Dev	Dev	dev@system.local	$2a$10$pvN0OKHi7HAfYAoid6F3.e9ag3r57KVmPL/tezhi6zubmPPAlFp.C	1	6	+254700000000	1	t	f	\N	f	5
\.

--
-- Reset sequences to start fresh
--

SELECT pg_catalog.setval('public.action_logs_id_seq', 1, false);
SELECT pg_catalog.setval('public.asset_attachments_id_seq', 1, false);
SELECT pg_catalog.setval('public.asset_statuses_id_seq', 4, true);
SELECT pg_catalog.setval('public.asset_tag_prefixes_id_seq', 4, true);
SELECT pg_catalog.setval('public.asset_types_id_seq', 5, true);
SELECT pg_catalog.setval('public.assets_id_seq', 1, false);
SELECT pg_catalog.setval('public.assignment_attachments_id_seq', 1, false);
SELECT pg_catalog.setval('public.assignments_id_seq', 1, false);
SELECT pg_catalog.setval('public.branches_id_seq', 1, true);
SELECT pg_catalog.setval('public.bulk_imported_users_id_seq', 1, false);
SELECT pg_catalog.setval('public.bulk_user_imports_id_seq', 1, false);
SELECT pg_catalog.setval('public.companies_id_seq', 6, true);
SELECT pg_catalog.setval('public.departments_id_seq', 17, true);
SELECT pg_catalog.setval('public.employees_id_seq', 1, true);
SELECT pg_catalog.setval('public.expense_attachments_id_seq', 1, false);
SELECT pg_catalog.setval('public.expense_types_id_seq', 4, true);
SELECT pg_catalog.setval('public.expenses_id_seq', 1, false);
SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 1, false);
SELECT pg_catalog.setval('public.repair_request_attachments_id_seq', 1, false);
SELECT pg_catalog.setval('public.repair_request_history_id_seq', 1, false);
SELECT pg_catalog.setval('public.repair_request_number_seq', 1, false);
SELECT pg_catalog.setval('public.repair_request_priorities_id_seq', 4, true);
SELECT pg_catalog.setval('public.repair_request_statuses_id_seq', 10, true);
SELECT pg_catalog.setval('public.repair_request_types_id_seq', 5, true);
SELECT pg_catalog.setval('public.repair_requests_id_seq', 1, false);
SELECT pg_catalog.setval('public.repair_workflow_permissions_id_seq', 8, true);
SELECT pg_catalog.setval('public.repair_workflow_stages_id_seq', 8, true);
SELECT pg_catalog.setval('public.roles_id_seq', 2, true);
SELECT pg_catalog.setval('public.users_id_seq', 1, true);

--
-- ============================================================================
-- PRIMARY KEY CONSTRAINTS
-- ============================================================================
--

ALTER TABLE ONLY public.action_logs ADD CONSTRAINT action_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_attachments ADD CONSTRAINT asset_attachments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_statuses ADD CONSTRAINT asset_statuses_name_key UNIQUE (name);
ALTER TABLE ONLY public.asset_statuses ADD CONSTRAINT asset_statuses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_tag_prefixes ADD CONSTRAINT asset_tag_prefixes_asset_type_id_key UNIQUE (asset_type_id);
ALTER TABLE ONLY public.asset_tag_prefixes ADD CONSTRAINT asset_tag_prefixes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_types ADD CONSTRAINT asset_types_name_key UNIQUE (name);
ALTER TABLE ONLY public.asset_types ADD CONSTRAINT asset_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.assets ADD CONSTRAINT assets_asset_tag_key UNIQUE (asset_tag);
ALTER TABLE ONLY public.assets ADD CONSTRAINT assets_asset_tag_unique UNIQUE (asset_tag);
ALTER TABLE ONLY public.assets ADD CONSTRAINT assets_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.assets ADD CONSTRAINT assets_serial_number_key UNIQUE (serial_number);
ALTER TABLE ONLY public.assignment_attachments ADD CONSTRAINT assignment_attachments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.assignments ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.branches ADD CONSTRAINT branches_name_key UNIQUE (name);
ALTER TABLE ONLY public.branches ADD CONSTRAINT branches_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bulk_imported_users ADD CONSTRAINT bulk_imported_users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bulk_user_imports ADD CONSTRAINT bulk_user_imports_batch_id_key UNIQUE (batch_id);
ALTER TABLE ONLY public.bulk_user_imports ADD CONSTRAINT bulk_user_imports_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.companies ADD CONSTRAINT companies_name_key UNIQUE (name);
ALTER TABLE ONLY public.companies ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.departments ADD CONSTRAINT departments_name_key UNIQUE (name);
ALTER TABLE ONLY public.departments ADD CONSTRAINT departments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.employees ADD CONSTRAINT employees_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.expense_attachments ADD CONSTRAINT expense_attachments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.expense_types ADD CONSTRAINT expense_types_name_key UNIQUE (name);
ALTER TABLE ONLY public.expense_types ADD CONSTRAINT expense_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.expenses ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.refresh_tokens ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.refresh_tokens ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);
ALTER TABLE ONLY public.refresh_tokens ADD CONSTRAINT refresh_tokens_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.repair_request_attachments ADD CONSTRAINT repair_request_attachments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.repair_request_history ADD CONSTRAINT repair_request_history_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.repair_request_priorities ADD CONSTRAINT repair_request_priorities_name_key UNIQUE (name);
ALTER TABLE ONLY public.repair_request_priorities ADD CONSTRAINT repair_request_priorities_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.repair_request_statuses ADD CONSTRAINT repair_request_statuses_name_key UNIQUE (name);
ALTER TABLE ONLY public.repair_request_statuses ADD CONSTRAINT repair_request_statuses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.repair_request_types ADD CONSTRAINT repair_request_types_name_key UNIQUE (name);
ALTER TABLE ONLY public.repair_request_types ADD CONSTRAINT repair_request_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_request_number_key UNIQUE (request_number);
ALTER TABLE ONLY public.repair_workflow_permissions ADD CONSTRAINT repair_workflow_permissions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.repair_workflow_permissions ADD CONSTRAINT repair_workflow_permissions_workflow_stage_id_role_id_key UNIQUE (workflow_stage_id, role_id);
ALTER TABLE ONLY public.repair_workflow_stages ADD CONSTRAINT repair_workflow_stages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.repair_workflow_stages ADD CONSTRAINT repair_workflow_stages_stage_key_key UNIQUE (stage_key);
ALTER TABLE ONLY public.roles ADD CONSTRAINT roles_name_key UNIQUE (name);
ALTER TABLE ONLY public.roles ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.session ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
ALTER TABLE ONLY public.system_configuration ADD CONSTRAINT system_configuration_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- ============================================================================
-- INDEXES
-- ============================================================================
--

CREATE INDEX idx_asset_attachments_asset_id ON public.asset_attachments USING btree (asset_id);
CREATE INDEX idx_asset_attachments_uploaded_by ON public.asset_attachments USING btree (uploaded_by);
CREATE UNIQUE INDEX idx_asset_statuses_name ON public.asset_statuses USING btree (name);
CREATE UNIQUE INDEX idx_asset_types_name ON public.asset_types USING btree (name);
CREATE INDEX idx_assets_asset_tag ON public.assets USING btree (asset_tag);
CREATE INDEX idx_assets_purchase_price ON public.assets USING btree (purchase_price);
CREATE INDEX idx_assets_serial_number ON public.assets USING btree (serial_number);
CREATE INDEX idx_assets_type ON public.assets USING btree (asset_type);
CREATE INDEX idx_assignment_attachments_assignment_id ON public.assignment_attachments USING btree (assignment_id);
CREATE INDEX idx_assignment_attachments_uploaded_at ON public.assignment_attachments USING btree (uploaded_at);
CREATE INDEX idx_assignment_attachments_uploaded_by ON public.assignment_attachments USING btree (uploaded_by);
CREATE INDEX idx_assignments_asset_id ON public.assignments USING btree (asset_id);
CREATE INDEX idx_assignments_current_asset ON public.assignments USING btree (employee_id, return_date) WHERE (return_date IS NULL);
CREATE INDEX idx_assignments_employee_id ON public.assignments USING btree (employee_id);
CREATE INDEX idx_bulk_imported_users_bulk_import_id ON public.bulk_imported_users USING btree (bulk_import_id);
CREATE INDEX idx_bulk_imported_users_user_id ON public.bulk_imported_users USING btree (user_id);
CREATE INDEX idx_bulk_user_imports_batch_id ON public.bulk_user_imports USING btree (batch_id);
CREATE INDEX idx_bulk_user_imports_imported_by ON public.bulk_user_imports USING btree (imported_by);
CREATE INDEX idx_employees_location ON public.employees USING btree (branch_location);
CREATE INDEX idx_expense_attachments_expense_id ON public.expense_attachments USING btree (expense_id);
CREATE INDEX idx_expense_attachments_uploaded_by ON public.expense_attachments USING btree (uploaded_by);
CREATE UNIQUE INDEX idx_expense_types_name ON public.expense_types USING btree (name);
CREATE INDEX idx_expenses_asset_id ON public.expenses USING btree (asset_id);
CREATE INDEX idx_expenses_assigned_employee ON public.expenses USING btree (assigned_employee_id);
CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);
CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);
CREATE INDEX idx_repair_attachments_request ON public.repair_request_attachments USING btree (repair_request_id);
CREATE INDEX idx_repair_request_history_request ON public.repair_request_history USING btree (repair_request_id);
CREATE INDEX idx_repair_requests_asset ON public.repair_requests USING btree (asset_id);
CREATE INDEX idx_repair_requests_branch ON public.repair_requests USING btree (branch_id);
CREATE INDEX idx_repair_requests_expense_id ON public.repair_requests USING btree (expense_id);
CREATE INDEX idx_repair_requests_request_number ON public.repair_requests USING btree (request_number);
CREATE INDEX idx_repair_requests_requested_by ON public.repair_requests USING btree (requested_by);
CREATE INDEX idx_repair_requests_status ON public.repair_requests USING btree (status_id);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_is_bulk_imported ON public.users USING btree (is_bulk_imported);
CREATE INDEX idx_workflow_permissions_role ON public.repair_workflow_permissions USING btree (role_id);
CREATE INDEX idx_workflow_permissions_stage ON public.repair_workflow_permissions USING btree (workflow_stage_id);
CREATE INDEX idx_workflow_stages_from_status ON public.repair_workflow_stages USING btree (from_status_id);
CREATE INDEX idx_workflow_stages_stage_key ON public.repair_workflow_stages USING btree (stage_key);

--
-- ============================================================================
-- TRIGGERS
-- ============================================================================
--

CREATE TRIGGER trigger_generate_request_number BEFORE INSERT ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.generate_repair_request_number();
CREATE TRIGGER trigger_update_repair_request_timestamp BEFORE UPDATE ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.update_repair_request_timestamp();

--
-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================
--

ALTER TABLE ONLY public.action_logs ADD CONSTRAINT action_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.assets ADD CONSTRAINT asset_status_id_fk FOREIGN KEY (asset_status_id) REFERENCES public.asset_statuses(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.asset_tag_prefixes ADD CONSTRAINT asset_tag_prefixes_asset_type_id_fkey FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.assets ADD CONSTRAINT asset_type_id_fk FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.assignment_attachments ADD CONSTRAINT assignment_attachments_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.assignment_attachments ADD CONSTRAINT assignment_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.assignments ADD CONSTRAINT assignments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.assignments ADD CONSTRAINT assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.assets ADD CONSTRAINT branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.bulk_imported_users ADD CONSTRAINT bulk_imported_users_bulk_import_id_fkey FOREIGN KEY (bulk_import_id) REFERENCES public.bulk_user_imports(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.bulk_imported_users ADD CONSTRAINT bulk_imported_users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);
ALTER TABLE ONLY public.bulk_imported_users ADD CONSTRAINT bulk_imported_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.bulk_user_imports ADD CONSTRAINT bulk_user_imports_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.expenses ADD CONSTRAINT expense_type_id_fk FOREIGN KEY (expense_type_id) REFERENCES public.expense_types(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.expenses ADD CONSTRAINT expenses_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.expenses ADD CONSTRAINT expenses_assigned_employee_id_fkey FOREIGN KEY (assigned_employee_id) REFERENCES public.employees(id);
ALTER TABLE ONLY public.asset_attachments ADD CONSTRAINT fk_asset_attachment_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.asset_attachments ADD CONSTRAINT fk_asset_attachment_user FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.employees ADD CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.expense_attachments ADD CONSTRAINT fk_expense_attachment_expense FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.expense_attachments ADD CONSTRAINT fk_expense_attachment_user FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.users ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.users ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.users ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.refresh_tokens ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.repair_request_attachments ADD CONSTRAINT repair_request_attachments_repair_request_id_fkey FOREIGN KEY (repair_request_id) REFERENCES public.repair_requests(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.repair_request_attachments ADD CONSTRAINT repair_request_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.repair_request_history ADD CONSTRAINT repair_request_history_from_status_id_fkey FOREIGN KEY (from_status_id) REFERENCES public.repair_request_statuses(id);
ALTER TABLE ONLY public.repair_request_history ADD CONSTRAINT repair_request_history_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.repair_request_history ADD CONSTRAINT repair_request_history_repair_request_id_fkey FOREIGN KEY (repair_request_id) REFERENCES public.repair_requests(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.repair_request_history ADD CONSTRAINT repair_request_history_to_status_id_fkey FOREIGN KEY (to_status_id) REFERENCES public.repair_request_statuses(id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_finance_reviewed_by_fkey FOREIGN KEY (finance_reviewed_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_ict_reviewed_by_fkey FOREIGN KEY (ict_reviewed_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_invoice_uploaded_by_fkey FOREIGN KEY (invoice_uploaded_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_priority_id_fkey FOREIGN KEY (priority_id) REFERENCES public.repair_request_priorities(id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_request_type_id_fkey FOREIGN KEY (request_type_id) REFERENCES public.repair_request_types(id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.repair_requests ADD CONSTRAINT repair_requests_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.repair_request_statuses(id);
ALTER TABLE ONLY public.repair_workflow_permissions ADD CONSTRAINT repair_workflow_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.repair_workflow_permissions ADD CONSTRAINT repair_workflow_permissions_workflow_stage_id_fkey FOREIGN KEY (workflow_stage_id) REFERENCES public.repair_workflow_stages(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.repair_workflow_stages ADD CONSTRAINT repair_workflow_stages_from_status_id_fkey FOREIGN KEY (from_status_id) REFERENCES public.repair_request_statuses(id);
ALTER TABLE ONLY public.repair_workflow_stages ADD CONSTRAINT repair_workflow_stages_to_status_id_fkey FOREIGN KEY (to_status_id) REFERENCES public.repair_request_statuses(id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.users ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);

--
-- ============================================================================
-- SEQUENCE GRANTS
-- ============================================================================
--

GRANT SELECT,USAGE ON SEQUENCE public.action_logs_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.asset_attachments_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.asset_statuses_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.asset_tag_prefixes_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.asset_types_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.assets_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.assignment_attachments_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.assignments_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.branches_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.bulk_imported_users_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.bulk_user_imports_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.companies_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.departments_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.employees_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.expense_attachments_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.expense_types_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.expenses_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.refresh_tokens_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.repair_request_attachments_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.repair_request_history_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.repair_request_number_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.repair_request_priorities_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.repair_request_statuses_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.repair_request_types_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.repair_requests_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.repair_workflow_permissions_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.repair_workflow_stages_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.roles_id_seq TO PUBLIC;
GRANT SELECT,USAGE ON SEQUENCE public.users_id_seq TO PUBLIC;
GRANT ALL ON TABLE public.repair_workflow_permissions TO PUBLIC;
GRANT ALL ON TABLE public.repair_workflow_stages TO PUBLIC;

--
-- PostgreSQL database dump complete
--
-- ============================================================================
-- CLEAN DATABASE READY FOR PRODUCTION
-- ============================================================================
--
-- Default login credentials:
-- Email: dev@system.local
-- Password: Dev@123 (use same password hash from original system)
--
-- This database contains:
-- ✓ All dropdown/lookup data (asset types, statuses, branches, companies, etc.)
-- ✓ Workflow configuration (repair workflow stages and permissions)
-- ✓ System configuration (clean - no sensitive data)
-- ✓ Default Dev user and employee
-- ✗ No transaction records (assets, assignments, expenses, repair requests)
-- ✗ No action logs
-- ✗ No attachments
-- ✗ No sessions or tokens
-- ============================================================================
