--
-- PostgreSQL database dump
--

\restrict iY11AEG687U3Zg0ArSvvS30nc4UNmpOhlCoEm4eLZHTnVuW3HcdvDBcqWaSBus8

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-14 16:42:44

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
-- TOC entry 913 (class 1247 OID 40962)
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
-- TOC entry 916 (class 1247 OID 40972)
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
-- TOC entry 279 (class 1255 OID 82255)
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
-- TOC entry 280 (class 1255 OID 82257)
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
-- TOC entry 5484 (class 0 OID 0)
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
-- TOC entry 5486 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE asset_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_attachments IS 'Stores file attachments and notes related to assets';


--
-- TOC entry 5487 (class 0 OID 0)
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
-- TOC entry 5488 (class 0 OID 0)
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
-- TOC entry 5490 (class 0 OID 0)
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
-- TOC entry 5492 (class 0 OID 0)
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
-- TOC entry 5493 (class 0 OID 0)
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
-- TOC entry 5495 (class 0 OID 0)
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
-- TOC entry 5497 (class 0 OID 0)
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
-- TOC entry 5499 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE assignment_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.assignment_attachments IS 'Stores file attachments associated with asset assignments';


--
-- TOC entry 5500 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.id IS 'Primary key';


--
-- TOC entry 5501 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.assignment_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.assignment_id IS 'Foreign key to assignments table';


--
-- TOC entry 5502 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.file_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.file_name IS 'Original name of the uploaded file';


--
-- TOC entry 5503 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.file_path; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.file_path IS 'Path to the file (local path or Firebase URL)';


--
-- TOC entry 5504 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.file_size; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.file_size IS 'Size of the file in bytes';


--
-- TOC entry 5505 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.file_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.file_type IS 'MIME type of the file';


--
-- TOC entry 5506 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.storage_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.storage_type IS 'Type of storage: server or firebase';


--
-- TOC entry 5507 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.notes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.notes IS 'Optional notes about the attachment';


--
-- TOC entry 5508 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN assignment_attachments.uploaded_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.assignment_attachments.uploaded_by IS 'Foreign key to users table - who uploaded the file';


--
-- TOC entry 5509 (class 0 OID 0)
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
-- TOC entry 5510 (class 0 OID 0)
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
-- TOC entry 5512 (class 0 OID 0)
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
-- TOC entry 5514 (class 0 OID 0)
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
-- TOC entry 5516 (class 0 OID 0)
-- Dependencies: 260
-- Name: TABLE bulk_imported_users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.bulk_imported_users IS 'Stores individual user records from bulk imports with their auto-generated passwords';


--
-- TOC entry 5517 (class 0 OID 0)
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
-- TOC entry 5518 (class 0 OID 0)
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
-- TOC entry 5520 (class 0 OID 0)
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
-- TOC entry 5521 (class 0 OID 0)
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
-- TOC entry 5523 (class 0 OID 0)
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
-- TOC entry 5525 (class 0 OID 0)
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
-- TOC entry 5527 (class 0 OID 0)
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
-- TOC entry 5528 (class 0 OID 0)
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
-- TOC entry 5530 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE expense_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.expense_attachments IS 'Stores file attachments and notes related to expenses';


--
-- TOC entry 5531 (class 0 OID 0)
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
-- TOC entry 5532 (class 0 OID 0)
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
-- TOC entry 5534 (class 0 OID 0)
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
-- TOC entry 5536 (class 0 OID 0)
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
-- TOC entry 5537 (class 0 OID 0)
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
-- TOC entry 5539 (class 0 OID 0)
-- Dependencies: 240
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 272 (class 1259 OID 82226)
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

--
-- TOC entry 5541 (class 0 OID 0)
-- Dependencies: 272
-- Name: TABLE repair_request_attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_request_attachments IS 'Stores file attachments for repair requests';


--
-- TOC entry 5542 (class 0 OID 0)
-- Dependencies: 272
-- Name: COLUMN repair_request_attachments.attachment_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.repair_request_attachments.attachment_type IS 'Category: invoice, receipt, photo, document, general';


--
-- TOC entry 271 (class 1259 OID 82225)
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
-- TOC entry 5543 (class 0 OID 0)
-- Dependencies: 271
-- Name: repair_request_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_request_attachments_id_seq OWNED BY public.repair_request_attachments.id;


--
-- TOC entry 270 (class 1259 OID 82191)
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
-- TOC entry 5545 (class 0 OID 0)
-- Dependencies: 270
-- Name: TABLE repair_request_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_request_history IS 'Audit trail for repair request actions and status changes';


--
-- TOC entry 269 (class 1259 OID 82190)
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
-- TOC entry 5546 (class 0 OID 0)
-- Dependencies: 269
-- Name: repair_request_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_request_history_id_seq OWNED BY public.repair_request_history.id;


--
-- TOC entry 273 (class 1259 OID 82254)
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
-- TOC entry 266 (class 1259 OID 82097)
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
-- TOC entry 5549 (class 0 OID 0)
-- Dependencies: 266
-- Name: TABLE repair_request_priorities; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_request_priorities IS 'Stores priority levels for repair requests';


--
-- TOC entry 265 (class 1259 OID 82096)
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
-- TOC entry 5550 (class 0 OID 0)
-- Dependencies: 265
-- Name: repair_request_priorities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_request_priorities_id_seq OWNED BY public.repair_request_priorities.id;


--
-- TOC entry 264 (class 1259 OID 82078)
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
-- TOC entry 5552 (class 0 OID 0)
-- Dependencies: 264
-- Name: TABLE repair_request_statuses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_request_statuses IS 'Stores status options for repair request workflow';


--
-- TOC entry 5553 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN repair_request_statuses.color_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.repair_request_statuses.color_code IS 'Hex color code for status badge display';


--
-- TOC entry 5554 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN repair_request_statuses.is_terminal; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.repair_request_statuses.is_terminal IS 'Whether this status represents a final state';


--
-- TOC entry 268 (class 1259 OID 82115)
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
-- TOC entry 5555 (class 0 OID 0)
-- Dependencies: 268
-- Name: TABLE repair_requests; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_requests IS 'Main table for repair request management';


--
-- TOC entry 5556 (class 0 OID 0)
-- Dependencies: 268
-- Name: COLUMN repair_requests.request_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.repair_requests.request_number IS 'Unique identifier like REQ-001, REQ-002';


--
-- TOC entry 274 (class 1259 OID 82259)
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
-- TOC entry 263 (class 1259 OID 82077)
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
-- TOC entry 5557 (class 0 OID 0)
-- Dependencies: 263
-- Name: repair_request_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_request_statuses_id_seq OWNED BY public.repair_request_statuses.id;


--
-- TOC entry 262 (class 1259 OID 82062)
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
-- TOC entry 5559 (class 0 OID 0)
-- Dependencies: 262
-- Name: TABLE repair_request_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.repair_request_types IS 'Stores types of repair requests for customization';


--
-- TOC entry 261 (class 1259 OID 82061)
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
-- TOC entry 5560 (class 0 OID 0)
-- Dependencies: 261
-- Name: repair_request_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_request_types_id_seq OWNED BY public.repair_request_types.id;


--
-- TOC entry 267 (class 1259 OID 82114)
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
-- TOC entry 5562 (class 0 OID 0)
-- Dependencies: 267
-- Name: repair_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_requests_id_seq OWNED BY public.repair_requests.id;


--
-- TOC entry 278 (class 1259 OID 82300)
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
-- TOC entry 277 (class 1259 OID 82299)
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
-- TOC entry 5565 (class 0 OID 0)
-- Dependencies: 277
-- Name: repair_workflow_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_workflow_permissions_id_seq OWNED BY public.repair_workflow_permissions.id;


--
-- TOC entry 276 (class 1259 OID 82266)
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
-- TOC entry 275 (class 1259 OID 82265)
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
-- TOC entry 5568 (class 0 OID 0)
-- Dependencies: 275
-- Name: repair_workflow_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_workflow_stages_id_seq OWNED BY public.repair_workflow_stages.id;


--
-- TOC entry 241 (class 1259 OID 41094)
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
-- TOC entry 5570 (class 0 OID 0)
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
-- TOC entry 5572 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE system_configuration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.system_configuration IS 'Stores system-wide configuration including app name, company info, and storage settings';


--
-- TOC entry 5573 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN system_configuration.storage_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_configuration.storage_type IS 'Storage location: server (local) or firebase (cloud)';


--
-- TOC entry 5574 (class 0 OID 0)
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
    is_bulk_imported boolean DEFAULT false,
    company_id integer
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
-- TOC entry 5575 (class 0 OID 0)
-- Dependencies: 245
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4965 (class 2604 OID 41120)
-- Name: action_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs ALTER COLUMN id SET DEFAULT nextval('public.action_logs_id_seq'::regclass);


--
-- TOC entry 5002 (class 2604 OID 57364)
-- Name: asset_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments ALTER COLUMN id SET DEFAULT nextval('public.asset_attachments_id_seq'::regclass);


--
-- TOC entry 4967 (class 2604 OID 41121)
-- Name: asset_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses ALTER COLUMN id SET DEFAULT nextval('public.asset_statuses_id_seq'::regclass);


--
-- TOC entry 5016 (class 2604 OID 81939)
-- Name: asset_tag_prefixes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes ALTER COLUMN id SET DEFAULT nextval('public.asset_tag_prefixes_id_seq'::regclass);


--
-- TOC entry 4971 (class 2604 OID 41122)
-- Name: asset_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types ALTER COLUMN id SET DEFAULT nextval('public.asset_types_id_seq'::regclass);


--
-- TOC entry 4974 (class 2604 OID 41123)
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- TOC entry 5008 (class 2604 OID 57422)
-- Name: assignment_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments ALTER COLUMN id SET DEFAULT nextval('public.assignment_attachments_id_seq'::regclass);


