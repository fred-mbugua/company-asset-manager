--
-- PostgreSQL database dump
--

\restrict 0W1kY7dguG7jHrrk5cAjjLtg94FfbstTNOYGBBTYwDFuLGP9UABs8d0mfT1FrKm

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-22 18:19:38

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
-- TOC entry 922 (class 1247 OID 90424)
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
-- TOC entry 925 (class 1247 OID 90434)
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
-- TOC entry 289 (class 1255 OID 106713)
-- Name: check_user_permission(integer, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_user_permission(p_user_id integer, p_module_code character varying, p_action character varying) RETURNS TABLE(has_permission boolean, branch_level_access boolean, user_branch_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN rp.id IS NOT NULL THEN TRUE ELSE FALSE END as has_permission,
        COALESCE(rp.branch_level_access, FALSE) as branch_level_access,
        u.branch_id as user_branch_id
    FROM users u
    LEFT JOIN role_permissions rp ON u.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id AND p.action = p_action
    LEFT JOIN modules m ON p.module_id = m.id AND m.code = p_module_code
    WHERE u.id = p_user_id
    LIMIT 1;
END;
$$;


ALTER FUNCTION public.check_user_permission(p_user_id integer, p_module_code character varying, p_action character varying) OWNER TO postgres;

--
-- TOC entry 287 (class 1255 OID 90443)
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
-- TOC entry 288 (class 1255 OID 90444)
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
-- TOC entry 219 (class 1259 OID 90445)
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

--
-- TOC entry 220 (class 1259 OID 90455)
-- Name: action_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.action_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.action_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5551 (class 0 OID 0)
-- Dependencies: 220
-- Name: action_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_logs_id_seq OWNED BY public.action_logs.id;


--
-- TOC entry 221 (class 1259 OID 90456)
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
    CONSTRAINT asset_attachments_storage_type_check CHECK (((storage_type)::text = ANY (ARRAY[('server'::character varying)::text, ('firebase'::character varying)::text])))
);


ALTER TABLE public.asset_attachments OWNER TO postgres;

--
-- TOC entry 5553 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE asset_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_attachments IS 'Stores file attachments and notes related to assets';


--
-- TOC entry 5554 (class 0 OID 0)
-- Dependencies: 221
-- Name: COLUMN asset_attachments.storage_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asset_attachments.storage_type IS 'Where this specific file is stored: server or firebase';


--
-- TOC entry 222 (class 1259 OID 90469)
-- Name: asset_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_attachments_id_seq OWNER TO postgres;

--
-- TOC entry 5555 (class 0 OID 0)
-- Dependencies: 222
-- Name: asset_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_attachments_id_seq OWNED BY public.asset_attachments.id;


--
-- TOC entry 223 (class 1259 OID 90470)
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

--
-- TOC entry 224 (class 1259 OID 90480)
-- Name: asset_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_statuses_id_seq OWNER TO postgres;

--
-- TOC entry 5557 (class 0 OID 0)
-- Dependencies: 224
-- Name: asset_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_statuses_id_seq OWNED BY public.asset_statuses.id;


--
-- TOC entry 225 (class 1259 OID 90481)
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

--
-- TOC entry 5559 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE asset_tag_prefixes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_tag_prefixes IS 'Stores prefix configurations for auto-generating unique asset tags based on asset type';


--
-- TOC entry 226 (class 1259 OID 90490)
-- Name: asset_tag_prefixes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_tag_prefixes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_tag_prefixes_id_seq OWNER TO postgres;

--
-- TOC entry 5560 (class 0 OID 0)
-- Dependencies: 226
-- Name: asset_tag_prefixes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_tag_prefixes_id_seq OWNED BY public.asset_tag_prefixes.id;


--
-- TOC entry 227 (class 1259 OID 90491)
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

--
-- TOC entry 228 (class 1259 OID 90500)
-- Name: asset_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_types_id_seq OWNER TO postgres;

--
-- TOC entry 5562 (class 0 OID 0)
-- Dependencies: 228
-- Name: asset_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_types_id_seq OWNED BY public.asset_types.id;


--
-- TOC entry 229 (class 1259 OID 90501)
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

--
-- TOC entry 230 (class 1259 OID 90511)
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assets_id_seq OWNER TO postgres;

--
-- TOC entry 5564 (class 0 OID 0)
-- Dependencies: 230
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- TOC entry 231 (class 1259 OID 90512)
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
    CONSTRAINT assignment_attachments_storage_type_check CHECK (((storage_type)::text = ANY (ARRAY[('server'::character varying)::text, ('firebase'::character varying)::text])))
);


ALTER TABLE public.assignment_attachments OWNER TO postgres;

--
-- TOC entry 5566 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE assignment_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.assignment_attachments IS 'Stores file attachments associated with asset assignments';


--
-- TOC entry 232 (class 1259 OID 90532)
-- Name: assignment_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignment_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_attachments_id_seq OWNER TO postgres;

--
-- TOC entry 5567 (class 0 OID 0)
-- Dependencies: 232
-- Name: assignment_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignment_attachments_id_seq OWNED BY public.assignment_attachments.id;


--
-- TOC entry 233 (class 1259 OID 90533)
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

--
-- TOC entry 234 (class 1259 OID 90542)
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignments_id_seq OWNER TO postgres;

--
-- TOC entry 5569 (class 0 OID 0)
-- Dependencies: 234
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- TOC entry 235 (class 1259 OID 90543)
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

--
-- TOC entry 236 (class 1259 OID 90552)
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branches_id_seq OWNER TO postgres;

--
-- TOC entry 5571 (class 0 OID 0)
-- Dependencies: 236
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- TOC entry 237 (class 1259 OID 90553)
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

--
-- TOC entry 5573 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE bulk_imported_users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.bulk_imported_users IS 'Stores individual user records from bulk imports with their auto-generated passwords';


--
-- TOC entry 5574 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN bulk_imported_users.auto_generated_password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.bulk_imported_users.auto_generated_password IS 'The auto-generated password for viewing purposes. Hidden once password is changed.';


--
-- TOC entry 238 (class 1259 OID 90566)
-- Name: bulk_imported_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bulk_imported_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bulk_imported_users_id_seq OWNER TO postgres;

--
-- TOC entry 5575 (class 0 OID 0)
-- Dependencies: 238
-- Name: bulk_imported_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bulk_imported_users_id_seq OWNED BY public.bulk_imported_users.id;


--
-- TOC entry 239 (class 1259 OID 90567)
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

--
-- TOC entry 5577 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE bulk_user_imports; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.bulk_user_imports IS 'Stores metadata about bulk user import batches';


--
-- TOC entry 240 (class 1259 OID 90581)
-- Name: bulk_user_imports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bulk_user_imports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bulk_user_imports_id_seq OWNER TO postgres;

--
-- TOC entry 5578 (class 0 OID 0)
-- Dependencies: 240
-- Name: bulk_user_imports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bulk_user_imports_id_seq OWNED BY public.bulk_user_imports.id;


--
-- TOC entry 241 (class 1259 OID 90582)
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

--
-- TOC entry 242 (class 1259 OID 90590)
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO postgres;

--
-- TOC entry 5580 (class 0 OID 0)
-- Dependencies: 242
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- TOC entry 243 (class 1259 OID 90591)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 90598)
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- TOC entry 5582 (class 0 OID 0)
-- Dependencies: 244
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- TOC entry 245 (class 1259 OID 90599)
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

--
-- TOC entry 5584 (class 0 OID 0)
-- Dependencies: 245
-- Name: COLUMN employees.company; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.employees.company IS 'Company the employee works for: Jirani, Atana, Caretaker, Samani, Jirani Smart, Jirani Energies';


--
-- TOC entry 246 (class 1259 OID 90609)
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- TOC entry 5585 (class 0 OID 0)
-- Dependencies: 246
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- TOC entry 247 (class 1259 OID 90610)
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
    CONSTRAINT expense_attachments_storage_type_check CHECK (((storage_type)::text = ANY (ARRAY[('server'::character varying)::text, ('firebase'::character varying)::text])))
);


ALTER TABLE public.expense_attachments OWNER TO postgres;

--
-- TOC entry 5587 (class 0 OID 0)
-- Dependencies: 247
-- Name: TABLE expense_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.expense_attachments IS 'Stores file attachments and notes related to expenses';


--
-- TOC entry 5588 (class 0 OID 0)
-- Dependencies: 247
-- Name: COLUMN expense_attachments.storage_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.expense_attachments.storage_type IS 'Where this specific file is stored: server or firebase';


--
-- TOC entry 248 (class 1259 OID 90623)
-- Name: expense_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expense_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expense_attachments_id_seq OWNER TO postgres;

--
-- TOC entry 5589 (class 0 OID 0)
-- Dependencies: 248
-- Name: expense_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expense_attachments_id_seq OWNED BY public.expense_attachments.id;


--
-- TOC entry 249 (class 1259 OID 90624)
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

--
-- TOC entry 250 (class 1259 OID 90633)
-- Name: expense_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expense_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expense_types_id_seq OWNER TO postgres;

--
-- TOC entry 5591 (class 0 OID 0)
-- Dependencies: 250
-- Name: expense_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expense_types_id_seq OWNED BY public.expense_types.id;


--
-- TOC entry 251 (class 1259 OID 90634)
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

--
-- TOC entry 5593 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN expenses.assigned_employee_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.expenses.assigned_employee_id IS 'The employee the asset was assigned to at the time of the expense';


--
-- TOC entry 252 (class 1259 OID 90644)
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO postgres;

--
-- TOC entry 5594 (class 0 OID 0)
-- Dependencies: 252
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- TOC entry 280 (class 1259 OID 106638)
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    parent_id integer,
    icon character varying(50),
    route character varying(255),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 106637)
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modules_id_seq OWNER TO postgres;

--
-- TOC entry 5596 (class 0 OID 0)
-- Dependencies: 279
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- TOC entry 282 (class 1259 OID 106663)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    module_id integer NOT NULL,
    action character varying(20) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT permissions_action_check CHECK (((action)::text = ANY ((ARRAY['read'::character varying, 'create'::character varying, 'update'::character varying, 'delete'::character varying])::text[])))
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 106662)
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- TOC entry 5597 (class 0 OID 0)
-- Dependencies: 281
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- TOC entry 253 (class 1259 OID 90645)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    token character varying(500) NOT NULL,
    user_id integer NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 90654)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5598 (class 0 OID 0)
-- Dependencies: 254
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 255 (class 1259 OID 90655)
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
    CONSTRAINT repair_request_attachments_storage_type_check CHECK (((storage_type)::text = ANY (ARRAY[('server'::character varying)::text, ('firebase'::character varying)::text])))
);


ALTER TABLE public.repair_request_attachments OWNER TO postgres;

--
-- TOC entry 5600 (class 0 OID 0)
-- Dependencies: 255
-- Name: TABLE repair_request_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_request_attachments IS 'Stores file attachments for repair requests';


--
-- TOC entry 5601 (class 0 OID 0)
-- Dependencies: 255
-- Name: COLUMN repair_request_attachments.attachment_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.repair_request_attachments.attachment_type IS 'Category: invoice, receipt, photo, document, general';


--
-- TOC entry 256 (class 1259 OID 90669)
-- Name: repair_request_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_request_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_request_attachments_id_seq OWNER TO postgres;

--
-- TOC entry 5602 (class 0 OID 0)
-- Dependencies: 256
-- Name: repair_request_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_request_attachments_id_seq OWNED BY public.repair_request_attachments.id;


--
-- TOC entry 257 (class 1259 OID 90670)
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

--
-- TOC entry 5604 (class 0 OID 0)
-- Dependencies: 257
-- Name: TABLE repair_request_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_request_history IS 'Audit trail for repair request actions and status changes';


--
-- TOC entry 258 (class 1259 OID 90680)
-- Name: repair_request_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_request_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_request_history_id_seq OWNER TO postgres;

