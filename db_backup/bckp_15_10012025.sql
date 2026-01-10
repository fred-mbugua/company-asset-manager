--
-- PostgreSQL database dump
--

\restrict kpWDMtWUIIwJTqLIDgZ1dLIEAT1v1PVNt2tQZssRWtQeS3gNp5MdFSasd7QbbJN

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-10 13:33:51

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
-- TOC entry 893 (class 1247 OID 40962)
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
-- TOC entry 896 (class 1247 OID 40972)
-- Name: expense_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expense_type AS ENUM (
    'Purchase',
    'Repair',
    'Maintenance',
    'Upgrade'
);


ALTER TYPE public.expense_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 40981)
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
-- TOC entry 220 (class 1259 OID 40991)
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
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 220
-- Name: action_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_logs_id_seq OWNED BY public.action_logs.id;


--
-- TOC entry 248 (class 1259 OID 57361)
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

--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE asset_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_attachments IS 'Stores file attachments and notes related to assets';


--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN asset_attachments.storage_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asset_attachments.storage_type IS 'Where this specific file is stored: server or firebase';


--
-- TOC entry 247 (class 1259 OID 57360)
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
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 247
-- Name: asset_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_attachments_id_seq OWNED BY public.asset_attachments.id;


--
-- TOC entry 221 (class 1259 OID 40992)
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
-- TOC entry 222 (class 1259 OID 41002)
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
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 222
-- Name: asset_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_statuses_id_seq OWNED BY public.asset_statuses.id;


--
-- TOC entry 256 (class 1259 OID 81936)
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
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 256
-- Name: TABLE asset_tag_prefixes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_tag_prefixes IS 'Stores prefix configurations for auto-generating unique asset tags based on asset type';


--
-- TOC entry 255 (class 1259 OID 81935)
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
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 255
-- Name: asset_tag_prefixes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_tag_prefixes_id_seq OWNED BY public.asset_tag_prefixes.id;


--
-- TOC entry 223 (class 1259 OID 41003)
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
-- TOC entry 224 (class 1259 OID 41012)
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
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 224
-- Name: asset_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_types_id_seq OWNED BY public.asset_types.id;


--
-- TOC entry 225 (class 1259 OID 41013)
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
-- TOC entry 226 (class 1259 OID 41023)
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
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 226
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- TOC entry 252 (class 1259 OID 57419)
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

--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE assignment_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.assignment_attachments IS 'Stores file attachments associated with asset assignments';


--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.id IS 'Primary key';


--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.assignment_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.assignment_id IS 'Foreign key to assignments table';


--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.file_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.file_name IS 'Original name of the uploaded file';


--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.file_path; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.file_path IS 'Path to the file (local path or Firebase URL)';


--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.file_size; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.file_size IS 'Size of the file in bytes';


--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.file_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.file_type IS 'MIME type of the file';


--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.storage_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.storage_type IS 'Type of storage: server or firebase';


--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.notes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.notes IS 'Optional notes about the attachment';


--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.uploaded_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.uploaded_by IS 'Foreign key to users table - who uploaded the file';


--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.uploaded_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.uploaded_at IS 'Timestamp when the file was uploaded';


--
-- TOC entry 251 (class 1259 OID 57418)
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
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 251
-- Name: assignment_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignment_attachments_id_seq OWNED BY public.assignment_attachments.id;


--
-- TOC entry 227 (class 1259 OID 41024)
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
-- TOC entry 228 (class 1259 OID 41033)
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
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 228
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- TOC entry 229 (class 1259 OID 41034)
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
-- TOC entry 230 (class 1259 OID 41043)
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
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 230
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- TOC entry 260 (class 1259 OID 81989)
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
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 260
-- Name: TABLE bulk_imported_users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.bulk_imported_users IS 'Stores individual user records from bulk imports with their auto-generated passwords';


--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 260
-- Name: COLUMN bulk_imported_users.auto_generated_password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.bulk_imported_users.auto_generated_password IS 'The auto-generated password for viewing purposes. Hidden once password is changed.';


--
-- TOC entry 259 (class 1259 OID 81988)
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
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 259
-- Name: bulk_imported_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bulk_imported_users_id_seq OWNED BY public.bulk_imported_users.id;


--
-- TOC entry 258 (class 1259 OID 81964)
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
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 258
-- Name: TABLE bulk_user_imports; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.bulk_user_imports IS 'Stores metadata about bulk user import batches';


--
-- TOC entry 257 (class 1259 OID 81963)
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
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 257
-- Name: bulk_user_imports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bulk_user_imports_id_seq OWNED BY public.bulk_user_imports.id;


--
-- TOC entry 254 (class 1259 OID 81922)
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
-- TOC entry 253 (class 1259 OID 81921)
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
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 253
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- TOC entry 231 (class 1259 OID 41044)
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
-- TOC entry 232 (class 1259 OID 41051)
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
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 232
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- TOC entry 233 (class 1259 OID 41052)
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
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN employees.company; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.employees.company IS 'Company the employee works for: Jirani, Atana, Caretaker, Samani, Jirani Smart, Jirani Energies';


--
-- TOC entry 234 (class 1259 OID 41062)
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
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 234
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- TOC entry 250 (class 1259 OID 57390)
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

--
-- TOC entry 5347 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE expense_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.expense_attachments IS 'Stores file attachments and notes related to expenses';


--
-- TOC entry 5348 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN expense_attachments.storage_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.expense_attachments.storage_type IS 'Where this specific file is stored: server or firebase';


--
-- TOC entry 249 (class 1259 OID 57389)
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
-- TOC entry 5349 (class 0 OID 0)
-- Dependencies: 249
-- Name: expense_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expense_attachments_id_seq OWNED BY public.expense_attachments.id;


--
-- TOC entry 235 (class 1259 OID 41063)
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
-- TOC entry 236 (class 1259 OID 41072)
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
-- TOC entry 5350 (class 0 OID 0)
-- Dependencies: 236
-- Name: expense_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expense_types_id_seq OWNED BY public.expense_types.id;


--
-- TOC entry 237 (class 1259 OID 41073)
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
-- TOC entry 5351 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN expenses.assigned_employee_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.expenses.assigned_employee_id IS 'The employee the asset was assigned to at the time of the expense';


--
-- TOC entry 238 (class 1259 OID 41083)
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
-- TOC entry 5352 (class 0 OID 0)
-- Dependencies: 238
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- TOC entry 239 (class 1259 OID 41084)
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
-- TOC entry 240 (class 1259 OID 41093)
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
-- TOC entry 5353 (class 0 OID 0)
-- Dependencies: 240
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 241 (class 1259 OID 41094)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 41099)
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
-- TOC entry 5354 (class 0 OID 0)
-- Dependencies: 242
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 243 (class 1259 OID 41100)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 57345)
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