--
-- TOC entry 4975 (class 2604 OID 41124)
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- TOC entry 4976 (class 2604 OID 41125)
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- TOC entry 5028 (class 2604 OID 81992)
-- Name: bulk_imported_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users ALTER COLUMN id SET DEFAULT nextval('public.bulk_imported_users_id_seq'::regclass);


--
-- TOC entry 5020 (class 2604 OID 81967)
-- Name: bulk_user_imports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports ALTER COLUMN id SET DEFAULT nextval('public.bulk_user_imports_id_seq'::regclass);


--
-- TOC entry 5012 (class 2604 OID 81925)
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- TOC entry 4979 (class 2604 OID 41126)
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- TOC entry 4982 (class 2604 OID 41127)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 5005 (class 2604 OID 57393)
-- Name: expense_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments ALTER COLUMN id SET DEFAULT nextval('public.expense_attachments_id_seq'::regclass);


--
-- TOC entry 4984 (class 2604 OID 41128)
-- Name: expense_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types ALTER COLUMN id SET DEFAULT nextval('public.expense_types_id_seq'::regclass);


--
-- TOC entry 4987 (class 2604 OID 41129)
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- TOC entry 4988 (class 2604 OID 41130)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 5055 (class 2604 OID 82229)
-- Name: repair_request_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_attachments ALTER COLUMN id SET DEFAULT nextval('public.repair_request_attachments_id_seq'::regclass);


--
-- TOC entry 5053 (class 2604 OID 82194)
-- Name: repair_request_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history ALTER COLUMN id SET DEFAULT nextval('public.repair_request_history_id_seq'::regclass);


--
-- TOC entry 5044 (class 2604 OID 82100)
-- Name: repair_request_priorities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_priorities ALTER COLUMN id SET DEFAULT nextval('public.repair_request_priorities_id_seq'::regclass);


--
-- TOC entry 5037 (class 2604 OID 82081)
-- Name: repair_request_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_statuses ALTER COLUMN id SET DEFAULT nextval('public.repair_request_statuses_id_seq'::regclass);


--
-- TOC entry 5033 (class 2604 OID 82065)
-- Name: repair_request_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_types ALTER COLUMN id SET DEFAULT nextval('public.repair_request_types_id_seq'::regclass);


--
-- TOC entry 5050 (class 2604 OID 82118)
-- Name: repair_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests ALTER COLUMN id SET DEFAULT nextval('public.repair_requests_id_seq'::regclass);


--
-- TOC entry 5069 (class 2604 OID 82303)
-- Name: repair_workflow_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_permissions ALTER COLUMN id SET DEFAULT nextval('public.repair_workflow_permissions_id_seq'::regclass);


--
-- TOC entry 5059 (class 2604 OID 82269)
-- Name: repair_workflow_stages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_stages ALTER COLUMN id SET DEFAULT nextval('public.repair_workflow_stages_id_seq'::regclass);