--
-- TOC entry 5605 (class 0 OID 0)
-- Dependencies: 258
-- Name: repair_request_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_request_history_id_seq OWNED BY public.repair_request_history.id;


--
-- TOC entry 259 (class 1259 OID 90681)
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
-- TOC entry 260 (class 1259 OID 90682)
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

--
-- TOC entry 5608 (class 0 OID 0)
-- Dependencies: 260
-- Name: TABLE repair_request_priorities; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_request_priorities IS 'Stores priority levels for repair requests';


--
-- TOC entry 261 (class 1259 OID 90694)
-- Name: repair_request_priorities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_request_priorities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_request_priorities_id_seq OWNER TO postgres;

--
-- TOC entry 5609 (class 0 OID 0)
-- Dependencies: 261
-- Name: repair_request_priorities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_request_priorities_id_seq OWNED BY public.repair_request_priorities.id;


--
-- TOC entry 262 (class 1259 OID 90695)
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

--
-- TOC entry 5611 (class 0 OID 0)
-- Dependencies: 262
-- Name: TABLE repair_request_statuses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_request_statuses IS 'Stores status options for repair request workflow';


--
-- TOC entry 5612 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN repair_request_statuses.color_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.repair_request_statuses.color_code IS 'Hex color code for status badge display';


--
-- TOC entry 5613 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN repair_request_statuses.is_terminal; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.repair_request_statuses.is_terminal IS 'Whether this status represents a final state';


--
-- TOC entry 266 (class 1259 OID 90720)
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

--
-- TOC entry 5614 (class 0 OID 0)
-- Dependencies: 266
-- Name: TABLE repair_requests; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_requests IS 'Main table for repair request management';


--
-- TOC entry 5615 (class 0 OID 0)
-- Dependencies: 266
-- Name: COLUMN repair_requests.request_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.repair_requests.request_number IS 'Unique identifier like REQ-001, REQ-002';


--
-- TOC entry 268 (class 1259 OID 90736)
-- Name: repair_request_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.repair_request_stats AS
 SELECT count(*) AS total_requests,
    count(*) FILTER (WHERE ((rs.name)::text = 'Pending'::text)) AS pending_count,
    count(*) FILTER (WHERE ((rs.name)::text = ANY (ARRAY[('ICT Approved'::character varying)::text, ('In Repair'::character varying)::text, ('Awaiting Invoice'::character varying)::text, ('Invoice Submitted'::character varying)::text, ('Finance Approved'::character varying)::text]))) AS in_progress_count,
    count(*) FILTER (WHERE ((rs.name)::text = 'Completed'::text)) AS completed_count,
    count(*) FILTER (WHERE ((rs.name)::text = ANY (ARRAY[('ICT Rejected'::character varying)::text, ('Finance Rejected'::character varying)::text, ('Cancelled'::character varying)::text]))) AS rejected_count,
    COALESCE(sum(rr.invoice_amount) FILTER (WHERE ((rs.name)::text = 'Completed'::text)), (0)::numeric) AS total_completed_amount,
    COALESCE(sum(rr.invoice_amount) FILTER (WHERE ((rs.name)::text = 'Finance Approved'::text)), (0)::numeric) AS total_approved_amount
   FROM (public.repair_requests rr
     JOIN public.repair_request_statuses rs ON ((rr.status_id = rs.id)));


ALTER VIEW public.repair_request_stats OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 90708)
-- Name: repair_request_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_request_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_request_statuses_id_seq OWNER TO postgres;

--
-- TOC entry 5616 (class 0 OID 0)
-- Dependencies: 263
-- Name: repair_request_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_request_statuses_id_seq OWNED BY public.repair_request_statuses.id;


--
-- TOC entry 264 (class 1259 OID 90709)
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

--
-- TOC entry 5618 (class 0 OID 0)
-- Dependencies: 264
-- Name: TABLE repair_request_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_request_types IS 'Stores types of repair requests for customization';


--
-- TOC entry 265 (class 1259 OID 90719)
-- Name: repair_request_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_request_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_request_types_id_seq OWNER TO postgres;

--
-- TOC entry 5619 (class 0 OID 0)
-- Dependencies: 265
-- Name: repair_request_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_request_types_id_seq OWNED BY public.repair_request_types.id;


--
-- TOC entry 267 (class 1259 OID 90735)
-- Name: repair_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5621 (class 0 OID 0)
-- Dependencies: 267
-- Name: repair_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_requests_id_seq OWNED BY public.repair_requests.id;


--
-- TOC entry 269 (class 1259 OID 90741)
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

--
-- TOC entry 270 (class 1259 OID 90749)
-- Name: repair_workflow_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_workflow_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_workflow_permissions_id_seq OWNER TO postgres;

--
-- TOC entry 5624 (class 0 OID 0)
-- Dependencies: 270
-- Name: repair_workflow_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_workflow_permissions_id_seq OWNED BY public.repair_workflow_permissions.id;


--
-- TOC entry 271 (class 1259 OID 90750)
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

--
-- TOC entry 272 (class 1259 OID 90768)
-- Name: repair_workflow_stages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_workflow_stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_workflow_stages_id_seq OWNER TO postgres;

--
-- TOC entry 5627 (class 0 OID 0)
-- Dependencies: 272
-- Name: repair_workflow_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_workflow_stages_id_seq OWNED BY public.repair_workflow_stages.id;


--
-- TOC entry 284 (class 1259 OID 106687)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    branch_level_access boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 106686)
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO postgres;

--
-- TOC entry 5629 (class 0 OID 0)
-- Dependencies: 283
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- TOC entry 273 (class 1259 OID 90769)
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

--
-- TOC entry 274 (class 1259 OID 90774)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5630 (class 0 OID 0)
-- Dependencies: 274
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 275 (class 1259 OID 90775)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 90783)
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
    CONSTRAINT system_configuration_storage_type_check CHECK (((storage_type)::text = ANY (ARRAY[('server'::character varying)::text, ('firebase'::character varying)::text])))
);


ALTER TABLE public.system_configuration OWNER TO postgres;

--
-- TOC entry 5632 (class 0 OID 0)
-- Dependencies: 276
-- Name: TABLE system_configuration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.system_configuration IS 'Stores system-wide configuration including app name, company info, and storage settings';


--
-- TOC entry 5633 (class 0 OID 0)
-- Dependencies: 276
-- Name: COLUMN system_configuration.storage_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_configuration.storage_type IS 'Storage location: server (local) or firebase (cloud)';


--
-- TOC entry 5634 (class 0 OID 0)
-- Dependencies: 276
-- Name: COLUMN system_configuration.auto_send_password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_configuration.auto_send_password IS 'Whether to automatically send passwords to users after account creation';


--
-- TOC entry 277 (class 1259 OID 90800)
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

--
-- TOC entry 278 (class 1259 OID 90813)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5635 (class 0 OID 0)
-- Dependencies: 278
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 285 (class 1259 OID 106714)
-- Name: v_role_permissions; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_role_permissions AS
 SELECT r.id AS role_id,
    r.name AS role_name,
    m.id AS module_id,
    m.code AS module_code,
    m.name AS module_name,
    m.route AS module_route,
    p.id AS permission_id,
    p.action,
    rp.branch_level_access
   FROM (((public.roles r
     CROSS JOIN public.permissions p)
     JOIN public.modules m ON ((p.module_id = m.id)))
     LEFT JOIN public.role_permissions rp ON (((r.id = rp.role_id) AND (p.id = rp.permission_id))))
  WHERE ((r.is_active = true) AND (p.is_active = true) AND (m.is_active = true))
  ORDER BY r.name, m.display_order, m.name, p.action;


ALTER VIEW public.v_role_permissions OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 106719)
-- Name: v_user_permissions; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_user_permissions AS
 SELECT u.id AS user_id,
    u.email,
    u.branch_id,
    r.id AS role_id,
    r.name AS role_name,
    m.code AS module_code,
    m.name AS module_name,
    m.route AS module_route,
    p.action,
    rp.branch_level_access
   FROM ((((public.users u
     JOIN public.roles r ON ((u.role_id = r.id)))
     JOIN public.role_permissions rp ON ((r.id = rp.role_id)))
     JOIN public.permissions p ON ((rp.permission_id = p.id)))
     JOIN public.modules m ON ((p.module_id = m.id)))
  WHERE ((u.is_active = true) AND (r.is_active = true) AND (p.is_active = true) AND (m.is_active = true))
  ORDER BY u.email, m.display_order, m.name, p.action;


ALTER VIEW public.v_user_permissions OWNER TO postgres;

--
-- TOC entry 4989 (class 2604 OID 90814)
-- Name: action_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs ALTER COLUMN id SET DEFAULT nextval('public.action_logs_id_seq'::regclass);


--
-- TOC entry 4991 (class 2604 OID 90815)
-- Name: asset_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments ALTER COLUMN id SET DEFAULT nextval('public.asset_attachments_id_seq'::regclass);


--
-- TOC entry 4994 (class 2604 OID 90816)
-- Name: asset_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses ALTER COLUMN id SET DEFAULT nextval('public.asset_statuses_id_seq'::regclass);


--
-- TOC entry 4998 (class 2604 OID 90817)
-- Name: asset_tag_prefixes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes ALTER COLUMN id SET DEFAULT nextval('public.asset_tag_prefixes_id_seq'::regclass);


--
-- TOC entry 5002 (class 2604 OID 90818)
-- Name: asset_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types ALTER COLUMN id SET DEFAULT nextval('public.asset_types_id_seq'::regclass);


--
-- TOC entry 5005 (class 2604 OID 90819)
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- TOC entry 5006 (class 2604 OID 90820)
-- Name: assignment_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments ALTER COLUMN id SET DEFAULT nextval('public.assignment_attachments_id_seq'::regclass);


--
-- TOC entry 5010 (class 2604 OID 90821)
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- TOC entry 5011 (class 2604 OID 90822)
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- TOC entry 5014 (class 2604 OID 90823)
-- Name: bulk_imported_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users ALTER COLUMN id SET DEFAULT nextval('public.bulk_imported_users_id_seq'::regclass);


--
-- TOC entry 5019 (class 2604 OID 90824)
-- Name: bulk_user_imports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports ALTER COLUMN id SET DEFAULT nextval('public.bulk_user_imports_id_seq'::regclass);


--
-- TOC entry 5027 (class 2604 OID 90825)
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- TOC entry 5031 (class 2604 OID 90826)
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- TOC entry 5034 (class 2604 OID 90827)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 5036 (class 2604 OID 90828)
-- Name: expense_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments ALTER COLUMN id SET DEFAULT nextval('public.expense_attachments_id_seq'::regclass);


--
-- TOC entry 5039 (class 2604 OID 90829)
-- Name: expense_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types ALTER COLUMN id SET DEFAULT nextval('public.expense_types_id_seq'::regclass);


--
-- TOC entry 5042 (class 2604 OID 90830)
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- TOC entry 5096 (class 2604 OID 106641)
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- TOC entry 5101 (class 2604 OID 106666)
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- TOC entry 5043 (class 2604 OID 90831)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 5044 (class 2604 OID 90832)
-- Name: repair_request_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_attachments ALTER COLUMN id SET DEFAULT nextval('public.repair_request_attachments_id_seq'::regclass);


--
-- TOC entry 5048 (class 2604 OID 90833)
-- Name: repair_request_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history ALTER COLUMN id SET DEFAULT nextval('public.repair_request_history_id_seq'::regclass);


--
-- TOC entry 5050 (class 2604 OID 90834)
-- Name: repair_request_priorities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_priorities ALTER COLUMN id SET DEFAULT nextval('public.repair_request_priorities_id_seq'::regclass);


--
-- TOC entry 5056 (class 2604 OID 90835)
-- Name: repair_request_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_statuses ALTER COLUMN id SET DEFAULT nextval('public.repair_request_statuses_id_seq'::regclass);