--
-- TOC entry 5355 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE system_configuration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.system_configuration IS 'Stores system-wide configuration including app name, company info, and storage settings';


--
-- TOC entry 5356 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN system_configuration.storage_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_configuration.storage_type IS 'Storage location: server (local) or firebase (cloud)';


--
-- TOC entry 5357 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN system_configuration.auto_send_password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_configuration.auto_send_password IS 'Whether to automatically send passwords to users after account creation';


--
-- TOC entry 244 (class 1259 OID 41108)
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
    is_bulk_imported boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 41119)
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
-- TOC entry 5358 (class 0 OID 0)
-- Dependencies: 245
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4918 (class 2604 OID 41120)
-- Name: action_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs ALTER COLUMN id SET DEFAULT nextval('public.action_logs_id_seq'::regclass);


--
-- TOC entry 4955 (class 2604 OID 57364)
-- Name: asset_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments ALTER COLUMN id SET DEFAULT nextval('public.asset_attachments_id_seq'::regclass);


--
-- TOC entry 4920 (class 2604 OID 41121)
-- Name: asset_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses ALTER COLUMN id SET DEFAULT nextval('public.asset_statuses_id_seq'::regclass);


--
-- TOC entry 4969 (class 2604 OID 81939)
-- Name: asset_tag_prefixes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes ALTER COLUMN id SET DEFAULT nextval('public.asset_tag_prefixes_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 41122)
-- Name: asset_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types ALTER COLUMN id SET DEFAULT nextval('public.asset_types_id_seq'::regclass);


--
-- TOC entry 4927 (class 2604 OID 41123)
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- TOC entry 4961 (class 2604 OID 57422)
-- Name: assignment_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments ALTER COLUMN id SET DEFAULT nextval('public.assignment_attachments_id_seq'::regclass);


--
-- TOC entry 4928 (class 2604 OID 41124)
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 41125)
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- TOC entry 4981 (class 2604 OID 81992)
-- Name: bulk_imported_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users ALTER COLUMN id SET DEFAULT nextval('public.bulk_imported_users_id_seq'::regclass);


--
-- TOC entry 4973 (class 2604 OID 81967)
-- Name: bulk_user_imports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports ALTER COLUMN id SET DEFAULT nextval('public.bulk_user_imports_id_seq'::regclass);


--
-- TOC entry 4965 (class 2604 OID 81925)
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- TOC entry 4932 (class 2604 OID 41126)
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- TOC entry 4935 (class 2604 OID 41127)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 4958 (class 2604 OID 57393)
-- Name: expense_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments ALTER COLUMN id SET DEFAULT nextval('public.expense_attachments_id_seq'::regclass);


--
-- TOC entry 4937 (class 2604 OID 41128)
-- Name: expense_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types ALTER COLUMN id SET DEFAULT nextval('public.expense_types_id_seq'::regclass);