--
-- TOC entry 4989 (class 2604 OID 41131)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4990 (class 2604 OID 41132)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5420 (class 0 OID 40981)
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
72	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-10 14:14:44.088356+03
73	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-10 14:18:09.545376+03
74	1	UPDATE	User	9	{"new_data": {"email": "jane.smith@example.com", "phone": "0798765432", "role_id": "2", "branch_id": "1", "last_name": "Smith", "department": "Finance", "first_name": "Jane", "employee_id": "11", "middle_name": "", "department_id": "8", "branch_location": "HQ"}, "old_data": {"id": 9, "name": null, "email": "jane.smith@example.com", "phone": "0798765432", "role_id": 2, "location": null, "password": "$2a$10$kqyLRF88XsxbKX8Rj77nvOgSbLs1uOcwj/uFh64R90Tcud5xpuSfy", "branch_id": null, "is_active": true, "last_name": "Smith", "role_name": "Standard User", "first_name": "Jane", "employee_id": 11, "middle_name": "", "departmnt_id": 8, "department_id": 8, "department_name": "Finance", "is_bulk_imported": true, "employee_last_name": "Smith", "employee_first_name": "Jane", "is_password_changed": false, "password_changed_at": null, "employee_middle_name": ""}}	2026-01-10 14:21:07.313056+03
75	1	UPDATE	User	8	{"new_data": {"email": "john.doe@example.com", "phone": "0712345678", "role_id": "2", "branch_id": "1", "last_name": "Doe", "department": "ICT and Data entry", "first_name": "John", "employee_id": "10", "middle_name": "M", "department_id": "6", "branch_location": "HQ"}, "old_data": {"id": 8, "name": null, "email": "john.doe@example.com", "phone": "0712345678", "role_id": 2, "location": null, "password": "$2a$10$My9W7wFDt1zU72KfV9lC1.n6umJr.lLH5ZFTOYnlp3Pduf4T3naQC", "branch_id": null, "is_active": true, "last_name": "Doe", "role_name": "Standard User", "first_name": "John", "employee_id": 10, "middle_name": "M", "departmnt_id": 6, "department_id": 6, "department_name": "ICT and Data entry", "is_bulk_imported": true, "employee_last_name": "Doe", "employee_first_name": "John", "is_password_changed": false, "password_changed_at": null, "employee_middle_name": "M"}}	2026-01-10 14:21:26.129929+03
76	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-10 18:30:04.40618+03
77	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-10 18:43:23.33047+03
78	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-10 19:20:57.652317+03
79	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-10 19:52:14.856208+03
80	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-13 10:51:33.11111+03
81	1	CREATE	Asset	2	{"asset_tag": "ICT-RTR-001"}	2026-01-13 11:09:16.984079+03
82	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-13 11:21:36.7155+03
83	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-13 11:57:31.091763+03
84	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-13 12:27:46.951834+03
85	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-14 10:39:32.263465+03
86	1	UPDATE	RepairRequestType	1	{"changes": {"name": "Hardware Repair.", "is_active": true, "description": "Physical hardware repairs and fixes"}}	2026-01-14 10:51:17.621062+03
87	1	UPDATE	RepairRequestType	1	{"changes": {"name": "Hardware Repair", "is_active": true, "description": "Physical hardware repairs and fixes"}}	2026-01-14 10:51:25.077088+03
88	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-14 11:19:10.095639+03
89	1	CREATE	RepairRequest	1	{"title": "Mwatate router repair", "request_number": "REQ-0001"}	2026-01-14 11:26:17.593931+03
90	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-14 11:33:52.447206+03
91	1	CREATE	RepairRequestAttachment	1	{"file_name": "SOTIK 13012026.pdf", "repair_request_id": 1}	2026-01-14 11:34:10.397808+03
92	1	DELETE	RepairRequestAttachment	1	{"file_name": "SOTIK 13012026.pdf", "repair_request_id": 1}	2026-01-14 11:42:39.797021+03
93	1	CREATE	RepairRequestAttachment	2	{"file_name": "SOTIK 13012026.pdf", "repair_request_id": 1}	2026-01-14 11:43:08.827769+03
94	1	DELETE	RepairRequestAttachment	2	{"file_name": "SOTIK 13012026.pdf", "repair_request_id": 1}	2026-01-14 11:43:43.339133+03
95	1	CREATE	RepairRequestAttachment	3	{"file_name": "SOTIK 13012026.pdf", "repair_request_id": 1}	2026-01-14 11:43:55.217971+03
96	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 11:50:05.389086+03
97	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 11:51:35.886461+03
98	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-14 12:11:06.397624+03
99	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 12:13:05.971369+03
100	1	UPDATE	RepairWorkflowPermission	1	{"stage_id": 1, "permissions": [{"roleId": 1, "canExecute": true}, {"roleId": 2, "canExecute": true}]}	2026-01-14 12:28:35.197247+03
101	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 12:29:16.473406+03
102	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 12:29:31.755518+03
103	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-14 12:43:53.946353+03
104	1	UPDATE	Role	1	{"changes": {"name": "Admin", "description": "For admins"}, "role_name": "Admin"}	2026-01-14 12:52:15.105908+03
105	1	UPDATE	Role	1	{"changes": {"name": "Admin", "is_active": true, "description": "For admins"}, "role_name": "Admin"}	2026-01-14 12:58:48.735486+03
106	1	UPDATE	Role	2	{"changes": {"name": "Standard User", "is_active": true, "description": null}, "role_name": "Standard User"}	2026-01-14 12:58:55.175828+03
107	1	CREATE	Role	3	{"role_name": "ICT Officer"}	2026-01-14 12:59:40.755342+03
149	8	DELETE	RepairRequestAttachment	6	{"file_name": "GOODS RETURN FORM.pdf", "repair_request_id": 1}	2026-01-14 14:46:36.175114+03
150	8	DELETE	RepairRequestAttachment	7	{"file_name": "GOODS RETURN FORM.pdf", "repair_request_id": 1}	2026-01-14 14:46:40.08699+03
151	8	CREATE	RepairRequest	2	{"title": "Router repair", "request_number": "REQ-0002"}	2026-01-14 14:48:03.513936+03
108	1	UPDATE	User	8	{"new_data": {"email": "john.doe@example.com", "phone": "0712345678", "company": "Jirani Smart", "role_id": "3", "branch_id": "1", "last_name": "Doe", "company_id": "5", "department": "ICT and Data entry", "first_name": "John", "employee_id": "10", "middle_name": "M", "department_id": "6", "branch_location": "HQ"}, "old_data": {"id": 8, "email": "john.doe@example.com", "phone": "0712345678", "role_id": 2, "location": "Mwatate, Taita Taveta.", "password": "$2a$10$My9W7wFDt1zU72KfV9lC1.n6umJr.lLH5ZFTOYnlp3Pduf4T3naQC", "branch_id": 1, "is_active": true, "last_name": "Doe", "role_name": "Standard User", "company_id": 5, "first_name": "John", "branch_name": "HQ", "employee_id": 10, "middle_name": "M", "company_name": "Jirani Smart", "departmnt_id": 6, "department_id": 6, "department_name": "ICT and Data entry", "is_bulk_imported": true, "employee_last_name": "Doe", "employee_first_name": "John", "is_password_changed": false, "password_changed_at": null, "employee_middle_name": "M"}}	2026-01-14 13:01:48.308439+03
109	1	UPDATE	RepairWorkflowPermission	1	{"stage_id": 1, "permissions": [{"roleId": 1, "canExecute": true}, {"roleId": 3, "canExecute": true}]}	2026-01-14 13:02:11.316612+03
110	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 13:03:08.031128+03
111	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 13:03:25.742266+03
112	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 13:03:29.877957+03
113	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 13:03:35.6255+03
114	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 13:03:55.392051+03
115	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 13:04:12.034538+03
116	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 13:11:57.167079+03
117	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 13:12:20.423817+03
118	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-14 13:51:58.991899+03
119	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 14:04:26.967073+03
120	8	STATUS_CHANGE	RepairRequest	1	{"notes": "Approved for payment", "to_status": "ICT Approved", "from_status": "Pending", "request_number": "REQ-0001"}	2026-01-14 14:13:48.28009+03
121	1	UPDATE	RepairWorkflowPermission	3	{"stage_id": 3, "permissions": [{"roleId": 1, "canExecute": true}, {"roleId": 3, "canExecute": true}]}	2026-01-14 14:17:12.869265+03
122	1	CREATE	Role	4	{"role_name": "Finance Officer"}	2026-01-14 14:18:01.72142+03
123	1	CREATE	Role	5	{"role_name": "Finance Manager"}	2026-01-14 14:18:17.02747+03
124	1	UPDATE	User	9	{"new_data": {"email": "jane.smith@example.com", "phone": "0798765432", "company": "Jirani Smart", "role_id": "5", "branch_id": "1", "last_name": "Smith", "company_id": "5", "department": "Finance", "first_name": "Jane", "employee_id": "11", "middle_name": "", "department_id": "8", "branch_location": "HQ"}, "old_data": {"id": 9, "email": "jane.smith@example.com", "phone": "0798765432", "role_id": 2, "location": "Mwatate, Taita Taveta.", "password": "$2a$10$kqyLRF88XsxbKX8Rj77nvOgSbLs1uOcwj/uFh64R90Tcud5xpuSfy", "branch_id": 1, "is_active": true, "last_name": "Smith", "role_name": "Standard User", "company_id": 5, "first_name": "Jane", "branch_name": "HQ", "employee_id": 11, "middle_name": "", "company_name": "Jirani Smart", "departmnt_id": 8, "department_id": 8, "department_name": "Finance", "is_bulk_imported": true, "employee_last_name": "Smith", "employee_first_name": "Jane", "is_password_changed": false, "password_changed_at": null, "employee_middle_name": ""}}	2026-01-14 14:19:04.157648+03
125	1	UPDATE	RepairWorkflowPermission	5	{"stage_id": 5, "permissions": [{"roleId": 1, "canExecute": true}, {"roleId": 5, "canExecute": true}]}	2026-01-14 14:19:52.306957+03
126	1	UPDATE	RepairWorkflowPermission	6	{"stage_id": 6, "permissions": [{"roleId": 1, "canExecute": true}, {"roleId": 5, "canExecute": true}]}	2026-01-14 14:20:09.022903+03
127	1	UPDATE	RepairWorkflowPermission	7	{"stage_id": 7, "permissions": [{"roleId": 1, "canExecute": true}, {"roleId": 3, "canExecute": true}]}	2026-01-14 14:20:20.311176+03
128	1	UPDATE	RepairWorkflowPermission	8	{"stage_id": 8, "permissions": [{"roleId": 1, "canExecute": true}, {"roleId": 3, "canExecute": true}]}	2026-01-14 14:20:34.184089+03
129	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 14:21:15.899138+03
130	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 14:21:27.019349+03
131	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 14:21:34.452766+03
132	8	STATUS_CHANGE	RepairRequest	1	{"notes": "The router is now being repaired", "to_status": "In Repair", "from_status": "ICT Approved", "request_number": "REQ-0001"}	2026-01-14 14:22:07.025263+03
133	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 14:22:30.88304+03
134	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 14:23:29.200447+03
135	8	CREATE	RepairRequestAttachment	4	{"file_name": "ATANA RETURN NOTE.pdf", "repair_request_id": 1}	2026-01-14 14:24:37.107814+03
136	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 14:25:09.384329+03
137	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-14 14:28:29.51562+03
138	1	UPDATE	RepairWorkflowPermission	4	{"stage_id": 4, "permissions": [{"roleId": 1, "canExecute": true}, {"roleId": 3, "canExecute": true}, {"roleId": 2, "canExecute": true}]}	2026-01-14 14:28:43.203323+03
139	9	CREATE	RepairRequestAttachment	5	{"file_name": "GOODS RETURN FORM.pdf", "repair_request_id": 1}	2026-01-14 14:29:17.969179+03
140	9	CREATE	RepairRequestAttachment	6	{"file_name": "GOODS RETURN FORM.pdf", "repair_request_id": 1}	2026-01-14 14:29:19.368609+03
141	9	CREATE	RepairRequestAttachment	7	{"file_name": "GOODS RETURN FORM.pdf", "repair_request_id": 1}	2026-01-14 14:29:20.99605+03
142	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 14:29:41.351503+03
143	8	STATUS_CHANGE	RepairRequest	1	{"notes": "Invoice submitted for approval", "to_status": "Invoice Submitted", "from_status": "In Repair", "request_number": "REQ-0001"}	2026-01-14 14:31:01.792147+03
144	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 14:32:17.675806+03
145	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 14:46:08.653773+03
146	8	DELETE	RepairRequestAttachment	3	{"file_name": "SOTIK 13012026.pdf", "repair_request_id": 1}	2026-01-14 14:46:22.731065+03
147	8	DELETE	RepairRequestAttachment	4	{"file_name": "ATANA RETURN NOTE.pdf", "repair_request_id": 1}	2026-01-14 14:46:27.115825+03
148	8	DELETE	RepairRequestAttachment	5	{"file_name": "GOODS RETURN FORM.pdf", "repair_request_id": 1}	2026-01-14 14:46:31.93843+03
152	8	STATUS_CHANGE	RepairRequest	2	{"notes": "approved by ICT", "to_status": "ICT Approved", "from_status": "Pending", "request_number": "REQ-0002"}	2026-01-14 14:48:26.17871+03
153	8	STATUS_CHANGE	RepairRequest	2	{"notes": "Sent to a technician for repair", "to_status": "In Repair", "from_status": "ICT Approved", "request_number": "REQ-0002"}	2026-01-14 14:48:42.932424+03
154	8	STATUS_CHANGE	RepairRequest	2	{"notes": "Invoice submitted for approval", "to_status": "Invoice Submitted", "from_status": "In Repair", "request_number": "REQ-0002"}	2026-01-14 14:55:37.351425+03
155	8	CREATE	RepairRequestAttachment	8	{"file_name": "PAYMENT TRACKER.pdf", "repair_request_id": 2}	2026-01-14 14:55:39.515338+03
156	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-14 15:05:05.151947+03
157	8	CREATE	RepairRequestAttachment	9	{"file_name": "1.jpg", "repair_request_id": 2}	2026-01-14 15:13:30.738839+03
158	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-14 15:22:38.929397+03
159	9	LOGIN	User	9	{"email": "jane.smith@example.com"}	2026-01-14 15:24:01.352442+03
160	9	STATUS_CHANGE	RepairRequest	2	{"notes": "Approved by finance", "to_status": "Finance Approved", "from_status": "Invoice Submitted", "request_number": "REQ-0002"}	2026-01-14 15:24:45.092613+03
161	8	LOGIN	User	8	{"email": "john.doe@example.com"}	2026-01-14 15:26:57.116792+03
162	8	STATUS_CHANGE	RepairRequest	2	{"notes": "The router is now repaired and it's in the office. It's working well.", "to_status": "Completed", "from_status": "Finance Approved", "request_number": "REQ-0002"}	2026-01-14 15:27:47.536549+03
163	1	LOGIN	User	1	{"email": "ict@jiranismart.com"}	2026-01-14 16:12:09.323235+03
\.


--
-- TOC entry 5449 (class 0 OID 57361)
-- Dependencies: 248
-- Data for Name: asset_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attachments (id, asset_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at) FROM stdin;
4	1	Appraisal JSL.pdf	https://firebasestorage.googleapis.com/v0/b/jirani-smart-limited-website.firebasestorage.app/o/assets%2F1767766040989-Appraisal%20JSL.pdf?alt=media&token=006328f6-7142-46de-9894-6b73695cc9d8	201588	application/pdf	firebase	test purposes	1	2026-01-07 09:07:23.271675+03
\.


--
-- TOC entry 5422 (class 0 OID 40992)
-- Dependencies: 221
-- Data for Name: asset_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_statuses (id, name, is_available, description, created_at, updated_at) FROM stdin;
1	In Use	f	Asset is currently assigned and deployed.	2025-10-09 18:12:23.042878+03	2025-10-09 18:12:23.042878+03
3	In Stock	f	Asset is currently assigned and deployed.	2025-10-09 18:12:42.355423+03	2025-10-09 18:12:42.355423+03
\.


--
-- TOC entry 5457 (class 0 OID 81936)
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
-- TOC entry 5424 (class 0 OID 41003)
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
-- TOC entry 5426 (class 0 OID 41013)
-- Dependencies: 225
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, asset_tag, asset_type, manufacturer, model, serial_number, status, purchase_date, purchase_price, notes, asset_type_id, asset_status_id, branch_id) FROM stdin;
1	LPT-RTR-007	Router	Huawei	rtr-5er	L-345679	In Use	2025-12-17	5000.00	New for ICT Office	3	1	1
2	ICT-RTR-001	Router	Huawei	bsd-5eg	L-345681	In Stock	2026-01-06	3999.00	Replacement for a broken router	3	3	1
\.