--
-- TOC entry 5063 (class 2604 OID 90836)
-- Name: repair_request_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_types ALTER COLUMN id SET DEFAULT nextval('public.repair_request_types_id_seq'::regclass);


--
-- TOC entry 5067 (class 2604 OID 90837)
-- Name: repair_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests ALTER COLUMN id SET DEFAULT nextval('public.repair_requests_id_seq'::regclass);


--
-- TOC entry 5070 (class 2604 OID 90838)
-- Name: repair_workflow_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_permissions ALTER COLUMN id SET DEFAULT nextval('public.repair_workflow_permissions_id_seq'::regclass);


--
-- TOC entry 5073 (class 2604 OID 90839)
-- Name: repair_workflow_stages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_stages ALTER COLUMN id SET DEFAULT nextval('public.repair_workflow_stages_id_seq'::regclass);


--
-- TOC entry 5105 (class 2604 OID 106690)
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- TOC entry 5083 (class 2604 OID 90840)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 5093 (class 2604 OID 90841)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5481 (class 0 OID 90445)
-- Dependencies: 219
-- Data for Name: action_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.action_logs (id, user_id, action_type, entity_type, entity_id, details, created_at) FROM stdin;
1	1	LOGIN	User	1	{"email": "dev@system.local"}	2026-01-17 11:58:53.64108+03
2	1	LOGIN	User	1	{"email": "dev@system.local"}	2026-01-21 16:37:56.021864+03
3	1	CREATE	Asset	1	{"asset_tag": "ICT-LPT-001"}	2026-01-21 16:40:30.534133+03
4	1	CREATE	RepairRequest	1	{"title": "keyboard replacement", "request_number": "REQ-0001"}	2026-01-21 16:41:32.756914+03
5	1	STATUS_CHANGE	RepairRequest	1	{"notes": "approved", "to_status": "ICT Approved", "from_status": "Pending", "request_number": "REQ-0001"}	2026-01-21 16:41:51.206392+03
6	1	STATUS_CHANGE	RepairRequest	1	{"notes": "approved", "to_status": "In Repair", "from_status": "ICT Approved", "request_number": "REQ-0001"}	2026-01-21 16:42:03.040686+03
7	1	STATUS_CHANGE	RepairRequest	1	{"notes": "Invoice submitted for approval", "to_status": "Invoice Submitted", "from_status": "In Repair", "request_number": "REQ-0001"}	2026-01-21 16:42:59.326014+03
8	1	CREATE	RepairRequestAttachment	1	{"file_name": "google cloud - september.pdf", "repair_request_id": 1}	2026-01-21 16:42:59.381588+03
9	1	STATUS_CHANGE	RepairRequest	1	{"notes": "approved", "to_status": "Finance Approved", "from_status": "Invoice Submitted", "request_number": "REQ-0001"}	2026-01-21 16:43:19.275779+03
10	1	STATUS_CHANGE	RepairRequest	1	{"notes": "approved", "to_status": "Completed", "from_status": "Finance Approved", "request_number": "REQ-0001"}	2026-01-21 16:43:26.756646+03
11	1	LOGIN	User	1	{"email": "dev@system.local"}	2026-01-22 08:47:28.840994+03
12	1	LOGIN	User	1	{"email": "dev@system.local"}	2026-01-22 11:36:38.31664+03
13	1	LOGIN	User	1	{"email": "dev@system.local"}	2026-01-22 12:57:26.429206+03
14	1	LOGIN	User	1	{"email": "dev@system.local"}	2026-01-22 14:02:14.140477+03
15	1	LOGIN	User	1	{"email": "dev@system.local"}	2026-01-22 16:05:02.279736+03
16	1	UPDATE	SystemConfiguration	1	{"changes": {"company_logo_url": "/uploads/logos/1769089203921-Jirani Energies Logo.png"}, "new_data": {"id": 1, "app_name": "Asset Management System", "smtp_host": null, "smtp_port": 587, "smtp_user": null, "created_at": "2026-01-16T21:00:00.000Z", "updated_at": "2026-01-22T13:40:03.927Z", "smtp_secure": false, "storage_type": "server", "company_email": null, "company_phone": null, "smtp_password": null, "smtp_from_name": null, "company_address": null, "firebase_app_id": null, "smtp_from_email": null, "company_logo_url": "/uploads/logos/1769089203921-Jirani Energies Logo.png", "firebase_api_key": null, "auto_send_password": false, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "password_email_template": "Dear {first_name},\\n\\nYour account has been created in the Asset Management System.\\n\\nEmail: {email}\\nTemporary Password: {password}\\n\\nPlease login and change your password immediately.\\n\\nBest regards,\\n{company_name}", "firebase_messaging_sender_id": null}, "old_data": {"id": 1, "app_name": "Asset Management System", "smtp_host": null, "smtp_port": 587, "smtp_user": null, "created_at": "2026-01-16T21:00:00.000Z", "updated_at": "2026-01-16T21:00:00.000Z", "smtp_secure": false, "storage_type": "server", "company_email": null, "company_phone": null, "smtp_password": null, "smtp_from_name": null, "company_address": null, "firebase_app_id": null, "smtp_from_email": null, "company_logo_url": null, "firebase_api_key": null, "auto_send_password": false, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "password_email_template": "Dear {first_name},\\n\\nYour account has been created in the Asset Management System.\\n\\nEmail: {email}\\nTemporary Password: {password}\\n\\nPlease login and change your password immediately.\\n\\nBest regards,\\n{company_name}", "firebase_messaging_sender_id": null}}	2026-01-22 16:40:03.930636+03
17	1	LOGIN	User	1	{"email": "dev@system.local"}	2026-01-22 16:40:52.162663+03
18	1	UPDATE	SystemConfiguration	1	{"changes": {"app_name": "Asset Management System-JSL"}, "new_data": {"id": 1, "app_name": "Asset Management System-JSL", "smtp_host": null, "smtp_port": 587, "smtp_user": null, "created_at": "2026-01-16T21:00:00.000Z", "updated_at": "2026-01-22T13:41:02.362Z", "smtp_secure": false, "storage_type": "server", "company_email": null, "company_phone": null, "smtp_password": null, "smtp_from_name": null, "company_address": null, "firebase_app_id": null, "smtp_from_email": null, "company_logo_url": "/uploads/logos/1769089203921-Jirani Energies Logo.png", "firebase_api_key": null, "auto_send_password": false, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "password_email_template": "Dear {first_name},\\n\\nYour account has been created in the Asset Management System.\\n\\nEmail: {email}\\nTemporary Password: {password}\\n\\nPlease login and change your password immediately.\\n\\nBest regards,\\n{company_name}", "firebase_messaging_sender_id": null}, "old_data": {"id": 1, "app_name": "Asset Management System", "smtp_host": null, "smtp_port": 587, "smtp_user": null, "created_at": "2026-01-16T21:00:00.000Z", "updated_at": "2026-01-22T13:40:03.927Z", "smtp_secure": false, "storage_type": "server", "company_email": null, "company_phone": null, "smtp_password": null, "smtp_from_name": null, "company_address": null, "firebase_app_id": null, "smtp_from_email": null, "company_logo_url": "/uploads/logos/1769089203921-Jirani Energies Logo.png", "firebase_api_key": null, "auto_send_password": false, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "password_email_template": "Dear {first_name},\\n\\nYour account has been created in the Asset Management System.\\n\\nEmail: {email}\\nTemporary Password: {password}\\n\\nPlease login and change your password immediately.\\n\\nBest regards,\\n{company_name}", "firebase_messaging_sender_id": null}}	2026-01-22 16:41:02.363817+03
19	1	UPDATE	SystemConfiguration	1	{"changes": {"app_name": "Asset Management System"}, "new_data": {"id": 1, "app_name": "Asset Management System", "smtp_host": null, "smtp_port": 587, "smtp_user": null, "created_at": "2026-01-16T21:00:00.000Z", "updated_at": "2026-01-22T14:01:41.616Z", "smtp_secure": false, "storage_type": "server", "company_email": null, "company_phone": null, "smtp_password": null, "smtp_from_name": null, "company_address": null, "firebase_app_id": null, "smtp_from_email": null, "company_logo_url": "/uploads/logos/1769089203921-Jirani Energies Logo.png", "firebase_api_key": null, "auto_send_password": false, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "password_email_template": "Dear {first_name},\\n\\nYour account has been created in the Asset Management System.\\n\\nEmail: {email}\\nTemporary Password: {password}\\n\\nPlease login and change your password immediately.\\n\\nBest regards,\\n{company_name}", "firebase_messaging_sender_id": null}, "old_data": {"id": 1, "app_name": "Asset Management System-JSL", "smtp_host": null, "smtp_port": 587, "smtp_user": null, "created_at": "2026-01-16T21:00:00.000Z", "updated_at": "2026-01-22T13:41:02.362Z", "smtp_secure": false, "storage_type": "server", "company_email": null, "company_phone": null, "smtp_password": null, "smtp_from_name": null, "company_address": null, "firebase_app_id": null, "smtp_from_email": null, "company_logo_url": "/uploads/logos/1769089203921-Jirani Energies Logo.png", "firebase_api_key": null, "auto_send_password": false, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "password_email_template": "Dear {first_name},\\n\\nYour account has been created in the Asset Management System.\\n\\nEmail: {email}\\nTemporary Password: {password}\\n\\nPlease login and change your password immediately.\\n\\nBest regards,\\n{company_name}", "firebase_messaging_sender_id": null}}	2026-01-22 17:01:41.618274+03
20	1	LOGIN	User	1	{"email": "dev@system.local"}	2026-01-22 17:38:30.347599+03
21	1	UPDATE	User	1	{"new_data": {"phone": "+254740790088", "last_name": "Dev", "first_name": "Dev", "middle_name": "Dev"}, "old_data": {"id": 1, "role": "Admin", "email": "dev@system.local", "phone": "+254700000000", "role_id": 1, "location": "Mwatate, Taita Taveta.", "password": "$2a$10$pvN0OKHi7HAfYAoid6F3.e9ag3r57KVmPL/tezhi6zubmPPAlFp.C", "branch_id": 1, "is_active": true, "last_name": "Dev", "role_name": "Admin", "company_id": 5, "first_name": "Dev", "branch_name": "HQ", "employee_id": 1, "middle_name": "Dev", "company_name": "Jirani Smart", "departmnt_id": 6, "department_id": 6, "department_name": "ICT and Data entry", "is_bulk_imported": false, "employee_last_name": "Dev", "employee_first_name": "Dev", "is_password_changed": false, "password_changed_at": null, "employee_middle_name": "Dev"}}	2026-01-22 17:46:51.39894+03
22	1	UPDATE	User	1	{"new_data": {"phone": "+254740790088", "last_name": "Dev", "first_name": "Dev", "middle_name": "Dev"}, "old_data": {"id": 1, "role": "Admin", "email": "dev@system.local", "phone": "+254700000000", "role_id": 1, "location": "Mwatate, Taita Taveta.", "password": "$2a$10$pvN0OKHi7HAfYAoid6F3.e9ag3r57KVmPL/tezhi6zubmPPAlFp.C", "branch_id": 1, "is_active": true, "last_name": "Dev", "role_name": "Admin", "company_id": 5, "first_name": "Dev", "branch_name": "HQ", "employee_id": 1, "middle_name": "Dev", "company_name": "Jirani Smart", "departmnt_id": 6, "department_id": 6, "department_name": "ICT and Data entry", "is_bulk_imported": false, "employee_last_name": "Dev", "employee_first_name": "Dev", "is_password_changed": false, "password_changed_at": null, "employee_middle_name": "Dev"}}	2026-01-22 17:51:32.158881+03
\.


--
-- TOC entry 5483 (class 0 OID 90456)
-- Dependencies: 221
-- Data for Name: asset_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attachments (id, asset_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at) FROM stdin;
\.