--
-- TOC entry 4940 (class 2604 OID 41129)
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- TOC entry 4941 (class 2604 OID 41130)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4942 (class 2604 OID 41131)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4943 (class 2604 OID 41132)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5268 (class 0 OID 40981)
-- Dependencies: 219
-- Data for Name: action_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.action_logs (id, user_id, action_type, entity_type, entity_id, details, created_at) FROM stdin;
1	\N	CREATE	Branch	1	{"branch_name": "Headquarters"}	2025-09-20 11:29:51.782508+03
2	\N	CREATE	Branch	3	{"branch_name": "Mwatate"}	2025-12-09 10:22:40.243633+03
3	\N	CREATE	Branch	4	{"branch_name": "Mwatate"}	2025-12-09 11:16:42.776767+03
4	\N	CREATE	Department	17	{"department_name": "Finance/Admin"}	2025-12-09 12:46:26.054767+03
5	\N	CREATE	User	1	{"registered_email": "ict@jiranismart.com"}	2025-12-14 17:03:23.666433+03
6	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-14 17:03:45.293462+03
7	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-14 22:29:28.714387+03
8	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-14 22:29:34.057673+03
9	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-14 22:29:57.840292+03
10	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-14 22:30:08.948505+03
11	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-14 22:32:01.635139+03
12	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-14 22:33:39.064956+03
13	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-14 22:50:57.772984+03
14	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-17 07:36:28.013776+03
15	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-18 10:54:26.352879+03
16	1	CREATE	Asset	1	{"asset_tag": "LPT-RTR-007"}	2025-12-18 11:02:18.277739+03
17	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-23 11:04:38.204446+03
18	1	UPDATE	SystemConfiguration	1	{"changes": {"storage_type": "server"}, "new_data": {"id": 1, "app_name": "Asset Management System", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T08:07:03.843Z", "storage_type": "server", "company_email": null, "company_phone": null, "company_address": null, "firebase_app_id": null, "company_logo_url": null, "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}, "old_data": {"id": 1, "app_name": "Asset Management System", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T07:58:48.710Z", "storage_type": "server", "company_email": null, "company_phone": null, "company_address": null, "firebase_app_id": null, "company_logo_url": null, "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}}	2025-12-23 11:07:03.850713+03
19	1	UPDATE	SystemConfiguration	1	{"changes": {"app_name": "Asset Management System"}, "new_data": {"id": 1, "app_name": "Asset Management System", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T08:07:06.557Z", "storage_type": "server", "company_email": null, "company_phone": null, "company_address": null, "firebase_app_id": null, "company_logo_url": null, "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}, "old_data": {"id": 1, "app_name": "Asset Management System", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T08:07:03.843Z", "storage_type": "server", "company_email": null, "company_phone": null, "company_address": null, "firebase_app_id": null, "company_logo_url": null, "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}}	2025-12-23 11:07:06.562557+03
20	1	UPDATE	SystemConfiguration	1	{"changes": {"app_name": "Asset Management System-JSL"}, "new_data": {"id": 1, "app_name": "Asset Management System-JSL", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T08:07:38.544Z", "storage_type": "server", "company_email": null, "company_phone": null, "company_address": null, "firebase_app_id": null, "company_logo_url": null, "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}, "old_data": {"id": 1, "app_name": "Asset Management System", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T08:07:06.557Z", "storage_type": "server", "company_email": null, "company_phone": null, "company_address": null, "firebase_app_id": null, "company_logo_url": null, "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}}	2025-12-23 11:07:38.549472+03
21	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-23 11:08:01.555574+03
22	1	CREATE	AssetAttachment	1	{"asset_id": 1, "file_name": "BGS LOAN FORM ..pdf", "file_size": 154300}	2025-12-23 11:09:23.872533+03
23	1	UPDATE	Asset	1	{"new_data": {"notes": "New for ICT Office", "status": "In Stock", "asset_tag": "LPT-RTR-007", "branch_id": 1, "serial_number": "L-345679", "purchase_price": 5000, "asset_status_id": 3}, "old_data": {"id": 1, "model": "rtr-5er", "notes": "New for ICT Office", "status": "In Stock", "location": "Mwatate, Taita Taveta.", "asset_tag": "LPT-RTR-007", "branch_id": 1, "type_name": "Router", "asset_type": "Router", "branch_name": "HQ", "status_name": "In Stock", "manufacturer": "Huawei", "asset_type_id": 3, "purchase_date": "2025-12-16T21:00:00.000Z", "serial_number": "L-345679", "purchase_price": "5000.00", "asset_status_id": 3}}	2025-12-23 11:09:28.585961+03
24	1	DELETE	AssetAttachment	1	{"asset_id": 1, "file_name": "BGS LOAN FORM ..pdf"}	2025-12-23 11:11:43.971728+03
25	1	CREATE	Expense	1	{"amount": "3000.00", "asset_id": 1}	2025-12-23 11:14:10.371774+03
26	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-23 12:21:53.817864+03
27	1	CREATE	ExpenseAttachment	1	{"file_name": "Wote Status Page - 23122025.pdf", "file_size": 181882, "expense_id": 1}	2025-12-23 12:36:23.052156+03
28	1	DELETE	ExpenseAttachment	1	{"file_name": "Wote Status Page - 23122025.pdf", "expense_id": 1}	2025-12-23 12:41:40.475506+03
29	1	UPDATE	SystemConfiguration	1	{"changes": {"company_email": "info@jiranismart.com", "company_phone": "+254 722 810 781", "company_address": "P.O Box 25 - 80305 Mwatate. Kenya"}, "new_data": {"id": 1, "app_name": "Asset Management System-JSL", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T09:47:17.480Z", "storage_type": "server", "company_email": "info@jiranismart.com", "company_phone": "+254 722 810 781", "company_address": "P.O Box 25 - 80305 Mwatate. Kenya", "firebase_app_id": null, "company_logo_url": null, "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}, "old_data": {"id": 1, "app_name": "Asset Management System-JSL", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T08:07:38.544Z", "storage_type": "server", "company_email": null, "company_phone": null, "company_address": null, "firebase_app_id": null, "company_logo_url": null, "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}}	2025-12-23 12:47:17.484698+03
61	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-08 09:29:39.186169+03
30	1	UPDATE	SystemConfiguration	1	{"changes": {"company_logo_url": "/uploads/logos/1766483269971-4s1.png"}, "new_data": {"id": 1, "app_name": "Asset Management System-JSL", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T09:47:49.977Z", "storage_type": "server", "company_email": "info@jiranismart.com", "company_phone": "+254 722 810 781", "company_address": "P.O Box 25 - 80305 Mwatate. Kenya", "firebase_app_id": null, "company_logo_url": "/uploads/logos/1766483269971-4s1.png", "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}, "old_data": {"id": 1, "app_name": "Asset Management System-JSL", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T09:47:17.480Z", "storage_type": "server", "company_email": "info@jiranismart.com", "company_phone": "+254 722 810 781", "company_address": "P.O Box 25 - 80305 Mwatate. Kenya", "firebase_app_id": null, "company_logo_url": null, "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}}	2025-12-23 12:47:49.98055+03
31	1	UPDATE	SystemConfiguration	1	{"changes": {"company_email": "info@jiranismart.com", "company_phone": "+254 722 810 781", "company_address": "P.O Box 25 - 80305 Mwatate. Kenya"}, "new_data": {"id": 1, "app_name": "Asset Management System-JSL", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T09:47:53.048Z", "storage_type": "server", "company_email": "info@jiranismart.com", "company_phone": "+254 722 810 781", "company_address": "P.O Box 25 - 80305 Mwatate. Kenya", "firebase_app_id": null, "company_logo_url": "/uploads/logos/1766483269971-4s1.png", "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}, "old_data": {"id": 1, "app_name": "Asset Management System-JSL", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T09:47:49.977Z", "storage_type": "server", "company_email": "info@jiranismart.com", "company_phone": "+254 722 810 781", "company_address": "P.O Box 25 - 80305 Mwatate. Kenya", "firebase_app_id": null, "company_logo_url": "/uploads/logos/1766483269971-4s1.png", "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}}	2025-12-23 12:47:53.049935+03
32	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-23 12:49:07.955655+03
33	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-23 14:22:37.173446+03
34	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-23 14:31:14.035846+03
35	1	UPDATE	SystemConfiguration	1	{"changes": {"storage_type": "firebase", "firebase_app_id": "1:253932228031:web:39ad61f74c066caa15250a", "firebase_api_key": "AIzaSyCtiLqIjaqvbMVYglR5k_fLxrQUt1ezjiI", "firebase_project_id": "jirani-smart-limited-website", "firebase_auth_domain": "jirani-smart-limited-website.firebaseapp.com", "firebase_storage_bucket": "jirani-smart-limited-website.firebasestorage.app", "firebase_messaging_sender_id": "253932228031"}, "new_data": {"id": 1, "app_name": "Asset Management System-JSL", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T11:34:07.936Z", "storage_type": "firebase", "company_email": "info@jiranismart.com", "company_phone": "+254 722 810 781", "company_address": "P.O Box 25 - 80305 Mwatate. Kenya", "firebase_app_id": "1:253932228031:web:39ad61f74c066caa15250a", "company_logo_url": "/uploads/logos/1766483269971-4s1.png", "firebase_api_key": "AIzaSyCtiLqIjaqvbMVYglR5k_fLxrQUt1ezjiI", "firebase_project_id": "jirani-smart-limited-website", "firebase_auth_domain": "jirani-smart-limited-website.firebaseapp.com", "firebase_storage_bucket": "jirani-smart-limited-website.firebasestorage.app", "firebase_messaging_sender_id": "253932228031"}, "old_data": {"id": 1, "app_name": "Asset Management System-JSL", "created_at": "2025-12-23T07:58:48.710Z", "updated_at": "2025-12-23T09:47:53.048Z", "storage_type": "server", "company_email": "info@jiranismart.com", "company_phone": "+254 722 810 781", "company_address": "P.O Box 25 - 80305 Mwatate. Kenya", "firebase_app_id": null, "company_logo_url": "/uploads/logos/1766483269971-4s1.png", "firebase_api_key": null, "firebase_project_id": null, "firebase_auth_domain": null, "firebase_storage_bucket": null, "firebase_messaging_sender_id": null}}	2025-12-23 14:34:07.943112+03
36	1	CREATE	AssetAttachment	2	{"asset_id": 1, "file_name": "4s1.png", "file_size": 79421}	2025-12-23 14:51:33.21042+03
37	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-23 14:52:56.110061+03
38	1	CREATE	AssetAttachment	3	{"asset_id": 1, "file_name": "CamScanner 02-17-2024 11.12.pdf", "file_size": 756923}	2025-12-23 14:53:41.047774+03
39	1	ASSIGN ASSET	Assignment	1	{"asset_id": 1, "employee_id": 1, "branch_transferred": false, "asset_status_updated": "In Use"}	2025-12-23 14:55:11.971542+03
40	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-23 15:02:23.332298+03
41	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2025-12-23 15:24:20.701922+03
42	1	CREATE	AssignmentAttachment	1	{"file_name": "BRWD88083AF57F6_029341.pdf", "file_size": 178821, "assignment_id": 1}	2025-12-23 15:25:14.967821+03
43	1	DELETE	AssignmentAttachment	1	{"file_name": "BRWD88083AF57F6_029341.pdf", "assignment_id": 1}	2025-12-23 15:42:11.160691+03
44	1	DELETE	AssetAttachment	2	{"asset_id": 1, "file_name": "4s1.png"}	2025-12-23 15:43:27.379595+03
45	1	DELETE	AssetAttachment	3	{"asset_id": 1, "file_name": "CamScanner 02-17-2024 11.12.pdf"}	2025-12-23 15:43:52.486929+03
46	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 09:00:24.221941+03
47	1	CREATE	AssetAttachment	4	{"asset_id": 1, "file_name": "Appraisal JSL.pdf", "file_size": 201588}	2026-01-07 09:07:23.29189+03
48	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 09:17:01.513786+03
49	1	CREATE	AssignmentAttachment	2	{"file_name": "ACCOUNT FORFEITURE FORM.pdf", "file_size": 101858, "assignment_id": 1}	2026-01-07 09:25:50.964081+03
50	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 09:32:22.599365+03
51	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 10:35:11.838587+03
52	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 10:40:49.118021+03
53	1	CREATE	ExpenseAttachment	2	{"file_name": "4smile-Jiranismart Loan Application Form.pdf", "file_size": 89358, "expense_id": 1}	2026-01-07 10:43:18.603428+03
54	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 11:05:59.891326+03
55	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 11:36:57.069832+03
56	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 12:02:09.728483+03
57	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 12:14:54.443369+03
58	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 12:21:32.671522+03
59	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-07 12:49:00.681775+03
60	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-08 09:16:43.048146+03
62	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-08 14:30:26.162887+03
63	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-08 14:51:51.85682+03
64	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-08 14:57:22.934553+03
65	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-10 11:01:01.725025+03
66	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-10 11:34:05.047282+03
67	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-10 12:05:25.062756+03
68	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-10 12:53:59.619877+03
69	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-10 13:25:20.316426+03
70	1	BULK_IMPORT	User	8	{"email": "john.doe@example.com", "batch_id": 5}	2026-01-10 13:25:37.884129+03
71	1	BULK_IMPORT	User	9	{"email": "jane.smith@example.com", "batch_id": 5}	2026-01-10 13:25:38.032809+03
\.


--
-- TOC entry 5297 (class 0 OID 57361)
-- Dependencies: 248
-- Data for Name: asset_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attachments (id, asset_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at) FROM stdin;
4	1	Appraisal JSL.pdf	https://firebasestorage.googleapis.com/v0/b/jirani-smart-limited-website.firebasestorage.app/o/assets%2F1767766040989-Appraisal%20JSL.pdf?alt=media&token=006328f6-7142-46de-9894-6b73695cc9d8	201588	application/pdf	firebase	test purposes	1	2026-01-07 09:07:23.271675+03
\.


--
-- TOC entry 5270 (class 0 OID 40992)
-- Dependencies: 221
-- Data for Name: asset_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_statuses (id, name, is_available, description, created_at, updated_at) FROM stdin;
1	In Use	f	Asset is currently assigned and deployed.	2025-10-09 18:12:23.042878+03	2025-10-09 18:12:23.042878+03
3	In Stock	f	Asset is currently assigned and deployed.	2025-10-09 18:12:42.355423+03	2025-10-09 18:12:42.355423+03
\.


--
-- TOC entry 5305 (class 0 OID 81936)
-- Dependencies: 256
-- Data for Name: asset_tag_prefixes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_tag_prefixes (id, asset_type_id, prefix, last_sequence, created_at, updated_at) FROM stdin;
1	1	ICT-LPT	0	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
2	3	ICT-RTR	0	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
3	4	ICT-PRT	0	2026-01-10 10:53:12.807172+03	2026-01-10 10:53:12.807172+03
10	5	ICT-PRJ	0	2026-01-10 11:05:09.548102+03	2026-01-10 11:05:09.548102+03
\.


--
-- TOC entry 5272 (class 0 OID 41003)
-- Dependencies: 223
-- Data for Name: asset_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_types (id, name, description, created_at, updated_at) FROM stdin;
1	Laptop	Portable computers assigned to staff, typically high-value assets.	2025-10-09 16:56:06.312923+03	2025-10-09 16:56:06.312923+03
3	Router	Router.	2025-10-18 12:20:32.117117+03	2025-10-18 12:20:32.117117+03
4	Printer	Printer.	2025-10-18 12:20:54.583249+03	2025-10-18 12:20:54.583249+03
5	Projector	Projector	2026-01-10 11:03:11.701957+03	2026-01-10 11:03:11.701957+03
\.


--
-- TOC entry 5274 (class 0 OID 41013)
-- Dependencies: 225
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, asset_tag, asset_type, manufacturer, model, serial_number, status, purchase_date, purchase_price, notes, asset_type_id, asset_status_id, branch_id) FROM stdin;
1	LPT-RTR-007	Router	Huawei	rtr-5er	L-345679	In Use	2025-12-17	5000.00	New for ICT Office	3	1	1
\.


--
-- TOC entry 5301 (class 0 OID 57419)
-- Dependencies: 252
-- Data for Name: assignment_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_attachments (id, assignment_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at, created_at, updated_at) FROM stdin;
2	1	ACCOUNT FORFEITURE FORM.pdf	https://firebasestorage.googleapis.com/v0/b/jirani-smart-limited-website.firebasestorage.app/o/assignments%2F1767767149008-ACCOUNT%20FORFEITURE%20FORM.pdf?alt=media&token=287ad471-750c-4a77-9fb6-38c3dd54ce08	101858	application/pdf	firebase	test attachment	1	2026-01-07 09:25:50.951234+03	2026-01-07 09:25:50.951234+03	2026-01-07 09:25:50.951234+03
\.


--
-- TOC entry 5276 (class 0 OID 41024)
-- Dependencies: 227
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, asset_id, employee_id, assignment_date, return_date, notes) FROM stdin;
1	1	1	2025-12-23	\N	test
\.