--
-- TOC entry 5453 (class 0 OID 57419)
-- Dependencies: 252
-- Data for Name: assignment_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_attachments (id, assignment_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at, created_at, updated_at) FROM stdin;
2	1	ACCOUNT FORFEITURE FORM.pdf	https://firebasestorage.googleapis.com/v0/b/jirani-smart-limited-website.firebasestorage.app/o/assignments%2F1767767149008-ACCOUNT%20FORFEITURE%20FORM.pdf?alt=media&token=287ad471-750c-4a77-9fb6-38c3dd54ce08	101858	application/pdf	firebase	test attachment	1	2026-01-07 09:25:50.951234+03	2026-01-07 09:25:50.951234+03	2026-01-07 09:25:50.951234+03
\.


--
-- TOC entry 5428 (class 0 OID 41024)
-- Dependencies: 227
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, asset_id, employee_id, assignment_date, return_date, notes) FROM stdin;
1	1	1	2025-12-23	\N	test
\.


--
-- TOC entry 5430 (class 0 OID 41034)
-- Dependencies: 229
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, location, created_at, updated_at) FROM stdin;
1	HQ	Mwatate, Taita Taveta.	2025-09-20 11:29:51.759883+03	2025-09-20 11:29:51.759883+03
4	Mwatate	Mwatate, Taita Taveta	2025-12-09 11:16:42.772688+03	2025-12-09 11:16:42.772688+03
\.


--
-- TOC entry 5461 (class 0 OID 81989)
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
-- TOC entry 5459 (class 0 OID 81964)
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
-- TOC entry 5455 (class 0 OID 81922)
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
-- TOC entry 5432 (class 0 OID 41044)
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
-- TOC entry 5434 (class 0 OID 41052)
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
10	John	HQ	ICT and Data entry	6	M	Doe	1	Jirani Smart
11	Jane	HQ	Finance	8		Smith	1	Jirani Smart
\.


--
-- TOC entry 5451 (class 0 OID 57390)
-- Dependencies: 250
-- Data for Name: expense_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_attachments (id, expense_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by, uploaded_at) FROM stdin;
2	1	4smile-Jiranismart Loan Application Form.pdf	https://firebasestorage.googleapis.com/v0/b/jirani-smart-limited-website.firebasestorage.app/o/expenses%2F1767771793767-4smile-Jiranismart%20Loan%20Application%20Form.pdf?alt=media&token=229e5f46-af03-498d-9de1-269965de6189	89358	application/pdf	firebase	test document	1	2026-01-07 10:43:18.568264+03
\.


--
-- TOC entry 5436 (class 0 OID 41063)
-- Dependencies: 235
-- Data for Name: expense_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_types (id, name, description, created_at, updated_at) FROM stdin;
1	Purchase	Original capitalized cost of the asset.	2025-10-10 10:58:54.100412+03	2025-10-10 10:58:54.100412+03
3	Repair	Repair cost of the asset.	2025-10-10 11:07:44.784952+03	2025-10-10 11:07:44.784952+03
4	Logistics	Transport cost of the asset.	2025-10-10 11:08:14.682477+03	2025-10-10 11:08:14.682477+03
\.


--
-- TOC entry 5438 (class 0 OID 41073)
-- Dependencies: 237
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, asset_id, date, amount, vendor, invoice_number, notes, expense_type_id, assigned_employee_id) FROM stdin;
1	1	2025-12-23	3000.00	Free technologies	240	Charging system repair	3	1
2	2	2026-01-14	500.00	Free Style Code Technologies	INV-FSCT-2-2025	Repair Request #2: Router repair	3	\N
\.


--
-- TOC entry 5440 (class 0 OID 41084)
-- Dependencies: 239
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, token, user_id, expires_at) FROM stdin;
75	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiZW1haWwiOiJqYW5lLnNtaXRoQGV4YW1wbGUuY29tIiwicm9sZSI6IkZpbmFuY2UgTWFuYWdlciIsInJvbGVfaWQiOjUsImlhdCI6MTc2ODM5MzQ0MSwiZXhwIjoxNzY4OTk4MjQxfQ.3UzP7zUfslSTLRnwF1P0BkaAi8tcLGxK605KZ3TT3fU	9	2026-01-21 15:24:01.347+03
53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJJQ1QgT2ZmaWNlciIsInJvbGVfaWQiOjMsImlhdCI6MTc2ODM5MzYxNywiZXhwIjoxNzY4OTk4NDE3fQ.Po2olT0TDXmlMas5nx-Iac2ogSHAkxPgl4aCfCby_C4	8	2026-01-21 15:26:57.111+03
1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpY3RAamlyYW5pc21hcnQuY29tIiwicm9sZSI6IkFkbWluIiwicm9sZV9pZCI6MSwiaWF0IjoxNzY4Mzk2MzI5LCJleHAiOjE3NjkwMDExMjl9.JbO0IbeN_Nkw-mo-RY8O1NqRXMbD00OVcLRMo3igETo	1	2026-01-21 16:12:09.318+03
\.


--
-- TOC entry 5473 (class 0 OID 82226)
-- Dependencies: 272
-- Data for Name: repair_request_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_request_attachments (id, repair_request_id, file_name, file_path, file_size, file_type, storage_type, attachment_type, notes, uploaded_by, uploaded_at) FROM stdin;
8	2	PAYMENT TRACKER.pdf	https://firebasestorage.googleapis.com/v0/b/jirani-smart-limited-website.firebasestorage.app/o/repair-requests%2F1768391737391-PAYMENT%20TRACKER.pdf?alt=media&token=8a0d17f4-d44b-4dc7-941e-87b9232f1e44	68114	application/pdf	firebase	invoice	\N	8	2026-01-14 14:55:39.506602+03
9	2	1.jpg	https://firebasestorage.googleapis.com/v0/b/jirani-smart-limited-website.firebasestorage.app/o/repair-requests%2F1768392808937-1.jpg?alt=media&token=59f36623-3ac6-4e6d-a7ea-6ee677d6ecbb	34116	image/jpeg	firebase	photo	\N	8	2026-01-14 15:13:30.727004+03
\.


--
-- TOC entry 5471 (class 0 OID 82191)
-- Dependencies: 270
-- Data for Name: repair_request_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_request_history (id, repair_request_id, action_type, from_status_id, to_status_id, performed_by, notes, metadata, created_at) FROM stdin;
1	1	CREATED	\N	1	1	Repair request created	\N	2026-01-14 11:26:17.588775+03
2	1	ATTACHMENT_ADDED	\N	\N	1	Attachment added: SOTIK 13012026.pdf	{"attachment_type": "invoice"}	2026-01-14 11:34:10.393125+03
3	1	ATTACHMENT_DELETED	\N	\N	1	Attachment deleted: SOTIK 13012026.pdf	\N	2026-01-14 11:42:39.784224+03
4	1	ATTACHMENT_ADDED	\N	\N	1	Attachment added: SOTIK 13012026.pdf	{"attachment_type": "invoice"}	2026-01-14 11:43:08.824314+03
5	1	ATTACHMENT_DELETED	\N	\N	1	Attachment deleted: SOTIK 13012026.pdf	\N	2026-01-14 11:43:43.334598+03
6	1	ATTACHMENT_ADDED	\N	\N	1	Attachment added: SOTIK 13012026.pdf	{"attachment_type": "invoice"}	2026-01-14 11:43:55.214967+03
7	1	STATUS_CHANGE	1	2	8	Approved for payment	\N	2026-01-14 14:13:48.276561+03
8	1	STATUS_CHANGE	2	4	8	The router is now being repaired	\N	2026-01-14 14:22:07.022601+03
9	1	ATTACHMENT_ADDED	\N	\N	8	Attachment added: ATANA RETURN NOTE.pdf	{"attachment_type": "invoice"}	2026-01-14 14:24:37.104682+03
10	1	ATTACHMENT_ADDED	\N	\N	9	Attachment added: GOODS RETURN FORM.pdf	{"attachment_type": "invoice"}	2026-01-14 14:29:17.966749+03
11	1	ATTACHMENT_ADDED	\N	\N	9	Attachment added: GOODS RETURN FORM.pdf	{"attachment_type": "invoice"}	2026-01-14 14:29:19.367524+03
12	1	ATTACHMENT_ADDED	\N	\N	9	Attachment added: GOODS RETURN FORM.pdf	{"attachment_type": "invoice"}	2026-01-14 14:29:20.994986+03
13	1	STATUS_CHANGE	4	6	8	Invoice submitted for approval	\N	2026-01-14 14:31:01.789401+03
14	1	ATTACHMENT_DELETED	\N	\N	8	Attachment deleted: SOTIK 13012026.pdf	\N	2026-01-14 14:46:22.728341+03
15	1	ATTACHMENT_DELETED	\N	\N	8	Attachment deleted: ATANA RETURN NOTE.pdf	\N	2026-01-14 14:46:27.114391+03
16	1	ATTACHMENT_DELETED	\N	\N	8	Attachment deleted: GOODS RETURN FORM.pdf	\N	2026-01-14 14:46:31.937217+03
17	1	ATTACHMENT_DELETED	\N	\N	8	Attachment deleted: GOODS RETURN FORM.pdf	\N	2026-01-14 14:46:36.173609+03
18	1	ATTACHMENT_DELETED	\N	\N	8	Attachment deleted: GOODS RETURN FORM.pdf	\N	2026-01-14 14:46:40.08526+03
19	2	CREATED	\N	1	8	Repair request created	\N	2026-01-14 14:48:03.508429+03
20	2	STATUS_CHANGE	1	2	8	approved by ICT	\N	2026-01-14 14:48:26.175738+03
21	2	STATUS_CHANGE	2	4	8	Sent to a technician for repair	\N	2026-01-14 14:48:42.928282+03
22	2	STATUS_CHANGE	4	6	8	Invoice submitted for approval	\N	2026-01-14 14:55:37.348188+03
23	2	ATTACHMENT_ADDED	\N	\N	8	Attachment added: PAYMENT TRACKER.pdf	{"attachment_type": "invoice"}	2026-01-14 14:55:39.512932+03
24	2	ATTACHMENT_ADDED	\N	\N	8	Attachment added: 1.jpg	{"attachment_type": "photo"}	2026-01-14 15:13:30.733274+03
25	2	STATUS_CHANGE	6	7	9	Approved by finance	\N	2026-01-14 15:24:45.089364+03
26	2	STATUS_CHANGE	7	9	8	The router is now repaired and it's in the office. It's working well.	\N	2026-01-14 15:27:47.532469+03
\.