--
-- TOC entry 5485 (class 0 OID 90470)
-- Dependencies: 223
-- Data for Name: asset_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_statuses (id, name, is_available, description, created_at, updated_at) FROM stdin;
1	In Use	f	Asset is currently assigned and deployed.	2025-10-09 18:12:23.042878+03	2025-10-09 18:12:23.042878+03
2	Under Repair	f	Asset is currently under repair.	2025-10-09 18:12:23.042878+03	2025-10-09 18:12:23.042878+03
3	In Stock	t	Asset is available in stock.	2025-10-09 18:12:42.355423+03	2025-10-09 18:12:42.355423+03
4	Disposed	f	Asset has been disposed.	2025-10-09 18:12:42.355423+03	2025-10-09 18:12:42.355423+03
\.


--
-- TOC entry 5487 (class 0 OID 90481)
-- Dependencies: 225
-- Data for Name: asset_tag_prefixes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_tag_prefixes (id, asset_type_id, prefix, last_sequence, created_at, updated_at) FROM stdin;
1	1	ICT-LPT	0	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
2	3	ICT-RTR	0	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
3	4	ICT-PRT	0	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
4	5	ICT-PRJ	0	2026-01-10 11:05:09.548102+03	2026-01-10 11:05:09.548102+03
\.


--
-- TOC entry 5489 (class 0 OID 90491)
-- Dependencies: 227
-- Data for Name: asset_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_types (id, name, description, created_at, updated_at) FROM stdin;
1	Laptop	Portable computers assigned to staff, typically high-value assets.	2025-10-09 16:56:06.312923+03	2025-10-09 16:56:06.312923+03
3	Router	Router.	2025-10-18 12:20:32.117117+03	2025-10-18 12:20:32.117117+03
4	Printer	Printer.	2025-10-18 12:20:54.583249+03	2025-10-18 12:20:54.583249+03
5	Projector	Projector	2026-01-10 11:03:11.701957+03	2026-01-10 11:03:11.701957+03
\.


--
-- TOC entry 5491 (class 0 OID 90501)
-- Dependencies: 229
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, asset_tag, asset_type, manufacturer, model, serial_number, status, purchase_date, purchase_price, notes, asset_type_id, asset_status_id, branch_id) FROM stdin;
1	ICT-LPT-001	Laptop	Dell	latitude	L-345679	In Stock	2026-01-20	40000.00	test laptop	1	3	1
\.


--
-- TOC entry 5493 (class 0 OID 90512)
-- Dependencies: 231
-- Data for Name: assignment_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_attachments (id, assignment_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5495 (class 0 OID 90533)
-- Dependencies: 233
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, asset_id, employee_id, assignment_date, return_date, notes) FROM stdin;
\.


--
-- TOC entry 5497 (class 0 OID 90543)
-- Dependencies: 235
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, location, created_at, updated_at) FROM stdin;
1	HQ	Mwatate, Taita Taveta.	2025-09-20 11:29:51.759883+03	2025-09-20 11:29:51.759883+03
\.


--
-- TOC entry 5499 (class 0 OID 90553)
-- Dependencies: 237
-- Data for Name: bulk_imported_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bulk_imported_users (id, bulk_import_id, user_id, employee_id, email, first_name, last_name, auto_generated_password, password_changed, password_changed_at, password_sent, password_sent_at, import_status, error_message, created_at) FROM stdin;
\.


--
-- TOC entry 5501 (class 0 OID 90567)
-- Dependencies: 239
-- Data for Name: bulk_user_imports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bulk_user_imports (id, batch_id, imported_by, total_records, successful_records, failed_records, import_type, status, created_at, completed_at) FROM stdin;
\.


--
-- TOC entry 5503 (class 0 OID 90582)
-- Dependencies: 241
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- TOC entry 5505 (class 0 OID 90591)
-- Dependencies: 243
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- TOC entry 5507 (class 0 OID 90599)
-- Dependencies: 245
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, first_name, branch_location, department, department_id, middle_name, last_name, branch_id, company) FROM stdin;
1	Dev	HQ	ICT and Data entry	6	Dev	Dev	1	Jirani Smart
\.


--
-- TOC entry 5509 (class 0 OID 90610)
-- Dependencies: 247
-- Data for Name: expense_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_attachments (id, expense_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at) FROM stdin;
\.


--
-- TOC entry 5511 (class 0 OID 90624)
-- Dependencies: 249
-- Data for Name: expense_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_types (id, name, description, created_at, updated_at) FROM stdin;
1	Purchase	Original capitalized cost of the asset.	2025-10-10 10:58:54.100412+03	2025-10-10 10:58:54.100412+03
3	Repair	Repair cost of the asset.	2025-10-10 11:07:44.784952+03	2025-10-10 11:07:44.784952+03
4	Logistics	Transport cost of the asset.	2025-10-10 11:08:14.682477+03	2025-10-10 11:08:14.682477+03
\.


--
-- TOC entry 5513 (class 0 OID 90634)
-- Dependencies: 251
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, asset_id, date, amount, vendor, invoice_number, notes, expense_type_id, assigned_employee_id) FROM stdin;
1	1	2026-01-21	3000.00	free style code technologies	#INV232346	Repair Request #1: keyboard replacement	3	\N
\.


--
-- TOC entry 5541 (class 0 OID 106638)
-- Dependencies: 280
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (id, name, code, description, parent_id, icon, route, display_order, is_active, created_at, updated_at) FROM stdin;
1	Dashboard	DASHBOARD	Main dashboard and overview	\N	uil-dashboard	/dashboard	1	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
2	Assets	ASSETS	Asset management module	\N	uil-briefcase	\N	2	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
3	Assignments	ASSIGNMENTS	Asset assignment module	\N	uil-clipboard-notes	\N	3	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
4	Expenses	EXPENSES	Expense management module	\N	uil-receipt	\N	4	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
5	Repair Requests	REPAIR_REQUESTS	Repair request management	\N	uil-wrench	\N	5	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
6	Reports	REPORTS	Reporting module	\N	uil-analytics	\N	6	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
7	Administration	ADMINISTRATION	Administrative functions	\N	uil-cog	\N	7	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
8	Settings	SETTINGS	System settings	\N	uil-setting	\N	8	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
9	Create Asset	ASSETS_CREATE	Create new assets	2	\N	/assets/create	1	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
10	View Assets	ASSETS_VIEW	View asset list	2	\N	/assets/view	2	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
11	View Assignments	ASSIGNMENTS_VIEW	View asset assignments	3	\N	/assets/view	1	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
12	Assign Assets	ASSIGNMENTS_ASSIGN	Assign assets to employees	3	\N	/assets/assign	2	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
13	Create Expense	EXPENSES_CREATE	Create new expenses	4	\N	/expenses/create	1	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
14	All Requests	REPAIR_REQUESTS_LIST	View all repair requests	5	\N	/repair-requests	1	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
15	New Request	REPAIR_REQUESTS_NEW	Create new repair request	5	\N	/repair-requests/new	2	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
16	Workflow Config	REPAIR_REQUESTS_WORKFLOW	Configure repair workflow	5	\N	/repair-requests/workflow	3	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
17	Assets Report	REPORTS_ASSETS	Asset reports	6	\N	/reports/assets	1	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
18	Expenses Report	REPORTS_EXPENSES	Expense reports	6	\N	/reports/expenses	2	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
19	Assignments Report	REPORTS_ASSIGNMENTS	Assignment reports	6	\N	/reports/assignments	3	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
20	Repair Summary	REPORTS_REPAIR_SUMMARY	Repair summary reports	6	\N	/reports/repair-summary	4	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
21	Action Logs	REPORTS_ACTION_LOGS	Action log reports	6	\N	/reports/action-logs	5	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
22	Users	ADMIN_USERS	User management	7	\N	/users/manage	1	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
23	Roles	ADMIN_ROLES	Role management	7	\N	/roles/manage	2	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
24	Permissions	ADMIN_PERMISSIONS	Permission management	7	\N	/permissions/manage	3	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
25	Branches	ADMIN_BRANCHES	Branch management	7	\N	/branches/manage	4	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
26	Departments	ADMIN_DEPARTMENTS	Department management	7	\N	/departments/manage	5	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
27	Asset Statuses	ADMIN_ASSET_STATUSES	Asset status management	7	\N	/asset-statuses/manage	6	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
28	Asset Types	ADMIN_ASSET_TYPES	Asset type management	7	\N	/asset-types/manage	7	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
29	Expense Types	ADMIN_EXPENSE_TYPES	Expense type management	7	\N	/expense-types/manage	8	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
30	Repair Types	ADMIN_REPAIR_TYPES	Repair type management	7	\N	/repair-request-types/manage	9	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
31	Repair Statuses	ADMIN_REPAIR_STATUSES	Repair status management	7	\N	/repair-request-statuses/manage	10	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
32	Repair Priorities	ADMIN_REPAIR_PRIORITIES	Repair priority management	7	\N	/repair-request-priorities/manage	11	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
33	System Configuration	SETTINGS_SYSTEM	System configuration	8	\N	/settings/configuration	1	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
\.


--
-- TOC entry 5543 (class 0 OID 106663)
-- Dependencies: 282
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, module_id, action, description, is_active, created_at, updated_at) FROM stdin;
1	1	read	View Dashboard	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
2	1	create	Create in Dashboard	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
3	1	update	Update in Dashboard	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
4	1	delete	Delete in Dashboard	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
5	2	read	View Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
6	2	create	Create in Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
7	2	update	Update in Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
8	2	delete	Delete in Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
9	3	read	View Assignments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
10	3	create	Create in Assignments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
11	3	update	Update in Assignments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
12	3	delete	Delete in Assignments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
13	4	read	View Expenses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
14	4	create	Create in Expenses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
15	4	update	Update in Expenses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
16	4	delete	Delete in Expenses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
17	5	read	View Repair Requests	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
18	5	create	Create in Repair Requests	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
19	5	update	Update in Repair Requests	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
20	5	delete	Delete in Repair Requests	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
21	6	read	View Reports	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
22	6	create	Create in Reports	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
23	6	update	Update in Reports	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
24	6	delete	Delete in Reports	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
25	7	read	View Administration	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
26	7	create	Create in Administration	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
27	7	update	Update in Administration	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
28	7	delete	Delete in Administration	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
29	8	read	View Settings	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
30	8	create	Create in Settings	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
31	8	update	Update in Settings	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
32	8	delete	Delete in Settings	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
33	9	read	View Create Asset	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
34	9	create	Create in Create Asset	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
35	9	update	Update in Create Asset	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
36	9	delete	Delete in Create Asset	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
37	10	read	View View Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
38	10	create	Create in View Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
39	10	update	Update in View Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
40	10	delete	Delete in View Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
41	11	read	View View Assignments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
42	11	create	Create in View Assignments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
43	11	update	Update in View Assignments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
44	11	delete	Delete in View Assignments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
45	12	read	View Assign Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
46	12	create	Create in Assign Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
47	12	update	Update in Assign Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
48	12	delete	Delete in Assign Assets	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
49	13	read	View Create Expense	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
50	13	create	Create in Create Expense	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
51	13	update	Update in Create Expense	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
52	13	delete	Delete in Create Expense	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
53	14	read	View All Requests	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
54	14	create	Create in All Requests	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
55	14	update	Update in All Requests	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
56	14	delete	Delete in All Requests	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
57	15	read	View New Request	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
58	15	create	Create in New Request	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
59	15	update	Update in New Request	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
60	15	delete	Delete in New Request	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
61	16	read	View Workflow Config	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
62	16	create	Create in Workflow Config	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
63	16	update	Update in Workflow Config	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
64	16	delete	Delete in Workflow Config	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
65	17	read	View Assets Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
66	17	create	Create in Assets Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
67	17	update	Update in Assets Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
68	17	delete	Delete in Assets Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
69	18	read	View Expenses Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
70	18	create	Create in Expenses Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
71	18	update	Update in Expenses Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
72	18	delete	Delete in Expenses Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
73	19	read	View Assignments Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
74	19	create	Create in Assignments Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
75	19	update	Update in Assignments Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
76	19	delete	Delete in Assignments Report	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
77	20	read	View Repair Summary	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
78	20	create	Create in Repair Summary	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
79	20	update	Update in Repair Summary	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
80	20	delete	Delete in Repair Summary	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
81	21	read	View Action Logs	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
82	21	create	Create in Action Logs	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
83	21	update	Update in Action Logs	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
84	21	delete	Delete in Action Logs	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
85	22	read	View Users	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
86	22	create	Create in Users	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
87	22	update	Update in Users	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
88	22	delete	Delete in Users	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
89	23	read	View Roles	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
90	23	create	Create in Roles	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
91	23	update	Update in Roles	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
92	23	delete	Delete in Roles	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
93	24	read	View Permissions	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
94	24	create	Create in Permissions	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
95	24	update	Update in Permissions	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
96	24	delete	Delete in Permissions	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
97	25	read	View Branches	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
98	25	create	Create in Branches	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
99	25	update	Update in Branches	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
100	25	delete	Delete in Branches	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
101	26	read	View Departments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
102	26	create	Create in Departments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
103	26	update	Update in Departments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
104	26	delete	Delete in Departments	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
105	27	read	View Asset Statuses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
106	27	create	Create in Asset Statuses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
107	27	update	Update in Asset Statuses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
108	27	delete	Delete in Asset Statuses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
109	28	read	View Asset Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
110	28	create	Create in Asset Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
111	28	update	Update in Asset Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
112	28	delete	Delete in Asset Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
113	29	read	View Expense Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
114	29	create	Create in Expense Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
115	29	update	Update in Expense Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
116	29	delete	Delete in Expense Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
117	30	read	View Repair Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
118	30	create	Create in Repair Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
119	30	update	Update in Repair Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
120	30	delete	Delete in Repair Types	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
121	31	read	View Repair Statuses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
122	31	create	Create in Repair Statuses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
123	31	update	Update in Repair Statuses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
124	31	delete	Delete in Repair Statuses	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
125	32	read	View Repair Priorities	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
126	32	create	Create in Repair Priorities	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
127	32	update	Update in Repair Priorities	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
128	32	delete	Delete in Repair Priorities	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
129	33	read	View System Configuration	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
130	33	create	Create in System Configuration	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
131	33	update	Update in System Configuration	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
132	33	delete	Delete in System Configuration	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
\.