--
-- TOC entry 5278 (class 0 OID 41034)
-- Dependencies: 229
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, location, created_at, updated_at) FROM stdin;
1	HQ	Mwatate, Taita Taveta.	2025-09-20 11:29:51.759883+03	2025-09-20 11:29:51.759883+03
4	Mwatate	Mwatate, Taita Taveta	2025-12-09 11:16:42.772688+03	2025-12-09 11:16:42.772688+03
\.


--
-- TOC entry 5309 (class 0 OID 81989)
-- Dependencies: 260
-- Data for Name: bulk_imported_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bulk_imported_users (id, bulk_import_id, user_id, employee_id, email, first_name, last_name, auto_generated_password, password_changed, password_changed_at, password_sent, password_sent_at, import_status, error_message, created_at) FROM stdin;
1	1	\N	\N	john.doe@example.com	John	Doe	yH5!yFSe8Q$4	f	\N	f	\N	failed	null value in column "branch_id" of relation "employees" violates not-null constraint	2026-01-10 12:13:30.867266+03
2	1	\N	\N	jane.smith@example.com	Jane	Smith	Z#X$tQ$k6khI	f	\N	f	\N	failed	null value in column "branch_id" of relation "employees" violates not-null constraint	2026-01-10 12:13:31.059714+03
4	2	\N	\N	john.doe@example.com	John	Doe	tFcn0mF0VR%o	f	\N	f	\N	failed	insert or update on table "bulk_imported_users" violates foreign key constraint "bulk_imported_users_user_id_fkey"	2026-01-10 12:55:30.212255+03
6	2	\N	\N	jane.smith@example.com	Jane	Smith	UJp!Ahi2TGHv	f	\N	f	\N	failed	insert or update on table "bulk_imported_users" violates foreign key constraint "bulk_imported_users_user_id_fkey"	2026-01-10 12:55:30.382531+03
8	3	\N	\N	john.doe@example.com	John	Doe	oJ7u!fk@mgsJ	f	\N	f	\N	failed	insert or update on table "bulk_imported_users" violates foreign key constraint "bulk_imported_users_user_id_fkey"	2026-01-10 13:16:28.530439+03
10	3	\N	\N	jane.smith@example.com	Jane	Smith	tY1uQe55&2co	f	\N	f	\N	failed	insert or update on table "bulk_imported_users" violates foreign key constraint "bulk_imported_users_user_id_fkey"	2026-01-10 13:16:28.65001+03
12	4	\N	\N	john.doe@example.com	John	Doe	iS8B&%&#F@xA	f	\N	f	\N	failed	insert or update on table "bulk_imported_users" violates foreign key constraint "bulk_imported_users_user_id_fkey"	2026-01-10 13:21:08.377721+03
14	4	\N	\N	jane.smith@example.com	Jane	Smith	qA4R#0v!xKbA	f	\N	f	\N	failed	insert or update on table "bulk_imported_users" violates foreign key constraint "bulk_imported_users_user_id_fkey"	2026-01-10 13:21:08.560735+03
15	5	8	10	john.doe@example.com	John	Doe	M!H4O5mWKnn3	f	\N	f	\N	success	\N	2026-01-10 13:25:37.867402+03
16	5	9	11	jane.smith@example.com	Jane	Smith	*Xp!bT$D7qGN	f	\N	f	\N	success	\N	2026-01-10 13:25:38.029523+03
\.