--
-- TOC entry 5467 (class 0 OID 82097)
-- Dependencies: 266
-- Data for Name: repair_request_priorities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_request_priorities (id, name, description, color_code, display_order, is_active, created_at, updated_at) FROM stdin;
1	Low	Non-urgent repairs that can wait	#28a745	1	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
2	Medium	Standard priority repairs	#ffc107	2	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
3	High	Urgent repairs needed soon	#fd7e14	3	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
4	Critical	Emergency repairs required immediately	#dc3545	4	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
\.


--
-- TOC entry 5465 (class 0 OID 82078)
-- Dependencies: 264
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
-- TOC entry 5463 (class 0 OID 82062)
-- Dependencies: 262
-- Data for Name: repair_request_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_request_types (id, name, description, is_active, created_at, updated_at) FROM stdin;
2	Software Issue	Software-related problems and troubleshooting	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
3	Replacement Request	Request for equipment replacement	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
4	Maintenance	Routine maintenance and servicing	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
5	Upgrade Request	Hardware or software upgrade requests	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:28:53.393857+03
1	Hardware Repair	Physical hardware repairs and fixes	t	2026-01-14 10:28:53.393857+03	2026-01-14 10:51:25.075273+03
\.


--
-- TOC entry 5469 (class 0 OID 82115)
-- Dependencies: 268
-- Data for Name: repair_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_requests (id, request_number, asset_id, request_type_id, priority_id, status_id, title, description, requested_by, branch_id, department_id, ict_reviewed_by, ict_reviewed_at, ict_notes, repair_started_at, repair_completed_at, repair_notes, vendor_name, invoice_number, invoice_amount, invoice_date, invoice_uploaded_by, invoice_uploaded_at, finance_reviewed_by, finance_reviewed_at, finance_notes, payment_reference, payment_date, created_at, updated_at, completed_at, expense_id, invoice_notes) FROM stdin;
1	REQ-0001	1	1	3	6	Mwatate router repair	The router has an issue with its power supply. It's not powering up on boot	1	4	\N	8	2026-01-14 14:13:48.266563+03	Approved for payment	2026-01-14 14:22:07.017321+03	\N	\N	Free Style Code Technologies	INV-FSCT-1-2025	500.00	2026-01-14	8	2026-01-14 14:31:01.774+03	\N	\N	\N	\N	\N	2026-01-14 11:26:17.561295+03	2026-01-14 14:31:01.788263+03	\N	\N	\N
2	REQ-0002	2	1	3	9	Router repair	repair for HQ router	8	1	\N	8	2026-01-14 14:48:26.170212+03	approved by ICT	2026-01-14 14:48:42.923825+03	2026-01-14 15:27:47.525529+03	\N	Free Style Code Technologies	INV-FSCT-2-2025	500.00	2026-01-14	8	2026-01-14 14:55:37.326+03	9	2026-01-14 15:24:45.087296+03	Approved by finance	QWERTY78W	2026-01-14	2026-01-14 14:48:03.487831+03	2026-01-14 16:01:47.827208+03	2026-01-14 15:27:47.525529+03	2	\N
\.


--
-- TOC entry 5478 (class 0 OID 82300)
-- Dependencies: 278
-- Data for Name: repair_workflow_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_workflow_permissions (id, workflow_stage_id, role_id, can_execute, created_at) FROM stdin;
2	2	1	t	2026-01-14 11:59:59.864962
11	1	1	t	2026-01-14 13:02:11.313183
12	1	3	t	2026-01-14 13:02:11.315318
13	3	1	t	2026-01-14 14:17:12.866875
14	3	3	t	2026-01-14 14:17:12.868368
15	5	1	t	2026-01-14 14:19:52.304523
16	5	5	t	2026-01-14 14:19:52.306013
17	6	1	t	2026-01-14 14:20:09.02127
18	6	5	t	2026-01-14 14:20:09.02214
19	7	1	t	2026-01-14 14:20:20.30898
20	7	3	t	2026-01-14 14:20:20.310078
21	8	1	t	2026-01-14 14:20:34.18277
22	8	3	t	2026-01-14 14:20:34.183412
23	4	1	t	2026-01-14 14:28:43.200401
24	4	3	t	2026-01-14 14:28:43.201708
25	4	2	t	2026-01-14 14:28:43.202472
\.


--
-- TOC entry 5476 (class 0 OID 82266)
-- Dependencies: 276
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
-- TOC entry 5442 (class 0 OID 41094)
-- Dependencies: 241
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, updated_at, is_active) FROM stdin;
1	Admin	For admins	2026-01-14 12:58:48.733742+03	t
2	Standard User	\N	2026-01-14 12:58:55.173969+03	t
3	ICT Officer	Role for ICT staff	\N	t
4	Finance Officer	Roles for Finance Officers	\N	t
5	Finance Manager	Roles for Finance Manager	\N	t
\.


--
-- TOC entry 5444 (class 0 OID 41100)
-- Dependencies: 243
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
MC7BDl5I8GBFshapChk_yZX4FROtWJ54	{"cookie":{"originalMaxAge":86400000,"expires":"2026-01-15T08:33:52.451Z","secure":false,"httpOnly":true,"path":"/"}}	2026-01-15 16:37:38
\.


--
-- TOC entry 5447 (class 0 OID 57345)
-- Dependencies: 246
-- Data for Name: system_configuration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_configuration (id, app_name, company_logo_url, company_email, company_phone, company_address, storage_type, firebase_api_key, firebase_auth_domain, firebase_project_id, firebase_storage_bucket, firebase_messaging_sender_id, firebase_app_id, created_at, updated_at, auto_send_password, password_email_template, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, smtp_from_name, smtp_from_email) FROM stdin;
1	Asset Management System-JSL	/uploads/logos/1766483269971-4s1.png	info@jiranismart.com	+254 722 810 781	P.O Box 25 - 80305 Mwatate. Kenya	firebase	AIzaSyCtiLqIjaqvbMVYglR5k_fLxrQUt1ezjiI	jirani-smart-limited-website.firebaseapp.com	jirani-smart-limited-website	jirani-smart-limited-website.firebasestorage.app	253932228031	1:253932228031:web:39ad61f74c066caa15250a	2025-12-23 10:58:48.710946+03	2025-12-23 14:34:07.936158+03	f	Dear {first_name},\n\nYour account has been created in the Asset Management System.\n\nEmail: {email}\nTemporary Password: {password}\n\nPlease login and change your password immediately.\n\nBest regards,\n{company_name}	\N	587	f	\N	\N	\N	\N
\.


--
-- TOC entry 5445 (class 0 OID 41108)
-- Dependencies: 244
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, employee_id, first_name, middle_name, last_name, email, password, role_id, department_id, phone, branch_id, is_active, is_password_changed, password_changed_at, is_bulk_imported, company_id) FROM stdin;
1	1	Dev	Dev	Dev	ict@jiranismart.com	$2a$10$pvN0OKHi7HAfYAoid6F3.e9ag3r57KVmPL/tezhi6zubmPPAlFp.C	1	\N	+254793577021	1	t	f	\N	f	5
8	10	John	M	Doe	john.doe@example.com	$2a$10$My9W7wFDt1zU72KfV9lC1.n6umJr.lLH5ZFTOYnlp3Pduf4T3naQC	3	6	0712345678	1	t	f	\N	t	5
9	11	Jane		Smith	jane.smith@example.com	$2a$10$kqyLRF88XsxbKX8Rj77nvOgSbLs1uOcwj/uFh64R90Tcud5xpuSfy	5	8	0798765432	1	t	f	\N	t	5
\.


--
-- TOC entry 5577 (class 0 OID 0)
-- Dependencies: 220
-- Name: action_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_logs_id_seq', 163, true);


--
-- TOC entry 5578 (class 0 OID 0)
-- Dependencies: 247
-- Name: asset_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_attachments_id_seq', 4, true);


--
-- TOC entry 5579 (class 0 OID 0)
-- Dependencies: 222
-- Name: asset_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_statuses_id_seq', 3, true);


--
-- TOC entry 5580 (class 0 OID 0)
-- Dependencies: 255
-- Name: asset_tag_prefixes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_tag_prefixes_id_seq', 10, true);


--
-- TOC entry 5581 (class 0 OID 0)
-- Dependencies: 224
-- Name: asset_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_types_id_seq', 5, true);


--
-- TOC entry 5582 (class 0 OID 0)
-- Dependencies: 226
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assets_id_seq', 2, true);


--
-- TOC entry 5583 (class 0 OID 0)
-- Dependencies: 251
-- Name: assignment_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignment_attachments_id_seq', 2, true);


--
-- TOC entry 5584 (class 0 OID 0)
-- Dependencies: 228
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignments_id_seq', 1, true);


--
-- TOC entry 5585 (class 0 OID 0)
-- Dependencies: 230
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 4, true);


--
-- TOC entry 5586 (class 0 OID 0)
-- Dependencies: 259
-- Name: bulk_imported_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bulk_imported_users_id_seq', 16, true);


--
-- TOC entry 5587 (class 0 OID 0)
-- Dependencies: 257
-- Name: bulk_user_imports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bulk_user_imports_id_seq', 5, true);


--
-- TOC entry 5588 (class 0 OID 0)
-- Dependencies: 253
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 18, true);


--
-- TOC entry 5589 (class 0 OID 0)
-- Dependencies: 232
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 17, true);