--
-- TOC entry 5515 (class 0 OID 90645)
-- Dependencies: 253
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, token, user_id, expires_at) FROM stdin;
1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJkZXZAc3lzdGVtLmxvY2FsIiwicm9sZSI6IkFkbWluIiwicm9sZV9pZCI6MSwiaWF0IjoxNzY5MDkyNzEwLCJleHAiOjE3Njk2OTc1MTB9.XSLAx_BqcbIdXzP5kaSxCVK67w8JKyUA7dvx5Q5hIAE	1	2026-01-29 17:38:30.341+03
\.


--
-- TOC entry 5517 (class 0 OID 90655)
-- Dependencies: 255
-- Data for Name: repair_request_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_request_attachments (id, repair_request_id, file_name, file_path, file_size, file_type, storage_type, attachment_type, notes, uploaded_by, uploaded_at) FROM stdin;
1	1	google cloud - september.pdf	/uploads/repair-requests/1769002979365-google cloud - september.pdf	93259	application/pdf	server	invoice	\N	1	2026-01-21 16:42:59.369023+03
\.


--
-- TOC entry 5519 (class 0 OID 90670)
-- Dependencies: 257
-- Data for Name: repair_request_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_request_history (id, repair_request_id, action_type, from_status_id, to_status_id, performed_by, notes, metadata, created_at) FROM stdin;
1	1	CREATED	\N	1	1	Repair request created	\N	2026-01-21 16:41:32.748141+03
2	1	STATUS_CHANGE	1	2	1	approved	\N	2026-01-21 16:41:51.202312+03
3	1	STATUS_CHANGE	2	4	1	approved	\N	2026-01-21 16:42:03.037314+03
4	1	STATUS_CHANGE	4	6	1	Invoice submitted for approval	\N	2026-01-21 16:42:59.32237+03
5	1	ATTACHMENT_ADDED	\N	\N	1	Attachment added: google cloud - september.pdf	{"attachment_type": "invoice"}	2026-01-21 16:42:59.379112+03
6	1	STATUS_CHANGE	6	7	1	approved	\N	2026-01-21 16:43:19.271931+03
7	1	STATUS_CHANGE	7	9	1	approved	\N	2026-01-21 16:43:26.753382+03
\.


--
-- TOC entry 5522 (class 0 OID 90682)
-- Dependencies: 260
-- Data for Name: repair_request_priorities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_request_priorities (id, name, description, color_code, display_order, is_active, created_at, updated_at) FROM stdin;
1	Low	Non-urgent repairs that can wait	#28a745	1	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
2	Medium	Standard priority repairs	#ffc107	2	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
3	High	Urgent repairs needed soon	#fd7e14	3	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
4	Critical	Emergency repairs required immediately	#dc3545	4	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
\.


--
-- TOC entry 5524 (class 0 OID 90695)
-- Dependencies: 262
-- Data for Name: repair_request_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- TOC entry 5526 (class 0 OID 90709)
-- Dependencies: 264
-- Data for Name: repair_request_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_request_types (id, name, description, is_active, created_at, updated_at) FROM stdin;
1	Hardware Repair	Physical hardware repairs and fixes	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
2	Software Issue	Software-related problems and troubleshooting	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
3	Replacement Request	Request for equipment replacement	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
4	Maintenance	Routine maintenance and servicing	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
5	Upgrade Request	Hardware or software upgrade requests	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
\.


--
-- TOC entry 5528 (class 0 OID 90720)
-- Dependencies: 266
-- Data for Name: repair_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_requests (id, request_number, asset_id, request_type_id, priority_id, status_id, title, description, requested_by, branch_id, department_id, ict_reviewed_by, ict_reviewed_at, ict_notes, repair_started_at, repair_completed_at, repair_notes, vendor_name, invoice_number, invoice_amount, invoice_date, invoice_uploaded_by, invoice_uploaded_at, finance_reviewed_by, finance_reviewed_at, finance_notes, payment_reference, payment_date, created_at, updated_at, completed_at, expense_id, invoice_notes) FROM stdin;
1	REQ-0001	1	1	3	9	keyboard replacement	test	1	1	\N	1	2026-01-21 16:41:51.192476+03	approved	2026-01-21 16:42:03.030574+03	2026-01-21 16:43:26.747686+03	\N	free style code technologies	#INV232346	3000.00	2026-01-21	1	2026-01-21 16:42:59.299+03	1	2026-01-21 16:43:19.26982+03	approved	RFUWUWU	2026-01-21	2026-01-21 16:41:32.688898+03	2026-01-21 16:43:26.799445+03	2026-01-21 16:43:26.747686+03	1	\N
\.


--
-- TOC entry 5530 (class 0 OID 90741)
-- Dependencies: 269
-- Data for Name: repair_workflow_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- TOC entry 5532 (class 0 OID 90750)
-- Dependencies: 271
-- Data for Name: repair_workflow_stages; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- TOC entry 5545 (class 0 OID 106687)
-- Dependencies: 284
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role_id, permission_id, branch_level_access, created_at, updated_at) FROM stdin;
1	1	1	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
2	1	2	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
3	1	3	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
4	1	4	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
5	1	5	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
6	1	6	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
7	1	7	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
8	1	8	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
9	1	9	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
10	1	10	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
11	1	11	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
12	1	12	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
13	1	13	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
14	1	14	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
15	1	15	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
16	1	16	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
17	1	17	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
18	1	18	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
19	1	19	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
20	1	20	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
21	1	21	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
22	1	22	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
23	1	23	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
24	1	24	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
25	1	25	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
26	1	26	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
27	1	27	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
28	1	28	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
29	1	29	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
30	1	30	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
31	1	31	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
32	1	32	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
33	1	33	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
34	1	34	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
35	1	35	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
36	1	36	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
37	1	37	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
38	1	38	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
39	1	39	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
40	1	40	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
41	1	41	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
42	1	42	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
43	1	43	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
44	1	44	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
45	1	45	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
46	1	46	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
47	1	47	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
48	1	48	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
49	1	49	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
50	1	50	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
51	1	51	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
52	1	52	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
53	1	53	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
54	1	54	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
55	1	55	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
56	1	56	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
57	1	57	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
58	1	58	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
59	1	59	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
60	1	60	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
61	1	61	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
62	1	62	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
63	1	63	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
64	1	64	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
65	1	65	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
66	1	66	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
67	1	67	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
68	1	68	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
69	1	69	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
70	1	70	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
71	1	71	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
72	1	72	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
73	1	73	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
74	1	74	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
75	1	75	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
76	1	76	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
77	1	77	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
78	1	78	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
79	1	79	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
80	1	80	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
81	1	81	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
82	1	82	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
83	1	83	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
84	1	84	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
85	1	85	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
86	1	86	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
87	1	87	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
88	1	88	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
89	1	89	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
90	1	90	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
91	1	91	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
92	1	92	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
93	1	93	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
94	1	94	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
95	1	95	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
96	1	96	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
97	1	97	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
98	1	98	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
99	1	99	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
100	1	100	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
101	1	101	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
102	1	102	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
103	1	103	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
104	1	104	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
105	1	105	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
106	1	106	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
107	1	107	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
108	1	108	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
109	1	109	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
110	1	110	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
111	1	111	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
112	1	112	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
113	1	113	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
114	1	114	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
115	1	115	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
116	1	116	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
117	1	117	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
118	1	118	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
119	1	119	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
120	1	120	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
121	1	121	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
122	1	122	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
123	1	123	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
124	1	124	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
125	1	125	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
126	1	126	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
127	1	127	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
128	1	128	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
129	1	129	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
130	1	130	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
131	1	131	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
132	1	132	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
133	3	1	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
134	3	5	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
135	3	37	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
136	3	17	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
137	3	18	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
138	3	53	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
139	3	54	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
140	3	57	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
141	3	58	t	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
142	4	1	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
143	4	2	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
144	4	3	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
145	4	4	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
146	4	5	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
147	4	6	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
148	4	7	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
149	4	8	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
150	4	33	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
151	4	34	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
152	4	35	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
153	4	36	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
154	4	37	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
155	4	38	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
156	4	39	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
157	4	40	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
158	4	9	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
159	4	10	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
160	4	11	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
161	4	12	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
162	4	41	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
163	4	42	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
164	4	43	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
165	4	44	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
166	4	45	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
167	4	46	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
168	4	47	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
169	4	48	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
170	4	13	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
171	4	14	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
172	4	15	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
173	4	16	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
174	4	49	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
175	4	50	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
176	4	51	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
177	4	52	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
178	4	21	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
179	4	65	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
180	4	69	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
181	4	73	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
182	4	77	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
183	4	81	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
184	4	17	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
185	4	19	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
186	4	53	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
187	4	55	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
188	4	57	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
189	4	59	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
190	4	61	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
191	4	63	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
192	2	1	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
193	2	6	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
194	2	5	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
195	2	7	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
196	2	34	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
197	2	33	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
198	2	35	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
199	2	38	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
200	2	37	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
201	2	39	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
202	2	9	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
203	2	41	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
204	2	45	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
205	2	14	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
206	2	13	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
207	2	50	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
208	2	49	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
209	2	17	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
210	2	18	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
211	2	53	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
212	2	54	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
213	2	57	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
214	2	58	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
215	2	21	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
216	2	65	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
217	2	69	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
218	2	73	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
219	2	77	f	2026-01-22 11:45:20.242276	2026-01-22 11:45:20.242276
\.


--
-- TOC entry 5534 (class 0 OID 90769)
-- Dependencies: 273
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, updated_at, is_active) FROM stdin;
1	Admin	System Administrator with full access	2026-01-17 00:00:00+03	t
2	Standard User	Regular system user	2026-01-17 00:00:00+03	t
3	Branch User	Users with branch-level access only	\N	t
4	Finance Admin	Finance and Administration users	\N	t
\.