--
-- TOC entry 5307 (class 0 OID 81964)
-- Dependencies: 258
-- Data for Name: bulk_user_imports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bulk_user_imports (id, batch_id, imported_by, total_records, successful_records, failed_records, import_type, status, created_at, completed_at) FROM stdin;
1	14997808-6f16-4da1-a0b0-c37f7b973a1b	1	2	0	2	excel	completed	2026-01-10 12:13:30.710803+03	2026-01-10 12:13:31.068399+03
2	f067c8fe-b442-409d-94ec-3afb9dc1d7bc	1	2	0	2	excel	completed	2026-01-10 12:55:29.963674+03	2026-01-10 12:55:30.389019+03
3	6d3b4962-0a79-4744-8e5c-ffb7d37d5470	1	2	0	2	excel	completed	2026-01-10 13:16:28.407119+03	2026-01-10 13:16:28.658999+03
4	ea8d1a29-634e-46ba-9441-55436b7cbe15	1	2	0	2	excel	completed	2026-01-10 13:21:08.173298+03	2026-01-10 13:21:08.567792+03
5	b5e062c0-a496-4bde-b008-55860f291ff2	1	2	2	0	excel	completed	2026-01-10 13:25:37.595089+03	2026-01-10 13:25:38.035345+03
\.


--
-- TOC entry 5303 (class 0 OID 81922)
-- Dependencies: 254
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
-- TOC entry 5280 (class 0 OID 41044)
-- Dependencies: 231
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
-- TOC entry 5282 (class 0 OID 41052)
-- Dependencies: 233
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, first_name, branch_location, department, department_id, middle_name, last_name, branch_id, company) FROM stdin;
1	Dev	\N	\N	1	Dev	Dev	1	Jirani
4	John	\N	ICT and Data entry	6	M	Doe	\N	Jirani
5	Jane	\N	Finance	8		Smith	\N	Atana
6	John	\N	ICT and Data entry	6	M	Doe	\N	Jirani
7	Jane	\N	Finance	8		Smith	\N	Atana
8	John	\N	ICT and Data entry	6	M	Doe	\N	Jirani
9	Jane	\N	Finance	8		Smith	\N	Atana
10	John	\N	ICT and Data entry	6	M	Doe	\N	Jirani
11	Jane	\N	Finance	8		Smith	\N	Atana
\.