--
-- TOC entry 5590 (class 0 OID 0)
-- Dependencies: 234
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 11, true);


--
-- TOC entry 5591 (class 0 OID 0)
-- Dependencies: 249
-- Name: expense_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_attachments_id_seq', 2, true);


--
-- TOC entry 5592 (class 0 OID 0)
-- Dependencies: 236
-- Name: expense_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_types_id_seq', 5, true);


--
-- TOC entry 5593 (class 0 OID 0)
-- Dependencies: 238
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 2, true);


--
-- TOC entry 5594 (class 0 OID 0)
-- Dependencies: 240
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 114, true);


--
-- TOC entry 5595 (class 0 OID 0)
-- Dependencies: 271
-- Name: repair_request_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_attachments_id_seq', 9, true);


--
-- TOC entry 5596 (class 0 OID 0)
-- Dependencies: 269
-- Name: repair_request_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_history_id_seq', 26, true);


--
-- TOC entry 5597 (class 0 OID 0)
-- Dependencies: 273
-- Name: repair_request_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_number_seq', 2, true);


--
-- TOC entry 5598 (class 0 OID 0)
-- Dependencies: 265
-- Name: repair_request_priorities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_priorities_id_seq', 4, true);


--
-- TOC entry 5599 (class 0 OID 0)
-- Dependencies: 263
-- Name: repair_request_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_statuses_id_seq', 10, true);


--
-- TOC entry 5600 (class 0 OID 0)
-- Dependencies: 261
-- Name: repair_request_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_request_types_id_seq', 5, true);


--
-- TOC entry 5601 (class 0 OID 0)
-- Dependencies: 267
-- Name: repair_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_requests_id_seq', 2, true);


--
-- TOC entry 5602 (class 0 OID 0)
-- Dependencies: 277
-- Name: repair_workflow_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_workflow_permissions_id_seq', 25, true);


--
-- TOC entry 5603 (class 0 OID 0)
-- Dependencies: 275
-- Name: repair_workflow_stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_workflow_stages_id_seq', 8, true);


--
-- TOC entry 5604 (class 0 OID 0)
-- Dependencies: 242
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


--
-- TOC entry 5605 (class 0 OID 0)
-- Dependencies: 245
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- TOC entry 5079 (class 2606 OID 41134)
-- Name: action_logs action_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs
    ADD CONSTRAINT action_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5152 (class 2606 OID 57376)
-- Name: asset_attachments asset_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments
    ADD CONSTRAINT asset_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5081 (class 2606 OID 41136)
-- Name: asset_statuses asset_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses
    ADD CONSTRAINT asset_statuses_name_key UNIQUE (name);


--
-- TOC entry 5083 (class 2606 OID 41138)
-- Name: asset_statuses asset_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses
    ADD CONSTRAINT asset_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 5169 (class 2606 OID 81949)
-- Name: asset_tag_prefixes asset_tag_prefixes_asset_type_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes
    ADD CONSTRAINT asset_tag_prefixes_asset_type_id_key UNIQUE (asset_type_id);


--
-- TOC entry 5171 (class 2606 OID 81947)
-- Name: asset_tag_prefixes asset_tag_prefixes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes
    ADD CONSTRAINT asset_tag_prefixes_pkey PRIMARY KEY (id);


--
-- TOC entry 5086 (class 2606 OID 41140)
-- Name: asset_types asset_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT asset_types_name_key UNIQUE (name);


--
-- TOC entry 5088 (class 2606 OID 41142)
-- Name: asset_types asset_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT asset_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5091 (class 2606 OID 41144)
-- Name: assets assets_asset_tag_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_tag_key UNIQUE (asset_tag);


--
-- TOC entry 5093 (class 2606 OID 81962)
-- Name: assets assets_asset_tag_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_tag_unique UNIQUE (asset_tag);


--
-- TOC entry 5095 (class 2606 OID 41146)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- TOC entry 5097 (class 2606 OID 41148)
-- Name: assets assets_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_serial_number_key UNIQUE (serial_number);


--
-- TOC entry 5160 (class 2606 OID 57441)
-- Name: assignment_attachments assignment_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments
    ADD CONSTRAINT assignment_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5103 (class 2606 OID 41150)
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5108 (class 2606 OID 41152)
-- Name: branches branches_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_name_key UNIQUE (name);


--
-- TOC entry 5110 (class 2606 OID 41154)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 5179 (class 2606 OID 82004)
-- Name: bulk_imported_users bulk_imported_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_pkey PRIMARY KEY (id);


--
-- TOC entry 5173 (class 2606 OID 81982)
-- Name: bulk_user_imports bulk_user_imports_batch_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports
    ADD CONSTRAINT bulk_user_imports_batch_id_key UNIQUE (batch_id);


--
-- TOC entry 5175 (class 2606 OID 81980)
-- Name: bulk_user_imports bulk_user_imports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports
    ADD CONSTRAINT bulk_user_imports_pkey PRIMARY KEY (id);


--
-- TOC entry 5165 (class 2606 OID 81934)
-- Name: companies companies_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_name_key UNIQUE (name);


--
-- TOC entry 5167 (class 2606 OID 81932)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 5112 (class 2606 OID 41156)
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- TOC entry 5114 (class 2606 OID 41158)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 5116 (class 2606 OID 41160)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 5156 (class 2606 OID 57405)
-- Name: expense_attachments expense_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT expense_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5119 (class 2606 OID 41162)
-- Name: expense_types expense_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT expense_types_name_key UNIQUE (name);


--
-- TOC entry 5121 (class 2606 OID 41164)
-- Name: expense_types expense_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT expense_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5124 (class 2606 OID 41166)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 5130 (class 2606 OID 41168)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5132 (class 2606 OID 41170)
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- TOC entry 5134 (class 2606 OID 41172)
-- Name: refresh_tokens refresh_tokens_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_key UNIQUE (user_id);


--
-- TOC entry 5209 (class 2606 OID 82242)
-- Name: repair_request_attachments repair_request_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_attachments
    ADD CONSTRAINT repair_request_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5206 (class 2606 OID 82203)
-- Name: repair_request_history repair_request_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history
    ADD CONSTRAINT repair_request_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5191 (class 2606 OID 82113)
-- Name: repair_request_priorities repair_request_priorities_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_priorities
    ADD CONSTRAINT repair_request_priorities_name_key UNIQUE (name);


--
-- TOC entry 5193 (class 2606 OID 82111)
-- Name: repair_request_priorities repair_request_priorities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_priorities
    ADD CONSTRAINT repair_request_priorities_pkey PRIMARY KEY (id);


--
-- TOC entry 5187 (class 2606 OID 82095)
-- Name: repair_request_statuses repair_request_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_statuses
    ADD CONSTRAINT repair_request_statuses_name_key UNIQUE (name);


--
-- TOC entry 5189 (class 2606 OID 82093)
-- Name: repair_request_statuses repair_request_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_statuses
    ADD CONSTRAINT repair_request_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 5183 (class 2606 OID 82076)
-- Name: repair_request_types repair_request_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_types
    ADD CONSTRAINT repair_request_types_name_key UNIQUE (name);


--
-- TOC entry 5185 (class 2606 OID 82074)
-- Name: repair_request_types repair_request_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_types
    ADD CONSTRAINT repair_request_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5201 (class 2606 OID 82132)
-- Name: repair_requests repair_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5203 (class 2606 OID 82134)
-- Name: repair_requests repair_requests_request_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_request_number_key UNIQUE (request_number);


--
-- TOC entry 5219 (class 2606 OID 82310)
-- Name: repair_workflow_permissions repair_workflow_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_permissions
    ADD CONSTRAINT repair_workflow_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5221 (class 2606 OID 82312)
-- Name: repair_workflow_permissions repair_workflow_permissions_workflow_stage_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_permissions
    ADD CONSTRAINT repair_workflow_permissions_workflow_stage_id_role_id_key UNIQUE (workflow_stage_id, role_id);


--
-- TOC entry 5213 (class 2606 OID 82286)
-- Name: repair_workflow_stages repair_workflow_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_stages
    ADD CONSTRAINT repair_workflow_stages_pkey PRIMARY KEY (id);


--
-- TOC entry 5215 (class 2606 OID 82288)
-- Name: repair_workflow_stages repair_workflow_stages_stage_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_stages
    ADD CONSTRAINT repair_workflow_stages_stage_key_key UNIQUE (stage_key);


--
-- TOC entry 5136 (class 2606 OID 41174)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 5138 (class 2606 OID 41176)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5140 (class 2606 OID 41178)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 5150 (class 2606 OID 57359)
-- Name: system_configuration system_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_configuration
    ADD CONSTRAINT system_configuration_pkey PRIMARY KEY (id);


--
-- TOC entry 5144 (class 2606 OID 41180)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5146 (class 2606 OID 41182)
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- TOC entry 5148 (class 2606 OID 41184)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5153 (class 1259 OID 57387)
-- Name: idx_asset_attachments_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_attachments_asset_id ON public.asset_attachments USING btree (asset_id);


--
-- TOC entry 5154 (class 1259 OID 57388)
-- Name: idx_asset_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_attachments_uploaded_by ON public.asset_attachments USING btree (uploaded_by);


--
-- TOC entry 5084 (class 1259 OID 41185)
-- Name: idx_asset_statuses_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_asset_statuses_name ON public.asset_statuses USING btree (name);


--
-- TOC entry 5089 (class 1259 OID 41186)
-- Name: idx_asset_types_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_asset_types_name ON public.asset_types USING btree (name);


--
-- TOC entry 5098 (class 1259 OID 41187)
-- Name: idx_assets_asset_tag; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_asset_tag ON public.assets USING btree (asset_tag);


--
-- TOC entry 5099 (class 1259 OID 41188)
-- Name: idx_assets_purchase_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_purchase_price ON public.assets USING btree (purchase_price);