--
-- TOC entry 5536 (class 0 OID 90775)
-- Dependencies: 275
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
lo6dhJjLZExzsJ04yAumPOMBcoSylApn	{"cookie":{"originalMaxAge":86400000,"expires":"2026-01-23T11:14:10.671Z","secure":false,"httpOnly":true,"path":"/"},"returnTo":"/api/permissions/roles/1?grouped=true"}	2026-01-23 14:14:11
EoPRzqoQy6tDWL2xZIOaQOoImCTVlFZz	{"cookie":{"originalMaxAge":86400000,"expires":"2026-01-23T05:47:28.854Z","secure":false,"httpOnly":true,"path":"/"}}	2026-01-23 08:47:31
Fy6gSc6DzKWuDfMTgwyqkEbxplYNeqb-	{"cookie":{"originalMaxAge":86400000,"expires":"2026-01-23T13:05:02.286Z","secure":false,"httpOnly":true,"path":"/"}}	2026-01-23 18:06:53
\.


--
-- TOC entry 5537 (class 0 OID 90783)
-- Dependencies: 276
-- Data for Name: system_configuration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_configuration (id, app_name, company_logo_url, company_email, company_phone, company_address, storage_type, firebase_api_key, firebase_auth_domain, firebase_project_id, firebase_storage_bucket, firebase_messaging_sender_id, firebase_app_id, created_at, updated_at, auto_send_password, password_email_template, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, smtp_from_name, smtp_from_email) FROM stdin;
1	Asset Management System	/uploads/logos/1769089203921-Jirani Energies Logo.png	\N	\N	\N	server	\N	\N	\N	\N	\N	\N	2026-01-17 00:00:00+03	2026-01-22 17:01:41.616728+03	f	Dear {first_name},\n\nYour account has been created in the Asset Management System.\n\nEmail: {email}\nTemporary Password: {password}\n\nPlease login and change your password immediately.\n\nBest regards,\n{company_name}	\N	587	f	\N	\N	\N	\N
\.


--
-- TOC entry 5538 (class 0 OID 90800)
-- Dependencies: 277
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, employee_id, first_name, middle_name, last_name, email, password, role_id, department_id, phone, branch_id, is_active, is_password_changed, password_changed_at, is_bulk_imported, company_id) FROM stdin;
1	1	Dev	Dev	Dev	dev@system.local	$2a$10$pvN0OKHi7HAfYAoid6F3.e9ag3r57KVmPL/tezhi6zubmPPAlFp.C	1	6	+254740790088	1	t	f	\N	f	5
\.


--
-- TOC entry 5637 (class 0 OID 0)
-- Dependencies: 220
-- Name: action_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_logs_id_seq', 22, true);


--
-- TOC entry 5638 (class 0 OID 0)
-- Dependencies: 222
-- Name: asset_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_attachments_id_seq', 1, false);


--
-- TOC entry 5639 (class 0 OID 0)
-- Dependencies: 224
-- Name: asset_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_statuses_id_seq', 4, true);


--
-- TOC entry 5640 (class 0 OID 0)
-- Dependencies: 226
-- Name: asset_tag_prefixes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_tag_prefixes_id_seq', 4, true);


--
-- TOC entry 5641 (class 0 OID 0)
-- Dependencies: 228
-- Name: asset_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_types_id_seq', 5, true);


--
-- TOC entry 5642 (class 0 OID 0)
-- Dependencies: 230
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assets_id_seq', 1, true);


--
-- TOC entry 5643 (class 0 OID 0)
-- Dependencies: 232
-- Name: assignment_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignment_attachments_id_seq', 1, false);


--
-- TOC entry 5644 (class 0 OID 0)
-- Dependencies: 234
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignments_id_seq', 1, false);


--
-- TOC entry 5645 (class 0 OID 0)
-- Dependencies: 236
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 1, true);


--
-- TOC entry 5646 (class 0 OID 0)
-- Dependencies: 238
-- Name: bulk_imported_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bulk_imported_users_id_seq', 1, false);


--
-- TOC entry 5647 (class 0 OID 0)
-- Dependencies: 240
-- Name: bulk_user_imports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bulk_user_imports_id_seq', 1, false);


--
-- TOC entry 5648 (class 0 OID 0)
-- Dependencies: 242
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 6, true);


--
-- TOC entry 5649 (class 0 OID 0)
-- Dependencies: 244
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 17, true);


--
-- TOC entry 5650 (class 0 OID 0)
-- Dependencies: 246
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, true);


--
-- TOC entry 5651 (class 0 OID 0)
-- Dependencies: 248
-- Name: expense_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_attachments_id_seq', 1, false);


--
-- TOC entry 5652 (class 0 OID 0)
-- Dependencies: 250
-- Name: expense_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_types_id_seq', 4, true);


--
-- TOC entry 5653 (class 0 OID 0)
-- Dependencies: 252
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, true);


--
-- TOC entry 5654 (class 0 OID 0)
-- Dependencies: 279
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modules_id_seq', 33, true);


--
-- TOC entry 5655 (class 0 OID 0)
-- Dependencies: 281
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 132, true);


--
-- TOC entry 5656 (class 0 OID 0)
-- Dependencies: 254
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 15, true);


--
-- TOC entry 5657 (class 0 OID 0)
-- Dependencies: 256
-- Name: repair_request_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_attachments_id_seq', 1, true);


--
-- TOC entry 5658 (class 0 OID 0)
-- Dependencies: 258
-- Name: repair_request_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_history_id_seq', 7, true);


--
-- TOC entry 5659 (class 0 OID 0)
-- Dependencies: 259
-- Name: repair_request_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_number_seq', 1, true);


--
-- TOC entry 5660 (class 0 OID 0)
-- Dependencies: 261
-- Name: repair_request_priorities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_priorities_id_seq', 4, true);


--
-- TOC entry 5661 (class 0 OID 0)
-- Dependencies: 263
-- Name: repair_request_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_statuses_id_seq', 10, true);


--
-- TOC entry 5662 (class 0 OID 0)
-- Dependencies: 265
-- Name: repair_request_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_types_id_seq', 5, true);


--
-- TOC entry 5663 (class 0 OID 0)
-- Dependencies: 267
-- Name: repair_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_requests_id_seq', 1, true);


--
-- TOC entry 5664 (class 0 OID 0)
-- Dependencies: 270
-- Name: repair_workflow_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_workflow_permissions_id_seq', 8, true);


--
-- TOC entry 5665 (class 0 OID 0)
-- Dependencies: 272
-- Name: repair_workflow_stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_workflow_stages_id_seq', 8, true);


--
-- TOC entry 5666 (class 0 OID 0)
-- Dependencies: 283
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 219, true);


--
-- TOC entry 5667 (class 0 OID 0)
-- Dependencies: 274
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- TOC entry 5668 (class 0 OID 0)
-- Dependencies: 278
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 5117 (class 2606 OID 90843)
-- Name: action_logs action_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs
    ADD CONSTRAINT action_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5119 (class 2606 OID 90845)
-- Name: asset_attachments asset_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments
    ADD CONSTRAINT asset_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5123 (class 2606 OID 90847)
-- Name: asset_statuses asset_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses
    ADD CONSTRAINT asset_statuses_name_key UNIQUE (name);


--
-- TOC entry 5125 (class 2606 OID 90849)
-- Name: asset_statuses asset_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses
    ADD CONSTRAINT asset_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 5128 (class 2606 OID 90851)
-- Name: asset_tag_prefixes asset_tag_prefixes_asset_type_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes
    ADD CONSTRAINT asset_tag_prefixes_asset_type_id_key UNIQUE (asset_type_id);


--
-- TOC entry 5130 (class 2606 OID 90853)
-- Name: asset_tag_prefixes asset_tag_prefixes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes
    ADD CONSTRAINT asset_tag_prefixes_pkey PRIMARY KEY (id);


--
-- TOC entry 5132 (class 2606 OID 90855)
-- Name: asset_types asset_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT asset_types_name_key UNIQUE (name);


--
-- TOC entry 5134 (class 2606 OID 90857)
-- Name: asset_types asset_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT asset_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5137 (class 2606 OID 90859)
-- Name: assets assets_asset_tag_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_tag_key UNIQUE (asset_tag);


--
-- TOC entry 5139 (class 2606 OID 90861)
-- Name: assets assets_asset_tag_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_tag_unique UNIQUE (asset_tag);


--
-- TOC entry 5141 (class 2606 OID 90863)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- TOC entry 5143 (class 2606 OID 90865)
-- Name: assets assets_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_serial_number_key UNIQUE (serial_number);


--
-- TOC entry 5149 (class 2606 OID 90867)
-- Name: assignment_attachments assignment_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments
    ADD CONSTRAINT assignment_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5154 (class 2606 OID 90869)
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5159 (class 2606 OID 90871)
-- Name: branches branches_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_name_key UNIQUE (name);


--
-- TOC entry 5161 (class 2606 OID 90873)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 5163 (class 2606 OID 90875)
-- Name: bulk_imported_users bulk_imported_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_pkey PRIMARY KEY (id);


--
-- TOC entry 5167 (class 2606 OID 90877)
-- Name: bulk_user_imports bulk_user_imports_batch_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports
    ADD CONSTRAINT bulk_user_imports_batch_id_key UNIQUE (batch_id);


--
-- TOC entry 5169 (class 2606 OID 90879)
-- Name: bulk_user_imports bulk_user_imports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports
    ADD CONSTRAINT bulk_user_imports_pkey PRIMARY KEY (id);


--
-- TOC entry 5173 (class 2606 OID 90881)
-- Name: companies companies_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_name_key UNIQUE (name);


--
-- TOC entry 5175 (class 2606 OID 90883)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 5177 (class 2606 OID 90885)
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- TOC entry 5179 (class 2606 OID 90887)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 5181 (class 2606 OID 90889)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 5184 (class 2606 OID 90891)
-- Name: expense_attachments expense_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT expense_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5188 (class 2606 OID 90893)
-- Name: expense_types expense_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT expense_types_name_key UNIQUE (name);


--
-- TOC entry 5190 (class 2606 OID 90895)
-- Name: expense_types expense_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT expense_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5193 (class 2606 OID 90897)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 5263 (class 2606 OID 106654)
-- Name: modules modules_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_code_key UNIQUE (code);


--
-- TOC entry 5265 (class 2606 OID 106652)
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- TOC entry 5268 (class 2606 OID 106679)
-- Name: permissions permissions_module_id_action_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_module_id_action_key UNIQUE (module_id, action);


--
-- TOC entry 5270 (class 2606 OID 106677)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5199 (class 2606 OID 90899)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5201 (class 2606 OID 90901)
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- TOC entry 5203 (class 2606 OID 90903)
-- Name: refresh_tokens refresh_tokens_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_key UNIQUE (user_id);


--
-- TOC entry 5206 (class 2606 OID 90905)
-- Name: repair_request_attachments repair_request_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_attachments
    ADD CONSTRAINT repair_request_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5209 (class 2606 OID 90907)
-- Name: repair_request_history repair_request_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history
    ADD CONSTRAINT repair_request_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5211 (class 2606 OID 90909)
-- Name: repair_request_priorities repair_request_priorities_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_priorities
    ADD CONSTRAINT repair_request_priorities_name_key UNIQUE (name);


--
-- TOC entry 5213 (class 2606 OID 90911)
-- Name: repair_request_priorities repair_request_priorities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_priorities
    ADD CONSTRAINT repair_request_priorities_pkey PRIMARY KEY (id);


--
-- TOC entry 5215 (class 2606 OID 90913)
-- Name: repair_request_statuses repair_request_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_statuses
    ADD CONSTRAINT repair_request_statuses_name_key UNIQUE (name);