--
-- TOC entry 5299 (class 0 OID 57390)
-- Dependencies: 250
-- Data for Name: expense_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_attachments (id, expense_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at) FROM stdin;
2	1	4smile-Jiranismart Loan Application Form.pdf	https://firebasestorage.googleapis.com/v0/b/jirani-smart-limited-website.firebasestorage.app/o/expenses%2F1767771793767-4smile-Jiranismart%20Loan%20Application%20Form.pdf?alt=media&token=229e5f46-af03-498d-9de1-269965de6189	89358	application/pdf	firebase	test document	1	2026-01-07 10:43:18.568264+03
\.


--
-- TOC entry 5284 (class 0 OID 41063)
-- Dependencies: 235
-- Data for Name: expense_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_types (id, name, description, created_at, updated_at) FROM stdin;
1	Purchase	Original capitalized cost of the asset.	2025-10-10 10:58:54.100412+03	2025-10-10 10:58:54.100412+03
3	Repair	Repair cost of the asset.	2025-10-10 11:07:44.784952+03	2025-10-10 11:07:44.784952+03
4	Logistics	Transport cost of the asset.	2025-10-10 11:08:14.682477+03	2025-10-10 11:08:14.682477+03
\.


--
-- TOC entry 5286 (class 0 OID 41073)
-- Dependencies: 237
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, asset_id, date, amount, vendor, invoice_number, notes, expense_type_id, assigned_employee_id) FROM stdin;
1	1	2025-12-23	3000.00	Free technologies	240	Charging system repair	3	1
\.


--
-- TOC entry 5288 (class 0 OID 41084)
-- Dependencies: 239
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, token, user_id, expires_at) FROM stdin;
1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpY3RAamlyYW5pc21hcnQuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzY4MDQwNzIwLCJleHAiOjE3Njg2NDU1MjB9.Mt_1yntbwX3pL82AOX5uN_BTtIUb5NM3HR_9WyFmSV8	1	2026-01-17 13:25:20.31+03
\.


--
-- TOC entry 5290 (class 0 OID 41094)
-- Dependencies: 241
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	Admin
2	Standard User
\.


--
-- TOC entry 5292 (class 0 OID 41100)
-- Dependencies: 243
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
tob3CuNULyl5_lVQc-Mfre4-dFntJO8_	{"cookie":{"originalMaxAge":86400000,"expires":"2026-01-11T08:01:01.738Z","secure":false,"httpOnly":true,"path":"/"}}	2026-01-11 13:33:04
\.


--
-- TOC entry 5295 (class 0 OID 57345)
-- Dependencies: 246
-- Data for Name: system_configuration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_configuration (id, app_name, company_logo_url, company_email, company_phone, company_address, storage_type, firebase_api_key, firebase_auth_domain, firebase_project_id, firebase_storage_bucket, firebase_messaging_sender_id, firebase_app_id, created_at, updated_at, auto_send_password, password_email_template, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, smtp_from_name, smtp_from_email) FROM stdin;
1	Asset Management System-JSL	/uploads/logos/1766483269971-4s1.png	info@jiranismart.com	+254 722 810 781	P.O Box 25 - 80305 Mwatate. Kenya	firebase	AIzaSyCtiLqIjaqvbMVYglR5k_fLxrQUt1ezjiI	jirani-smart-limited-website.firebaseapp.com	jirani-smart-limited-website	jirani-smart-limited-website.firebasestorage.app	253932228031	1:253932228031:web:39ad61f74c066caa15250a	2025-12-23 10:58:48.710946+03	2025-12-23 14:34:07.936158+03	f	Dear {first_name},\n\nYour account has been created in the Asset Management System.\n\nEmail: {email}\nTemporary Password: {password}\n\nPlease login and change your password immediately.\n\nBest regards,\n{company_name}	\N	587	f	\N	\N	\N	\N
\.


--
-- TOC entry 5293 (class 0 OID 41108)
-- Dependencies: 244
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, employee_id, first_name, middle_name, last_name, email, password, role_id, department_id, phone, branch_id, is_active, is_password_changed, password_changed_at, is_bulk_imported) FROM stdin;
1	1	Dev	Dev	Dev	ict@jiranismart.com	$2a$10$pvN0OKHi7HAfYAoid6F3.e9ag3r57KVmPL/tezhi6zubmPPAlFp.C	1	\N	+254793577021	1	t	f	\N	f
8	10	John	M	Doe	john.doe@example.com	$2a$10$My9W7wFDt1zU72KfV9lC1.n6umJr.lLH5ZFTOYnlp3Pduf4T3naQC	2	6	0712345678	\N	t	f	\N	t
9	11	Jane		Smith	jane.smith@example.com	$2a$10$kqyLRF88XsxbKX8Rj77nvOgSbLs1uOcwj/uFh64R90Tcud5xpuSfy	2	8	0798765432	\N	t	f	\N	t
\.


--
-- TOC entry 5359 (class 0 OID 0)
-- Dependencies: 220
-- Name: action_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_logs_id_seq', 71, true);


--
-- TOC entry 5360 (class 0 OID 0)
-- Dependencies: 247
-- Name: asset_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_attachments_id_seq', 4, true);


--
-- TOC entry 5361 (class 0 OID 0)
-- Dependencies: 222
-- Name: asset_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_statuses_id_seq', 3, true);


--
-- TOC entry 5362 (class 0 OID 0)
-- Dependencies: 255
-- Name: asset_tag_prefixes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_tag_prefixes_id_seq', 10, true);


--
-- TOC entry 5363 (class 0 OID 0)
-- Dependencies: 224
-- Name: asset_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_types_id_seq', 5, true);


--
-- TOC entry 5364 (class 0 OID 0)
-- Dependencies: 226
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assets_id_seq', 1, true);


--
-- TOC entry 5365 (class 0 OID 0)
-- Dependencies: 251
-- Name: assignment_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignment_attachments_id_seq', 2, true);


--
-- TOC entry 5366 (class 0 OID 0)
-- Dependencies: 228
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignments_id_seq', 1, true);


--
-- TOC entry 5367 (class 0 OID 0)
-- Dependencies: 230
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 4, true);


--
-- TOC entry 5368 (class 0 OID 0)
-- Dependencies: 259
-- Name: bulk_imported_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bulk_imported_users_id_seq', 16, true);


--
-- TOC entry 5369 (class 0 OID 0)
-- Dependencies: 257
-- Name: bulk_user_imports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bulk_user_imports_id_seq', 5, true);


--
-- TOC entry 5370 (class 0 OID 0)
-- Dependencies: 253
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 18, true);


--
-- TOC entry 5371 (class 0 OID 0)
-- Dependencies: 232
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 17, true);