--
-- TOC entry 5100 (class 1259 OID 41189)
-- Name: idx_assets_serial_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_serial_number ON public.assets USING btree (serial_number);


--
-- TOC entry 5101 (class 1259 OID 41190)
-- Name: idx_assets_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_type ON public.assets USING btree (asset_type);


--
-- TOC entry 5161 (class 1259 OID 57452)
-- Name: idx_assignment_attachments_assignment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_attachments_assignment_id ON public.assignment_attachments USING btree (assignment_id);


--
-- TOC entry 5162 (class 1259 OID 57454)
-- Name: idx_assignment_attachments_uploaded_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_attachments_uploaded_at ON public.assignment_attachments USING btree (uploaded_at);


--
-- TOC entry 5163 (class 1259 OID 57453)
-- Name: idx_assignment_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_attachments_uploaded_by ON public.assignment_attachments USING btree (uploaded_by);


--
-- TOC entry 5104 (class 1259 OID 41191)
-- Name: idx_assignments_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_asset_id ON public.assignments USING btree (asset_id);


--
-- TOC entry 5105 (class 1259 OID 41192)
-- Name: idx_assignments_current_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_current_asset ON public.assignments USING btree (employee_id, return_date) WHERE (return_date IS NULL);


--
-- TOC entry 5106 (class 1259 OID 41193)
-- Name: idx_assignments_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_employee_id ON public.assignments USING btree (employee_id);


--
-- TOC entry 5180 (class 1259 OID 82026)
-- Name: idx_bulk_imported_users_bulk_import_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_imported_users_bulk_import_id ON public.bulk_imported_users USING btree (bulk_import_id);


--
-- TOC entry 5181 (class 1259 OID 82027)
-- Name: idx_bulk_imported_users_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_imported_users_user_id ON public.bulk_imported_users USING btree (user_id);


--
-- TOC entry 5176 (class 1259 OID 82024)
-- Name: idx_bulk_user_imports_batch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_user_imports_batch_id ON public.bulk_user_imports USING btree (batch_id);


--
-- TOC entry 5177 (class 1259 OID 82025)
-- Name: idx_bulk_user_imports_imported_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bulk_user_imports_imported_by ON public.bulk_user_imports USING btree (imported_by);


--
-- TOC entry 5117 (class 1259 OID 41194)
-- Name: idx_employees_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_location ON public.employees USING btree (branch_location);


--
-- TOC entry 5157 (class 1259 OID 57416)
-- Name: idx_expense_attachments_expense_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_attachments_expense_id ON public.expense_attachments USING btree (expense_id);


--
-- TOC entry 5158 (class 1259 OID 57417)
-- Name: idx_expense_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_attachments_uploaded_by ON public.expense_attachments USING btree (uploaded_by);


--
-- TOC entry 5122 (class 1259 OID 41195)
-- Name: idx_expense_types_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_expense_types_name ON public.expense_types USING btree (name);


--
-- TOC entry 5125 (class 1259 OID 41196)
-- Name: idx_expenses_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_asset_id ON public.expenses USING btree (asset_id);


--
-- TOC entry 5126 (class 1259 OID 81960)
-- Name: idx_expenses_assigned_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_assigned_employee ON public.expenses USING btree (assigned_employee_id);


--
-- TOC entry 5127 (class 1259 OID 41197)
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);


--
-- TOC entry 5128 (class 1259 OID 41198)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 5207 (class 1259 OID 82253)
-- Name: idx_repair_attachments_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_attachments_request ON public.repair_request_attachments USING btree (repair_request_id);


--
-- TOC entry 5204 (class 1259 OID 82224)
-- Name: idx_repair_request_history_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_request_history_request ON public.repair_request_history USING btree (repair_request_id);


--
-- TOC entry 5194 (class 1259 OID 82187)
-- Name: idx_repair_requests_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_asset ON public.repair_requests USING btree (asset_id);


--
-- TOC entry 5195 (class 1259 OID 82188)
-- Name: idx_repair_requests_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_branch ON public.repair_requests USING btree (branch_id);


--
-- TOC entry 5196 (class 1259 OID 82334)
-- Name: idx_repair_requests_expense_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_expense_id ON public.repair_requests USING btree (expense_id);


--
-- TOC entry 5197 (class 1259 OID 82189)
-- Name: idx_repair_requests_request_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_request_number ON public.repair_requests USING btree (request_number);


--
-- TOC entry 5198 (class 1259 OID 82186)
-- Name: idx_repair_requests_requested_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_requested_by ON public.repair_requests USING btree (requested_by);


--
-- TOC entry 5199 (class 1259 OID 82185)
-- Name: idx_repair_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_repair_requests_status ON public.repair_requests USING btree (status_id);


--
-- TOC entry 5141 (class 1259 OID 41199)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5142 (class 1259 OID 82028)
-- Name: idx_users_is_bulk_imported; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_bulk_imported ON public.users USING btree (is_bulk_imported);


--
-- TOC entry 5216 (class 1259 OID 82326)
-- Name: idx_workflow_permissions_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_permissions_role ON public.repair_workflow_permissions USING btree (role_id);


--
-- TOC entry 5217 (class 1259 OID 82325)
-- Name: idx_workflow_permissions_stage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_permissions_stage ON public.repair_workflow_permissions USING btree (workflow_stage_id);


--
-- TOC entry 5210 (class 1259 OID 82324)
-- Name: idx_workflow_stages_from_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_stages_from_status ON public.repair_workflow_stages USING btree (from_status_id);


--
-- TOC entry 5211 (class 1259 OID 82323)
-- Name: idx_workflow_stages_stage_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_stages_stage_key ON public.repair_workflow_stages USING btree (stage_key);


--
-- TOC entry 5270 (class 2620 OID 82256)
-- Name: repair_requests trigger_generate_request_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_generate_request_number BEFORE INSERT ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.generate_repair_request_number();


--
-- TOC entry 5271 (class 2620 OID 82258)
-- Name: repair_requests trigger_update_repair_request_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_repair_request_timestamp BEFORE UPDATE ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.update_repair_request_timestamp();


--
-- TOC entry 5222 (class 2606 OID 41200)
-- Name: action_logs action_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs
    ADD CONSTRAINT action_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5223 (class 2606 OID 41205)
-- Name: assets asset_status_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT asset_status_id_fk FOREIGN KEY (asset_status_id) REFERENCES public.asset_statuses(id) ON DELETE CASCADE;


--
-- TOC entry 5244 (class 2606 OID 81950)
-- Name: asset_tag_prefixes asset_tag_prefixes_asset_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_tag_prefixes
    ADD CONSTRAINT asset_tag_prefixes_asset_type_id_fkey FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id) ON DELETE CASCADE;


--
-- TOC entry 5224 (class 2606 OID 41210)
-- Name: assets asset_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT asset_type_id_fk FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id) ON DELETE CASCADE;


--
-- TOC entry 5242 (class 2606 OID 57442)
-- Name: assignment_attachments assignment_attachments_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments
    ADD CONSTRAINT assignment_attachments_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- TOC entry 5243 (class 2606 OID 57447)
-- Name: assignment_attachments assignment_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_attachments
    ADD CONSTRAINT assignment_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5226 (class 2606 OID 41215)
-- Name: assignments assignments_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5227 (class 2606 OID 41220)
-- Name: assignments assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5225 (class 2606 OID 41225)
-- Name: assets branch_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- TOC entry 5246 (class 2606 OID 82005)
-- Name: bulk_imported_users bulk_imported_users_bulk_import_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_bulk_import_id_fkey FOREIGN KEY (bulk_import_id) REFERENCES public.bulk_user_imports(id) ON DELETE CASCADE;


--
-- TOC entry 5247 (class 2606 OID 82015)
-- Name: bulk_imported_users bulk_imported_users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5248 (class 2606 OID 82051)
-- Name: bulk_imported_users bulk_imported_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_imported_users
    ADD CONSTRAINT bulk_imported_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5245 (class 2606 OID 81983)
-- Name: bulk_user_imports bulk_user_imports_imported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bulk_user_imports
    ADD CONSTRAINT bulk_user_imports_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES public.users(id);


--
-- TOC entry 5229 (class 2606 OID 41230)
-- Name: expenses expense_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expense_type_id_fk FOREIGN KEY (expense_type_id) REFERENCES public.expense_types(id) ON DELETE CASCADE;


--
-- TOC entry 5230 (class 2606 OID 41235)
-- Name: expenses expenses_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 5231 (class 2606 OID 81955)
-- Name: expenses expenses_assigned_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_assigned_employee_id_fkey FOREIGN KEY (assigned_employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5238 (class 2606 OID 57377)
-- Name: asset_attachments fk_asset_attachment_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments
    ADD CONSTRAINT fk_asset_attachment_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5239 (class 2606 OID 57382)
-- Name: asset_attachments fk_asset_attachment_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attachments
    ADD CONSTRAINT fk_asset_attachment_user FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5228 (class 2606 OID 41240)
-- Name: employees fk_employees_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 5240 (class 2606 OID 57406)
-- Name: expense_attachments fk_expense_attachment_expense; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT fk_expense_attachment_expense FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- TOC entry 5241 (class 2606 OID 57411)
-- Name: expense_attachments fk_expense_attachment_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT fk_expense_attachment_user FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5233 (class 2606 OID 41245)
-- Name: users fk_users_branch; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- TOC entry 5234 (class 2606 OID 82056)
-- Name: users fk_users_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- TOC entry 5235 (class 2606 OID 41250)
-- Name: users fk_users_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 5232 (class 2606 OID 41255)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5264 (class 2606 OID 82243)
-- Name: repair_request_attachments repair_request_attachments_repair_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_attachments
    ADD CONSTRAINT repair_request_attachments_repair_request_id_fkey FOREIGN KEY (repair_request_id) REFERENCES public.repair_requests(id) ON DELETE CASCADE;


--
-- TOC entry 5265 (class 2606 OID 82248)
-- Name: repair_request_attachments repair_request_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_attachments
    ADD CONSTRAINT repair_request_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 5260 (class 2606 OID 82209)
-- Name: repair_request_history repair_request_history_from_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history
    ADD CONSTRAINT repair_request_history_from_status_id_fkey FOREIGN KEY (from_status_id) REFERENCES public.repair_request_statuses(id);


--
-- TOC entry 5261 (class 2606 OID 82219)
-- Name: repair_request_history repair_request_history_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history
    ADD CONSTRAINT repair_request_history_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- TOC entry 5262 (class 2606 OID 82204)
-- Name: repair_request_history repair_request_history_repair_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history
    ADD CONSTRAINT repair_request_history_repair_request_id_fkey FOREIGN KEY (repair_request_id) REFERENCES public.repair_requests(id) ON DELETE CASCADE;


--
-- TOC entry 5263 (class 2606 OID 82214)
-- Name: repair_request_history repair_request_history_to_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_request_history
    ADD CONSTRAINT repair_request_history_to_status_id_fkey FOREIGN KEY (to_status_id) REFERENCES public.repair_request_statuses(id);


--
-- TOC entry 5249 (class 2606 OID 82135)
-- Name: repair_requests repair_requests_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 5250 (class 2606 OID 82160)
-- Name: repair_requests repair_requests_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 5251 (class 2606 OID 82165)
-- Name: repair_requests repair_requests_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- TOC entry 5252 (class 2606 OID 82329)
-- Name: repair_requests repair_requests_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id);