--
-- TOC entry 5217 (class 2606 OID 90915)
-- Name: repair_request_statuses repair_request_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_statuses
    ADD CONSTRAINT repair_request_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 5219 (class 2606 OID 90917)
-- Name: repair_request_types repair_request_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_types
    ADD CONSTRAINT repair_request_types_name_key UNIQUE (name);


--
-- TOC entry 5221 (class 2606 OID 90919)
-- Name: repair_request_types repair_request_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_types
    ADD CONSTRAINT repair_request_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5229 (class 2606 OID 90921)
-- Name: repair_requests repair_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5231 (class 2606 OID 90923)
-- Name: repair_requests repair_requests_request_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_request_number_key UNIQUE (request_number);


--
-- TOC entry 5235 (class 2606 OID 90925)
-- Name: repair_workflow_permissions repair_workflow_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_permissions
    ADD CONSTRAINT repair_workflow_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5237 (class 2606 OID 90927)
-- Name: repair_workflow_permissions repair_workflow_permissions_workflow_stage_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_permissions
    ADD CONSTRAINT repair_workflow_permissions_workflow_stage_id_role_id_key UNIQUE (workflow_stage_id, role_id);


--
-- TOC entry 5241 (class 2606 OID 90929)
-- Name: repair_workflow_stages repair_workflow_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_stages
    ADD CONSTRAINT repair_workflow_stages_pkey PRIMARY KEY (id);


--
-- TOC entry 5243 (class 2606 OID 90931)
-- Name: repair_workflow_stages repair_workflow_stages_stage_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_stages
    ADD CONSTRAINT repair_workflow_stages_stage_key_key UNIQUE (stage_key);


--
-- TOC entry 5274 (class 2606 OID 106698)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5276 (class 2606 OID 106700)
-- Name: role_permissions role_permissions_role_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);


--
-- TOC entry 5245 (class 2606 OID 90933)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 5247 (class 2606 OID 90935)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5249 (class 2606 OID 90937)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 5251 (class 2606 OID 90939)
-- Name: system_configuration system_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_configuration
    ADD CONSTRAINT system_configuration_pkey PRIMARY KEY (id);


--
-- TOC entry 5255 (class 2606 OID 90941)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5257 (class 2606 OID 90943)
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- TOC entry 5259 (class 2606 OID 90945)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5120 (class 1259 OID 90946)
-- Name: idx_asset_attachments_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_attachments_asset_id ON public.asset_attachments USING btree (asset_id);


--
-- TOC entry 5121 (class 1259 OID 90947)
-- Name: idx_asset_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_attachments_uploaded_by ON public.asset_attachments USING btree (uploaded_by);


--
-- TOC entry 5126 (class 1259 OID 90948)
-- Name: idx_asset_statuses_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_asset_statuses_name ON public.asset_statuses USING btree (name);


--
-- TOC entry 5135 (class 1259 OID 90949)
-- Name: idx_asset_types_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_asset_types_name ON public.asset_types USING btree (name);


--
-- TOC entry 5144 (class 1259 OID 90950)
-- Name: idx_assets_asset_tag; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_asset_tag ON public.assets USING btree (asset_tag);


--
-- TOC entry 5145 (class 1259 OID 90951)
-- Name: idx_assets_purchase_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_purchase_price ON public.assets USING btree (purchase_price);


--
-- TOC entry 5146 (class 1259 OID 90952)
-- Name: idx_assets_serial_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_serial_number ON public.assets USING btree (serial_number);


--
-- TOC entry 5147 (class 1259 OID 90953)
-- Name: idx_assets_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_type ON public.assets USING btree (asset_type);


--
-- TOC entry 5150 (class 1259 OID 90954)
-- Name: idx_assignment_attachments_assignment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_attachments_assignment_id ON public.assignment_attachments USING btree (assignment_id);


--
-- TOC entry 5151 (class 1259 OID 90955)
-- Name: idx_assignment_attachments_uploaded_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_attachments_uploaded_at ON public.assignment_attachments USING btree (uploaded_at);


--
-- TOC entry 5152 (class 1259 OID 90956)
-- Name: idx_assignment_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_attachments_uploaded_by ON public.assignment_attachments USING btree (uploaded_by);


--
-- TOC entry 5155 (class 1259 OID 90957)
-- Name: idx_assignments_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_asset_id ON public.assignments USING btree (asset_id);


--
-- TOC entry 5156 (class 1259 OID 90958)
-- Name: idx_assignments_current_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_current_asset ON public.assignments USING btree (employee_id, return_date) WHERE (return_date IS NULL);


--
-- TOC entry 5157 (class 1259 OID 90959)
-- Name: idx_assignments_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_employee_id ON public.assignments USING btree (employee_id);


--
-- TOC entry 5164 (class 1259 OID 90960)
-- Name: idx_bulk_imported_users_bulk_import_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_imported_users_bulk_import_id ON public.bulk_imported_users USING btree (bulk_import_id);


--
-- TOC entry 5165 (class 1259 OID 90961)
-- Name: idx_bulk_imported_users_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_imported_users_user_id ON public.bulk_imported_users USING btree (user_id);


--
-- TOC entry 5170 (class 1259 OID 90962)
-- Name: idx_bulk_user_imports_batch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_user_imports_batch_id ON public.bulk_user_imports USING btree (batch_id);


--
-- TOC entry 5171 (class 1259 OID 90963)
-- Name: idx_bulk_user_imports_imported_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_user_imports_imported_by ON public.bulk_user_imports USING btree (imported_by);


--
-- TOC entry 5182 (class 1259 OID 90964)
-- Name: idx_employees_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_location ON public.employees USING btree (branch_location);


--
-- TOC entry 5185 (class 1259 OID 90965)
-- Name: idx_expense_attachments_expense_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_attachments_expense_id ON public.expense_attachments USING btree (expense_id);


--
-- TOC entry 5186 (class 1259 OID 90966)
-- Name: idx_expense_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_attachments_uploaded_by ON public.expense_attachments USING btree (uploaded_by);


--
-- TOC entry 5191 (class 1259 OID 90967)
-- Name: idx_expense_types_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_expense_types_name ON public.expense_types USING btree (name);


--
-- TOC entry 5194 (class 1259 OID 90968)
-- Name: idx_expenses_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_asset_id ON public.expenses USING btree (asset_id);


--
-- TOC entry 5195 (class 1259 OID 90969)
-- Name: idx_expenses_assigned_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_assigned_employee ON public.expenses USING btree (assigned_employee_id);


--
-- TOC entry 5196 (class 1259 OID 90970)
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);


--
-- TOC entry 5260 (class 1259 OID 106660)
-- Name: idx_modules_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_modules_code ON public.modules USING btree (code);


--
-- TOC entry 5261 (class 1259 OID 106661)
-- Name: idx_modules_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_modules_parent_id ON public.modules USING btree (parent_id);


--
-- TOC entry 5266 (class 1259 OID 106685)
-- Name: idx_permissions_module_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_permissions_module_id ON public.permissions USING btree (module_id);


--
-- TOC entry 5197 (class 1259 OID 90971)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 5204 (class 1259 OID 90972)
-- Name: idx_repair_attachments_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_attachments_request ON public.repair_request_attachments USING btree (repair_request_id);


--
-- TOC entry 5207 (class 1259 OID 90973)
-- Name: idx_repair_request_history_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_request_history_request ON public.repair_request_history USING btree (repair_request_id);


--
-- TOC entry 5222 (class 1259 OID 90974)
-- Name: idx_repair_requests_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_asset ON public.repair_requests USING btree (asset_id);


--
-- TOC entry 5223 (class 1259 OID 90975)
-- Name: idx_repair_requests_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_branch ON public.repair_requests USING btree (branch_id);


--
-- TOC entry 5224 (class 1259 OID 90976)
-- Name: idx_repair_requests_expense_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_expense_id ON public.repair_requests USING btree (expense_id);


--
-- TOC entry 5225 (class 1259 OID 90977)
-- Name: idx_repair_requests_request_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_request_number ON public.repair_requests USING btree (request_number);


--
-- TOC entry 5226 (class 1259 OID 90978)
-- Name: idx_repair_requests_requested_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_requested_by ON public.repair_requests USING btree (requested_by);


--
-- TOC entry 5227 (class 1259 OID 90979)
-- Name: idx_repair_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_status ON public.repair_requests USING btree (status_id);


--
-- TOC entry 5271 (class 1259 OID 106712)
-- Name: idx_role_permissions_permission_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);


--
-- TOC entry 5272 (class 1259 OID 106711)
-- Name: idx_role_permissions_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);


--
-- TOC entry 5252 (class 1259 OID 90980)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5253 (class 1259 OID 90981)
-- Name: idx_users_is_bulk_imported; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_bulk_imported ON public.users USING btree (is_bulk_imported);


--
-- TOC entry 5232 (class 1259 OID 90982)
-- Name: idx_workflow_permissions_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_permissions_role ON public.repair_workflow_permissions USING btree (role_id);


--
-- TOC entry 5233 (class 1259 OID 90983)
-- Name: idx_workflow_permissions_stage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_permissions_stage ON public.repair_workflow_permissions USING btree (workflow_stage_id);


--
-- TOC entry 5238 (class 1259 OID 90984)
-- Name: idx_workflow_stages_from_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_stages_from_status ON public.repair_workflow_stages USING btree (from_status_id);


--
-- TOC entry 5239 (class 1259 OID 90985)
-- Name: idx_workflow_stages_stage_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_stages_stage_key ON public.repair_workflow_stages USING btree (stage_key);


--
-- TOC entry 5329 (class 2620 OID 90986)
-- Name: repair_requests trigger_generate_request_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_generate_request_number BEFORE INSERT ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.generate_repair_request_number();


--
-- TOC entry 5330 (class 2620 OID 90987)
-- Name: repair_requests trigger_update_repair_request_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_repair_request_timestamp BEFORE UPDATE ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.update_repair_request_timestamp();


--
-- TOC entry 5277 (class 2606 OID 90988)
-- Name: action_logs action_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs
    ADD CONSTRAINT action_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5281 (class 2606 OID 90993)
-- Name: assets asset_status_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT asset_status_id_fk FOREIGN KEY (asset_status_id) REFERENCES public.asset_statuses(id) ON DELETE CASCADE;


--
-- TOC entry 5280 (class 2606 OID 90998)
-- Name: asset_tag_prefixes asset_tag_prefixes_asset_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes
    ADD CONSTRAINT asset_tag_prefixes_asset_type_id_fkey FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id) ON DELETE CASCADE;


--
-- TOC entry 5282 (class 2606 OID 91003)
-- Name: assets asset_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT asset_type_id_fk FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id) ON DELETE CASCADE;


--
-- TOC entry 5284 (class 2606 OID 91008)
-- Name: assignment_attachments assignment_attachments_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments
    ADD CONSTRAINT assignment_attachments_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- TOC entry 5285 (class 2606 OID 91013)
-- Name: assignment_attachments assignment_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments
    ADD CONSTRAINT assignment_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5286 (class 2606 OID 91018)
-- Name: assignments assignments_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5287 (class 2606 OID 91023)
-- Name: assignments assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5283 (class 2606 OID 91028)
-- Name: assets branch_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- TOC entry 5288 (class 2606 OID 91033)
-- Name: bulk_imported_users bulk_imported_users_bulk_import_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_bulk_import_id_fkey FOREIGN KEY (bulk_import_id) REFERENCES public.bulk_user_imports(id) ON DELETE CASCADE;


--
-- TOC entry 5289 (class 2606 OID 91038)
-- Name: bulk_imported_users bulk_imported_users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5290 (class 2606 OID 91043)
-- Name: bulk_imported_users bulk_imported_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5291 (class 2606 OID 91048)
-- Name: bulk_user_imports bulk_user_imports_imported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports
    ADD CONSTRAINT bulk_user_imports_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES public.users(id);