--
-- TOC entry 5372 (class 0 OID 0)
-- Dependencies: 234
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 11, true);


--
-- TOC entry 5373 (class 0 OID 0)
-- Dependencies: 249
-- Name: expense_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_attachments_id_seq', 2, true);


--
-- TOC entry 5374 (class 0 OID 0)
-- Dependencies: 236
-- Name: expense_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_types_id_seq', 4, true);


--
-- TOC entry 5375 (class 0 OID 0)
-- Dependencies: 238
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, true);


--
-- TOC entry 5376 (class 0 OID 0)
-- Dependencies: 240
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 50, true);


--
-- TOC entry 5377 (class 0 OID 0)
-- Dependencies: 242
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- TOC entry 5378 (class 0 OID 0)
-- Dependencies: 245
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- TOC entry 4992 (class 2606 OID 41134)
-- Name: action_logs action_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs
    ADD CONSTRAINT action_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 57376)
-- Name: asset_attachments asset_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments
    ADD CONSTRAINT asset_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 4994 (class 2606 OID 41136)
-- Name: asset_statuses asset_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses
    ADD CONSTRAINT asset_statuses_name_key UNIQUE (name);


--
-- TOC entry 4996 (class 2606 OID 41138)
-- Name: asset_statuses asset_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses
    ADD CONSTRAINT asset_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 5082 (class 2606 OID 81949)
-- Name: asset_tag_prefixes asset_tag_prefixes_asset_type_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes
    ADD CONSTRAINT asset_tag_prefixes_asset_type_id_key UNIQUE (asset_type_id);


--
-- TOC entry 5084 (class 2606 OID 81947)
-- Name: asset_tag_prefixes asset_tag_prefixes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes
    ADD CONSTRAINT asset_tag_prefixes_pkey PRIMARY KEY (id);


--
-- TOC entry 4999 (class 2606 OID 41140)
-- Name: asset_types asset_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT asset_types_name_key UNIQUE (name);


--
-- TOC entry 5001 (class 2606 OID 41142)
-- Name: asset_types asset_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT asset_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5004 (class 2606 OID 41144)
-- Name: assets assets_asset_tag_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_tag_key UNIQUE (asset_tag);


--
-- TOC entry 5006 (class 2606 OID 81962)
-- Name: assets assets_asset_tag_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_tag_unique UNIQUE (asset_tag);


--
-- TOC entry 5008 (class 2606 OID 41146)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 41148)
-- Name: assets assets_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_serial_number_key UNIQUE (serial_number);


--
-- TOC entry 5073 (class 2606 OID 57441)
-- Name: assignment_attachments assignment_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments
    ADD CONSTRAINT assignment_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5016 (class 2606 OID 41150)
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5021 (class 2606 OID 41152)
-- Name: branches branches_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_name_key UNIQUE (name);


--
-- TOC entry 5023 (class 2606 OID 41154)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 5092 (class 2606 OID 82004)
-- Name: bulk_imported_users bulk_imported_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_pkey PRIMARY KEY (id);


--
-- TOC entry 5086 (class 2606 OID 81982)
-- Name: bulk_user_imports bulk_user_imports_batch_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports
    ADD CONSTRAINT bulk_user_imports_batch_id_key UNIQUE (batch_id);


--
-- TOC entry 5088 (class 2606 OID 81980)
-- Name: bulk_user_imports bulk_user_imports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports
    ADD CONSTRAINT bulk_user_imports_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 81934)
-- Name: companies companies_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_name_key UNIQUE (name);


--
-- TOC entry 5080 (class 2606 OID 81932)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 5025 (class 2606 OID 41156)
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- TOC entry 5027 (class 2606 OID 41158)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 5029 (class 2606 OID 41160)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 5069 (class 2606 OID 57405)
-- Name: expense_attachments expense_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT expense_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5032 (class 2606 OID 41162)
-- Name: expense_types expense_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT expense_types_name_key UNIQUE (name);


--
-- TOC entry 5034 (class 2606 OID 41164)
-- Name: expense_types expense_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT expense_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5037 (class 2606 OID 41166)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 5043 (class 2606 OID 41168)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5045 (class 2606 OID 41170)
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- TOC entry 5047 (class 2606 OID 41172)
-- Name: refresh_tokens refresh_tokens_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_key UNIQUE (user_id);


--
-- TOC entry 5049 (class 2606 OID 41174)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 5051 (class 2606 OID 41176)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5053 (class 2606 OID 41178)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 5063 (class 2606 OID 57359)
-- Name: system_configuration system_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_configuration
    ADD CONSTRAINT system_configuration_pkey PRIMARY KEY (id);


--
-- TOC entry 5057 (class 2606 OID 41180)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5059 (class 2606 OID 41182)
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- TOC entry 5061 (class 2606 OID 41184)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5066 (class 1259 OID 57387)
-- Name: idx_asset_attachments_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_attachments_asset_id ON public.asset_attachments USING btree (asset_id);


--
-- TOC entry 5067 (class 1259 OID 57388)
-- Name: idx_asset_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_attachments_uploaded_by ON public.asset_attachments USING btree (uploaded_by);


--
-- TOC entry 4997 (class 1259 OID 41185)
-- Name: idx_asset_statuses_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_asset_statuses_name ON public.asset_statuses USING btree (name);


--
-- TOC entry 5002 (class 1259 OID 41186)
-- Name: idx_asset_types_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_asset_types_name ON public.asset_types USING btree (name);


--
-- TOC entry 5011 (class 1259 OID 41187)
-- Name: idx_assets_asset_tag; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_asset_tag ON public.assets USING btree (asset_tag);


--
-- TOC entry 5012 (class 1259 OID 41188)
-- Name: idx_assets_purchase_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_purchase_price ON public.assets USING btree (purchase_price);


--
-- TOC entry 5013 (class 1259 OID 41189)
-- Name: idx_assets_serial_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_serial_number ON public.assets USING btree (serial_number);


--
-- TOC entry 5014 (class 1259 OID 41190)
-- Name: idx_assets_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_type ON public.assets USING btree (asset_type);


--
-- TOC entry 5074 (class 1259 OID 57452)
-- Name: idx_assignment_attachments_assignment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_attachments_assignment_id ON public.assignment_attachments USING btree (assignment_id);


--
-- TOC entry 5075 (class 1259 OID 57454)
-- Name: idx_assignment_attachments_uploaded_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_attachments_uploaded_at ON public.assignment_attachments USING btree (uploaded_at);