--
-- TOC entry 5253 (class 2606 OID 82180)
-- Name: repair_requests repair_requests_finance_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_finance_reviewed_by_fkey FOREIGN KEY (finance_reviewed_by) REFERENCES public.users(id);


--
-- TOC entry 5254 (class 2606 OID 82170)
-- Name: repair_requests repair_requests_ict_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_ict_reviewed_by_fkey FOREIGN KEY (ict_reviewed_by) REFERENCES public.users(id);


--
-- TOC entry 5255 (class 2606 OID 82175)
-- Name: repair_requests repair_requests_invoice_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_invoice_uploaded_by_fkey FOREIGN KEY (invoice_uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 5256 (class 2606 OID 82145)
-- Name: repair_requests repair_requests_priority_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_priority_id_fkey FOREIGN KEY (priority_id) REFERENCES public.repair_request_priorities(id);


--
-- TOC entry 5257 (class 2606 OID 82140)
-- Name: repair_requests repair_requests_request_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_request_type_id_fkey FOREIGN KEY (request_type_id) REFERENCES public.repair_request_types(id);


--
-- TOC entry 5258 (class 2606 OID 82155)
-- Name: repair_requests repair_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- TOC entry 5259 (class 2606 OID 82150)
-- Name: repair_requests repair_requests_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_requests
    ADD CONSTRAINT repair_requests_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.repair_request_statuses(id);


--
-- TOC entry 5268 (class 2606 OID 82318)
-- Name: repair_workflow_permissions repair_workflow_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_permissions
    ADD CONSTRAINT repair_workflow_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 5269 (class 2606 OID 82313)
-- Name: repair_workflow_permissions repair_workflow_permissions_workflow_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_permissions
    ADD CONSTRAINT repair_workflow_permissions_workflow_stage_id_fkey FOREIGN KEY (workflow_stage_id) REFERENCES public.repair_workflow_stages(id) ON DELETE CASCADE;


--
-- TOC entry 5266 (class 2606 OID 82289)
-- Name: repair_workflow_stages repair_workflow_stages_from_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_stages
    ADD CONSTRAINT repair_workflow_stages_from_status_id_fkey FOREIGN KEY (from_status_id) REFERENCES public.repair_request_statuses(id);


--
-- TOC entry 5267 (class 2606 OID 82294)
-- Name: repair_workflow_stages repair_workflow_stages_to_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_workflow_stages
    ADD CONSTRAINT repair_workflow_stages_to_status_id_fkey FOREIGN KEY (to_status_id) REFERENCES public.repair_request_statuses(id);


--
-- TOC entry 5236 (class 2606 OID 41260)
-- Name: users users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- TOC entry 5237 (class 2606 OID 41265)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 5485 (class 0 OID 0)
-- Dependencies: 220
-- Name: SEQUENCE action_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.action_logs_id_seq TO PUBLIC;


--
-- TOC entry 5489 (class 0 OID 0)
-- Dependencies: 247
-- Name: SEQUENCE asset_attachments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.asset_attachments_id_seq TO PUBLIC;


--
-- TOC entry 5491 (class 0 OID 0)
-- Dependencies: 222
-- Name: SEQUENCE asset_statuses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.asset_statuses_id_seq TO PUBLIC;


--
-- TOC entry 5494 (class 0 OID 0)
-- Dependencies: 255
-- Name: SEQUENCE asset_tag_prefixes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.asset_tag_prefixes_id_seq TO PUBLIC;


--
-- TOC entry 5496 (class 0 OID 0)
-- Dependencies: 224
-- Name: SEQUENCE asset_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.asset_types_id_seq TO PUBLIC;


--
-- TOC entry 5498 (class 0 OID 0)
-- Dependencies: 226
-- Name: SEQUENCE assets_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.assets_id_seq TO PUBLIC;


--
-- TOC entry 5511 (class 0 OID 0)
-- Dependencies: 251
-- Name: SEQUENCE assignment_attachments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.assignment_attachments_id_seq TO PUBLIC;


--
-- TOC entry 5513 (class 0 OID 0)
-- Dependencies: 228
-- Name: SEQUENCE assignments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.assignments_id_seq TO PUBLIC;


--
-- TOC entry 5515 (class 0 OID 0)
-- Dependencies: 230
-- Name: SEQUENCE branches_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.branches_id_seq TO PUBLIC;


--
-- TOC entry 5519 (class 0 OID 0)
-- Dependencies: 259
-- Name: SEQUENCE bulk_imported_users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.bulk_imported_users_id_seq TO PUBLIC;


--
-- TOC entry 5522 (class 0 OID 0)
-- Dependencies: 257
-- Name: SEQUENCE bulk_user_imports_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.bulk_user_imports_id_seq TO PUBLIC;


--
-- TOC entry 5524 (class 0 OID 0)
-- Dependencies: 253
-- Name: SEQUENCE companies_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.companies_id_seq TO PUBLIC;


--
-- TOC entry 5526 (class 0 OID 0)
-- Dependencies: 232
-- Name: SEQUENCE departments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.departments_id_seq TO PUBLIC;


--
-- TOC entry 5529 (class 0 OID 0)
-- Dependencies: 234
-- Name: SEQUENCE employees_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.employees_id_seq TO PUBLIC;


--
-- TOC entry 5533 (class 0 OID 0)
-- Dependencies: 249
-- Name: SEQUENCE expense_attachments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.expense_attachments_id_seq TO PUBLIC;


--
-- TOC entry 5535 (class 0 OID 0)
-- Dependencies: 236
-- Name: SEQUENCE expense_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.expense_types_id_seq TO PUBLIC;


--
-- TOC entry 5538 (class 0 OID 0)
-- Dependencies: 238
-- Name: SEQUENCE expenses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.expenses_id_seq TO PUBLIC;


--
-- TOC entry 5540 (class 0 OID 0)
-- Dependencies: 240
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.refresh_tokens_id_seq TO PUBLIC;


--
-- TOC entry 5544 (class 0 OID 0)
-- Dependencies: 271
-- Name: SEQUENCE repair_request_attachments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_attachments_id_seq TO PUBLIC;


--
-- TOC entry 5547 (class 0 OID 0)
-- Dependencies: 269
-- Name: SEQUENCE repair_request_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_history_id_seq TO PUBLIC;


--
-- TOC entry 5548 (class 0 OID 0)
-- Dependencies: 273
-- Name: SEQUENCE repair_request_number_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_number_seq TO PUBLIC;


--
-- TOC entry 5551 (class 0 OID 0)
-- Dependencies: 265
-- Name: SEQUENCE repair_request_priorities_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_priorities_id_seq TO PUBLIC;


--
-- TOC entry 5558 (class 0 OID 0)
-- Dependencies: 263
-- Name: SEQUENCE repair_request_statuses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_statuses_id_seq TO PUBLIC;


--
-- TOC entry 5561 (class 0 OID 0)
-- Dependencies: 261
-- Name: SEQUENCE repair_request_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_request_types_id_seq TO PUBLIC;


--
-- TOC entry 5563 (class 0 OID 0)
-- Dependencies: 267
-- Name: SEQUENCE repair_requests_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_requests_id_seq TO PUBLIC;


--
-- TOC entry 5564 (class 0 OID 0)
-- Dependencies: 278
-- Name: TABLE repair_workflow_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.repair_workflow_permissions TO PUBLIC;


--
-- TOC entry 5566 (class 0 OID 0)
-- Dependencies: 277
-- Name: SEQUENCE repair_workflow_permissions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_workflow_permissions_id_seq TO PUBLIC;


--
-- TOC entry 5567 (class 0 OID 0)
-- Dependencies: 276
-- Name: TABLE repair_workflow_stages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.repair_workflow_stages TO PUBLIC;


--
-- TOC entry 5569 (class 0 OID 0)
-- Dependencies: 275
-- Name: SEQUENCE repair_workflow_stages_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.repair_workflow_stages_id_seq TO PUBLIC;


--
-- TOC entry 5571 (class 0 OID 0)
-- Dependencies: 242
-- Name: SEQUENCE roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.roles_id_seq TO PUBLIC;


--
-- TOC entry 5576 (class 0 OID 0)
-- Dependencies: 245
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.users_id_seq TO PUBLIC;


-- Completed on 2026-01-14 16:42:44

--
-- PostgreSQL database dump complete
--

\unrestrict iY11AEG687U3Zg0ArSvvS30nc4UNmpOhlCoEm4eLZHTnVuW3HcdvDBcqWaSBus8