--
-- TOC entry 5295 (class 2606 OID 91053)
-- Name: expenses expense_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expense_type_id_fk FOREIGN KEY (expense_type_id) REFERENCES public.expense_types(id) ON DELETE CASCADE;


--
-- TOC entry 5296 (class 2606 OID 91058)
-- Name: expenses expenses_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 5297 (class 2606 OID 91063)
-- Name: expenses expenses_assigned_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_assigned_employee_id_fkey FOREIGN KEY (assigned_employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5278 (class 2606 OID 91068)
-- Name: asset_attachments fk_asset_attachment_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments
    ADD CONSTRAINT fk_asset_attachment_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5279 (class 2606 OID 91073)
-- Name: asset_attachments fk_asset_attachment_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments
    ADD CONSTRAINT fk_asset_attachment_user FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5292 (class 2606 OID 91078)
-- Name: employees fk_employees_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 5293 (class 2606 OID 91083)
-- Name: expense_attachments fk_expense_attachment_expense; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT fk_expense_attachment_expense FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- TOC entry 5294 (class 2606 OID 91088)
-- Name: expense_attachments fk_expense_attachment_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT fk_expense_attachment_user FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5320 (class 2606 OID 91093)
-- Name: users fk_users_branch; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- TOC entry 5321 (class 2606 OID 91098)
-- Name: users fk_users_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- TOC entry 5322 (class 2606 OID 91103)
-- Name: users fk_users_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 5325 (class 2606 OID 106655)
-- Name: modules modules_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.modules(id) ON DELETE SET NULL;


--
-- TOC entry 5326 (class 2606 OID 106680)
-- Name: permissions permissions_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- TOC entry 5298 (class 2606 OID 91108)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5299 (class 2606 OID 91113)
-- Name: repair_request_attachments repair_request_attachments_repair_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_attachments
    ADD CONSTRAINT repair_request_attachments_repair_request_id_fkey FOREIGN KEY (repair_request_id) REFERENCES public.repair_requests(id) ON DELETE CASCADE;


--
-- TOC entry 5300 (class 2606 OID 91118)
-- Name: repair_request_attachments repair_request_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_attachments
    ADD CONSTRAINT repair_request_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 5301 (class 2606 OID 91123)
-- Name: repair_request_history repair_request_history_from_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history
    ADD CONSTRAINT repair_request_history_from_status_id_fkey FOREIGN KEY (from_status_id) REFERENCES public.repair_request_statuses(id);


--
-- TOC entry 5302 (class 2606 OID 91128)
-- Name: repair_request_history repair_request_history_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history
    ADD CONSTRAINT repair_request_history_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- TOC entry 5303 (class 2606 OID 91133)
-- Name: repair_request_history repair_request_history_repair_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history
    ADD CONSTRAINT repair_request_history_repair_request_id_fkey FOREIGN KEY (repair_request_id) REFERENCES public.repair_requests(id) ON DELETE CASCADE;


--
-- TOC entry 5304 (class 2606 OID 91138)
-- Name: repair_request_history repair_request_history_to_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history
    ADD CONSTRAINT repair_request_history_to_status_id_fkey FOREIGN KEY (to_status_id) REFERENCES public.repair_request_statuses(id);


--
-- TOC entry 5305 (class 2606 OID 91143)
-- Name: repair_requests repair_requests_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 5306 (class 2606 OID 91148)
-- Name: repair_requests repair_requests_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 5307 (class 2606 OID 91153)
-- Name: repair_requests repair_requests_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- TOC entry 5308 (class 2606 OID 91158)
-- Name: repair_requests repair_requests_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id);


--
-- TOC entry 5309 (class 2606 OID 91163)
-- Name: repair_requests repair_requests_finance_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_finance_reviewed_by_fkey FOREIGN KEY (finance_reviewed_by) REFERENCES public.users(id);


--
-- TOC entry 5310 (class 2606 OID 91168)
-- Name: repair_requests repair_requests_ict_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_ict_reviewed_by_fkey FOREIGN KEY (ict_reviewed_by) REFERENCES public.users(id);


--
-- TOC entry 5311 (class 2606 OID 91173)
-- Name: repair_requests repair_requests_invoice_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_invoice_uploaded_by_fkey FOREIGN KEY (invoice_uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 5312 (class 2606 OID 91178)
-- Name: repair_requests repair_requests_priority_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_priority_id_fkey FOREIGN KEY (priority_id) REFERENCES public.repair_request_priorities(id);


--
-- TOC entry 5313 (class 2606 OID 91183)
-- Name: repair_requests repair_requests_request_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_request_type_id_fkey FOREIGN KEY (request_type_id) REFERENCES public.repair_request_types(id);


--
-- TOC entry 5314 (class 2606 OID 91188)
-- Name: repair_requests repair_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- TOC entry 5315 (class 2606 OID 91193)
-- Name: repair_requests repair_requests_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.repair_request_statuses(id);


--
-- TOC entry 5316 (class 2606 OID 91198)
-- Name: repair_workflow_permissions repair_workflow_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_permissions
    ADD CONSTRAINT repair_workflow_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 5317 (class 2606 OID 91203)
-- Name: repair_workflow_permissions repair_workflow_permissions_workflow_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_permissions
    ADD CONSTRAINT repair_workflow_permissions_workflow_stage_id_fkey FOREIGN KEY (workflow_stage_id) REFERENCES public.repair_workflow_stages(id) ON DELETE CASCADE;


--
-- TOC entry 5318 (class 2606 OID 91208)
-- Name: repair_workflow_stages repair_workflow_stages_from_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_stages
    ADD CONSTRAINT repair_workflow_stages_from_status_id_fkey FOREIGN KEY (from_status_id) REFERENCES public.repair_request_statuses(id);


--
-- TOC entry 5319 (class 2606 OID 91213)
-- Name: repair_workflow_stages repair_workflow_stages_to_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_stages
    ADD CONSTRAINT repair_workflow_stages_to_status_id_fkey FOREIGN KEY (to_status_id) REFERENCES public.repair_request_statuses(id);


--
-- TOC entry 5327 (class 2606 OID 106706)
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- TOC entry 5328 (class 2606 OID 106701)
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 5323 (class 2606 OID 91218)
-- Name: users users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- TOC entry 5324 (class 2606 OID 91223)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 5552 (class 0 OID 0)
-- Dependencies: 220
-- Name: SEQUENCE action_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.action_logs_id_seq TO PUBLIC;


--
-- TOC entry 5556 (class 0 OID 0)
-- Dependencies: 222
-- Name: SEQUENCE asset_attachments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.asset_attachments_id_seq TO PUBLIC;


--
-- TOC entry 5558 (class 0 OID 0)
-- Dependencies: 224
-- Name: SEQUENCE asset_statuses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.asset_statuses_id_seq TO PUBLIC;


--
-- TOC entry 5561 (class 0 OID 0)
-- Dependencies: 226
-- Name: SEQUENCE asset_tag_prefixes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.asset_tag_prefixes_id_seq TO PUBLIC;


--
-- TOC entry 5563 (class 0 OID 0)
-- Dependencies: 228
-- Name: SEQUENCE asset_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.asset_types_id_seq TO PUBLIC;


--
-- TOC entry 5565 (class 0 OID 0)
-- Dependencies: 230
-- Name: SEQUENCE assets_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.assets_id_seq TO PUBLIC;


--
-- TOC entry 5568 (class 0 OID 0)
-- Dependencies: 232
-- Name: SEQUENCE assignment_attachments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.assignment_attachments_id_seq TO PUBLIC;


--
-- TOC entry 5570 (class 0 OID 0)
-- Dependencies: 234
-- Name: SEQUENCE assignments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.assignments_id_seq TO PUBLIC;


--
-- TOC entry 5572 (class 0 OID 0)
-- Dependencies: 236
-- Name: SEQUENCE branches_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.branches_id_seq TO PUBLIC;


--
-- TOC entry 5576 (class 0 OID 0)
-- Dependencies: 238
-- Name: SEQUENCE bulk_imported_users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.bulk_imported_users_id_seq TO PUBLIC;


--
-- TOC entry 5579 (class 0 OID 0)
-- Dependencies: 240
-- Name: SEQUENCE bulk_user_imports_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.bulk_user_imports_id_seq TO PUBLIC;


--
-- TOC entry 5581 (class 0 OID 0)
-- Dependencies: 242
-- Name: SEQUENCE companies_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.companies_id_seq TO PUBLIC;


--
-- TOC entry 5583 (class 0 OID 0)
-- Dependencies: 244
-- Name: SEQUENCE departments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.departments_id_seq TO PUBLIC;


--
-- TOC entry 5586 (class 0 OID 0)
-- Dependencies: 246
-- Name: SEQUENCE employees_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.employees_id_seq TO PUBLIC;


--
-- TOC entry 5590 (class 0 OID 0)
-- Dependencies: 248
-- Name: SEQUENCE expense_attachments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.expense_attachments_id_seq TO PUBLIC;


--
-- TOC entry 5592 (class 0 OID 0)
-- Dependencies: 250
-- Name: SEQUENCE expense_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.expense_types_id_seq TO PUBLIC;


--
-- TOC entry 5595 (class 0 OID 0)
-- Dependencies: 252
-- Name: SEQUENCE expenses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.expenses_id_seq TO PUBLIC;


--
-- TOC entry 5599 (class 0 OID 0)
-- Dependencies: 254
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.refresh_tokens_id_seq TO PUBLIC;


--
-- TOC entry 5603 (class 0 OID 0)
-- Dependencies: 256
-- Name: SEQUENCE repair_request_attachments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_attachments_id_seq TO PUBLIC;


--
-- TOC entry 5606 (class 0 OID 0)
-- Dependencies: 258
-- Name: SEQUENCE repair_request_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_history_id_seq TO PUBLIC;


--
-- TOC entry 5607 (class 0 OID 0)
-- Dependencies: 259
-- Name: SEQUENCE repair_request_number_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_number_seq TO PUBLIC;


--
-- TOC entry 5610 (class 0 OID 0)
-- Dependencies: 261
-- Name: SEQUENCE repair_request_priorities_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_priorities_id_seq TO PUBLIC;


--
-- TOC entry 5617 (class 0 OID 0)
-- Dependencies: 263
-- Name: SEQUENCE repair_request_statuses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_statuses_id_seq TO PUBLIC;


--
-- TOC entry 5620 (class 0 OID 0)
-- Dependencies: 265
-- Name: SEQUENCE repair_request_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_types_id_seq TO PUBLIC;


--
-- TOC entry 5622 (class 0 OID 0)
-- Dependencies: 267
-- Name: SEQUENCE repair_requests_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_requests_id_seq TO PUBLIC;


--
-- TOC entry 5623 (class 0 OID 0)
-- Dependencies: 269
-- Name: TABLE repair_workflow_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.repair_workflow_permissions TO PUBLIC;


--
-- TOC entry 5625 (class 0 OID 0)
-- Dependencies: 270
-- Name: SEQUENCE repair_workflow_permissions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_workflow_permissions_id_seq TO PUBLIC;


--
-- TOC entry 5626 (class 0 OID 0)
-- Dependencies: 271
-- Name: TABLE repair_workflow_stages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.repair_workflow_stages TO PUBLIC;


--
-- TOC entry 5628 (class 0 OID 0)
-- Dependencies: 272
-- Name: SEQUENCE repair_workflow_stages_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_workflow_stages_id_seq TO PUBLIC;


--
-- TOC entry 5631 (class 0 OID 0)
-- Dependencies: 274
-- Name: SEQUENCE roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.roles_id_seq TO PUBLIC;


--
-- TOC entry 5636 (class 0 OID 0)
-- Dependencies: 278
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.users_id_seq TO PUBLIC;


-- Completed on 2026-01-22 18:19:39

--
-- PostgreSQL database dump complete
--

\unrestrict 0W1kY7dguG7jHrrk5cAjjLtg94FfbstTNOYGBBTYwDFuLGP9UABs8d0mfT1FrKm