--
-- TOC entry 5076 (class 1259 OID 57453)
-- Name: idx_assignment_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_attachments_uploaded_by ON public.assignment_attachments USING btree (uploaded_by);


--
-- TOC entry 5017 (class 1259 OID 41191)
-- Name: idx_assignments_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_asset_id ON public.assignments USING btree (asset_id);


--
-- TOC entry 5018 (class 1259 OID 41192)
-- Name: idx_assignments_current_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_current_asset ON public.assignments USING btree (employee_id, return_date) WHERE (return_date IS NULL);


--
-- TOC entry 5019 (class 1259 OID 41193)
-- Name: idx_assignments_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_employee_id ON public.assignments USING btree (employee_id);


--
-- TOC entry 5093 (class 1259 OID 82026)
-- Name: idx_bulk_imported_users_bulk_import_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_imported_users_bulk_import_id ON public.bulk_imported_users USING btree (bulk_import_id);


--
-- TOC entry 5094 (class 1259 OID 82027)
-- Name: idx_bulk_imported_users_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_imported_users_user_id ON public.bulk_imported_users USING btree (user_id);


--
-- TOC entry 5089 (class 1259 OID 82024)
-- Name: idx_bulk_user_imports_batch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_user_imports_batch_id ON public.bulk_user_imports USING btree (batch_id);


--
-- TOC entry 5090 (class 1259 OID 82025)
-- Name: idx_bulk_user_imports_imported_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_user_imports_imported_by ON public.bulk_user_imports USING btree (imported_by);


--
-- TOC entry 5030 (class 1259 OID 41194)
-- Name: idx_employees_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_location ON public.employees USING btree (branch_location);


--
-- TOC entry 5070 (class 1259 OID 57416)
-- Name: idx_expense_attachments_expense_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_attachments_expense_id ON public.expense_attachments USING btree (expense_id);


--
-- TOC entry 5071 (class 1259 OID 57417)
-- Name: idx_expense_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_attachments_uploaded_by ON public.expense_attachments USING btree (uploaded_by);


--
-- TOC entry 5035 (class 1259 OID 41195)
-- Name: idx_expense_types_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_expense_types_name ON public.expense_types USING btree (name);


--
-- TOC entry 5038 (class 1259 OID 41196)
-- Name: idx_expenses_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_asset_id ON public.expenses USING btree (asset_id);


--
-- TOC entry 5039 (class 1259 OID 81960)
-- Name: idx_expenses_assigned_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_assigned_employee ON public.expenses USING btree (assigned_employee_id);


--
-- TOC entry 5040 (class 1259 OID 41197)
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);


--
-- TOC entry 5041 (class 1259 OID 41198)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 5054 (class 1259 OID 41199)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5055 (class 1259 OID 82028)
-- Name: idx_users_is_bulk_imported; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_bulk_imported ON public.users USING btree (is_bulk_imported);


--
-- TOC entry 5095 (class 2606 OID 41200)
-- Name: action_logs action_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs
    ADD CONSTRAINT action_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5096 (class 2606 OID 41205)
-- Name: assets asset_status_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT asset_status_id_fk FOREIGN KEY (asset_status_id) REFERENCES public.asset_statuses(id) ON DELETE CASCADE;


--
-- TOC entry 5116 (class 2606 OID 81950)
-- Name: asset_tag_prefixes asset_tag_prefixes_asset_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes
    ADD CONSTRAINT asset_tag_prefixes_asset_type_id_fkey FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id) ON DELETE CASCADE;


--
-- TOC entry 5097 (class 2606 OID 41210)
-- Name: assets asset_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT asset_type_id_fk FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id) ON DELETE CASCADE;


--
-- TOC entry 5114 (class 2606 OID 57442)
-- Name: assignment_attachments assignment_attachments_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments
    ADD CONSTRAINT assignment_attachments_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- TOC entry 5115 (class 2606 OID 57447)
-- Name: assignment_attachments assignment_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments
    ADD CONSTRAINT assignment_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5099 (class 2606 OID 41215)
-- Name: assignments assignments_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5100 (class 2606 OID 41220)
-- Name: assignments assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5098 (class 2606 OID 41225)
-- Name: assets branch_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- TOC entry 5118 (class 2606 OID 82005)
-- Name: bulk_imported_users bulk_imported_users_bulk_import_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_bulk_import_id_fkey FOREIGN KEY (bulk_import_id) REFERENCES public.bulk_user_imports(id) ON DELETE CASCADE;


--
-- TOC entry 5119 (class 2606 OID 82015)
-- Name: bulk_imported_users bulk_imported_users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5120 (class 2606 OID 82051)
-- Name: bulk_imported_users bulk_imported_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5117 (class 2606 OID 81983)
-- Name: bulk_user_imports bulk_user_imports_imported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports
    ADD CONSTRAINT bulk_user_imports_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES public.users(id);


--
-- TOC entry 5102 (class 2606 OID 41230)
-- Name: expenses expense_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expense_type_id_fk FOREIGN KEY (expense_type_id) REFERENCES public.expense_types(id) ON DELETE CASCADE;


--
-- TOC entry 5103 (class 2606 OID 41235)
-- Name: expenses expenses_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 5104 (class 2606 OID 81955)
-- Name: expenses expenses_assigned_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_assigned_employee_id_fkey FOREIGN KEY (assigned_employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5110 (class 2606 OID 57377)
-- Name: asset_attachments fk_asset_attachment_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments
    ADD CONSTRAINT fk_asset_attachment_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5111 (class 2606 OID 57382)
-- Name: asset_attachments fk_asset_attachment_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments
    ADD CONSTRAINT fk_asset_attachment_user FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5101 (class 2606 OID 41240)
-- Name: employees fk_employees_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 5112 (class 2606 OID 57406)
-- Name: expense_attachments fk_expense_attachment_expense; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT fk_expense_attachment_expense FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- TOC entry 5113 (class 2606 OID 57411)
-- Name: expense_attachments fk_expense_attachment_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT fk_expense_attachment_user FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5106 (class 2606 OID 41245)
-- Name: users fk_users_branch; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- TOC entry 5107 (class 2606 OID 41250)
-- Name: users fk_users_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 5105 (class 2606 OID 41255)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5108 (class 2606 OID 41260)
-- Name: users users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- TOC entry 5109 (class 2606 OID 41265)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


-- Completed on 2026-01-10 13:33:52

--
-- PostgreSQL database dump complete
--

\unrestrict kpWDMtWUIIwJTqLIDgZ1dLIEAT1v1PVNt2tQZssRWtQeS3gNp5MdFSasd7QbbJN

