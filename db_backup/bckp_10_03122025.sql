--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.0

-- Started on 2025-12-03 16:23:54

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 866 (class 1247 OID 745060)
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
-- TOC entry 869 (class 1247 OID 745070)
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
-- TOC entry 230 (class 1259 OID 753438)
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
-- TOC entry 229 (class 1259 OID 753437)
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
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 229
-- Name: action_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_logs_id_seq OWNED BY public.action_logs.id;


--
-- TOC entry 238 (class 1259 OID 769836)
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
-- TOC entry 237 (class 1259 OID 769835)
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
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 237
-- Name: asset_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_statuses_id_seq OWNED BY public.asset_statuses.id;


--
-- TOC entry 236 (class 1259 OID 769822)
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
-- TOC entry 235 (class 1259 OID 769821)
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
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 235
-- Name: asset_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_types_id_seq OWNED BY public.asset_types.id;


--
-- TOC entry 218 (class 1259 OID 745115)
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
-- TOC entry 217 (class 1259 OID 745114)
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
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 217
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- TOC entry 220 (class 1259 OID 745133)
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
-- TOC entry 219 (class 1259 OID 745132)
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
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 219
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- TOC entry 234 (class 1259 OID 753476)
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
-- TOC entry 233 (class 1259 OID 753475)
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
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 233
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- TOC entry 232 (class 1259 OID 753453)
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
-- TOC entry 231 (class 1259 OID 753452)
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
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 231
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- TOC entry 216 (class 1259 OID 745086)
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
    branch_id integer NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 745085)
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
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 215
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- TOC entry 240 (class 1259 OID 778014)
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
-- TOC entry 239 (class 1259 OID 778013)
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
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 239
-- Name: expense_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expense_types_id_seq OWNED BY public.expense_types.id;


--
-- TOC entry 222 (class 1259 OID 745153)
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
    expense_type_id integer NOT NULL
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 745152)
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
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 221
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- TOC entry 228 (class 1259 OID 745308)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    token character varying(255) NOT NULL,
    user_id integer NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 745307)
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
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 227
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 224 (class 1259 OID 745275)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 745274)
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
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 223
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 241 (class 1259 OID 827166)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 745284)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    employee_id integer,
    first_name character varying(255) NOT NULL,
    middle_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role_id integer NOT NULL,
    department_id integer,
    phone character varying(13),
    branch_id integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 745283)
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
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4766 (class 2604 OID 753441)
-- Name: action_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs ALTER COLUMN id SET DEFAULT nextval('public.action_logs_id_seq'::regclass);


--
-- TOC entry 4777 (class 2604 OID 769839)
-- Name: asset_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses ALTER COLUMN id SET DEFAULT nextval('public.asset_statuses_id_seq'::regclass);


--
-- TOC entry 4774 (class 2604 OID 769825)
-- Name: asset_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types ALTER COLUMN id SET DEFAULT nextval('public.asset_types_id_seq'::regclass);


--
-- TOC entry 4760 (class 2604 OID 745118)
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- TOC entry 4761 (class 2604 OID 745136)
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- TOC entry 4771 (class 2604 OID 753479)
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- TOC entry 4768 (class 2604 OID 753456)
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- TOC entry 4759 (class 2604 OID 745089)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 4781 (class 2604 OID 778017)
-- Name: expense_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types ALTER COLUMN id SET DEFAULT nextval('public.expense_types_id_seq'::regclass);


--
-- TOC entry 4762 (class 2604 OID 745156)
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- TOC entry 4765 (class 2604 OID 745311)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 745278)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4764 (class 2604 OID 745287)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5023 (class 0 OID 753438)
-- Dependencies: 230
-- Data for Name: action_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.action_logs (id, user_id, action_type, entity_type, entity_id, details, created_at) FROM stdin;
5	\N	REGISTER	User	4	{"email": "fmbugua@jiranismart.com"}	2025-09-17 13:08:49.654645+03
6	\N	LOGIN	User	4	{"email": "fmbugua@jiranismart.com"}	2025-09-17 13:09:28.254522+03
7	\N	LOGIN	User	4	{"email": "fmbugua@jiranismart.com"}	2025-09-17 14:08:22.426684+03
8	\N	LOGIN	User	4	{"email": "fmbugua@jiranismart.com"}	2025-09-19 09:44:09.494269+03
9	\N	CREATE	Asset	4	{"asset_tag": "ICT-RTR-004"}	2025-09-19 09:53:47.620878+03
10	\N	LOGIN	User	4	{"email": "fmbugua@jiranismart.com"}	2025-09-19 12:40:54.249802+03
11	\N	LOGIN	User	4	{"email": "fmbugua@jiranismart.com"}	2025-09-19 14:49:10.0239+03
1	\N	LOGIN	User	1	{"email": "fmbugua@gmail.com"}	2025-09-17 10:25:43.713738+03
2	\N	LOGIN	User	1	{"email": "fmbugua@gmail.com"}	2025-09-17 10:27:11.634037+03
3	\N	LOGIN	User	1	{"email": "fmbugua@gmail.com"}	2025-09-17 11:36:55.02936+03
4	\N	LOGIN	User	1	{"email": "fmbugua@gmail.com"}	2025-09-17 13:03:55.806448+03
12	\N	CREATE	Branch	1	{"branch_name": "Headquarters"}	2025-09-20 11:29:51.782508+03
13	\N	CREATE	User	7	{"registered_email": "fmbugua@jiranismart.com"}	2025-09-20 11:36:45.246267+03
14	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-20 11:44:23.379311+03
15	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-20 11:56:05.244261+03
16	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-20 12:03:54.367717+03
17	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-20 12:04:30.212094+03
18	7	ASSIGN ASSET	Assignment	6	{"asset_id": 1, "employee_id": 4}	2025-09-20 12:09:23.057376+03
19	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-20 12:59:11.034685+03
20	7	CREATE	Asset	5	{"asset_tag": "LPT-RTR-004"}	2025-09-20 13:00:17.778317+03
21	\N	CREATE	User	8	{"registered_email": "ict@jiranismart.com"}	2025-09-25 14:06:45.927841+03
22	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-25 14:16:31.056991+03
23	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 18:40:38.720867+03
24	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 18:40:42.397035+03
25	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 18:44:13.396833+03
26	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 18:44:16.126508+03
27	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 18:44:39.06706+03
28	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 18:45:33.447602+03
29	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 18:54:27.755043+03
30	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 18:55:58.053716+03
31	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 18:57:16.146698+03
32	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 19:03:08.463771+03
33	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-28 19:11:33.772007+03
34	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-29 14:22:30.605349+03
35	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-29 14:24:01.415351+03
36	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-09-29 15:46:54.654332+03
37	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-02 14:45:08.796214+03
38	8	LOGIN	User	8	{"email": "ict@jiranismart.com"}	2025-10-02 15:28:06.797877+03
39	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-02 15:39:32.933688+03
40	7	CREATE	Asset	6	{"asset_tag": "LPT-RTR-005"}	2025-10-02 15:41:03.546821+03
41	8	LOGIN	User	8	{"email": "ict@jiranismart.com"}	2025-10-02 16:45:36.880847+03
42	8	UPDATE	Asset	1	{"new_data": {"notes": "High-performance laptop for development.", "status": "In Stock", "asset_tag": "ICT-LPT-001", "serial_number": "D-XPS-123456", "purchase_price": 150000}, "old_data": {"id": 1, "model": "XPS 15", "notes": "High-performance laptop for a developer.", "status": "In Stock", "location": "Head Office", "asset_tag": "ICT-LPT-001", "asset_type": "Laptop", "manufacturer": "Dell", "purchase_date": "2023-01-14T21:00:00.000Z", "serial_number": "D-XPS-123456", "purchase_price": "150000.00"}}	2025-10-02 16:53:40.585716+03
43	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-03 12:35:15.305407+03
44	7	UPDATE	Asset	3	{"new_data": {"notes": "Spare router. test", "status": "In Stock", "asset_tag": "ICT-RTR-003", "serial_number": "C-MRK-345678", "purchase_price": 400}, "old_data": {"id": 3, "model": "Meraki MX64", "notes": "Spare router.", "status": "In Stock", "location": "Mombasa Branch", "asset_tag": "ICT-RTR-003", "asset_type": "Router", "manufacturer": "Cisco", "purchase_date": "2023-03-09T21:00:00.000Z", "serial_number": "C-MRK-345678", "purchase_price": "400.00"}}	2025-10-03 12:35:52.007319+03
45	7	UPDATE	Asset	2	{"new_data": {"notes": "Color printer for the finance team. test", "status": "In Use", "asset_tag": "ICT-PRT-002", "serial_number": "HP-LJ-789012", "purchase_price": 35000}, "old_data": {"id": 2, "model": "LaserJet Pro MFP", "notes": "Color printer for the finance team.", "status": "In Use", "location": "Kibwezi Branch", "asset_tag": "ICT-PRT-002", "asset_type": "Printer", "manufacturer": "HP", "purchase_date": "2022-05-19T21:00:00.000Z", "serial_number": "HP-LJ-789012", "purchase_price": "35000.00"}}	2025-10-03 12:36:48.181862+03
46	7	UPDATE	Asset	2	{"new_data": {"notes": "Color printer for the finance team.", "status": "In Use", "asset_tag": "ICT-PRT-002", "serial_number": "HP-LJ-789012", "purchase_price": 35000}, "old_data": {"id": 2, "model": "LaserJet Pro MFP", "notes": "Color printer for the finance team. test", "status": "In Use", "location": "Kibwezi Branch", "asset_tag": "ICT-PRT-002", "asset_type": "Printer", "manufacturer": "HP", "purchase_date": "2022-05-19T21:00:00.000Z", "serial_number": "HP-LJ-789012", "purchase_price": "35000.00"}}	2025-10-03 12:37:12.521074+03
47	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-03 15:38:30.856487+03
48	7	ASSIGN ASSET	Assignment	7	{"asset_id": 4, "employee_id": 5}	2025-10-03 15:59:35.472585+03
49	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-07 09:03:42.667201+03
50	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-08 09:10:42.693097+03
51	7	ASSIGN ASSET	Assignment	8	{"asset_id": 6, "employee_id": 4}	2025-10-08 09:27:04.892988+03
52	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 08:29:00.866572+03
53	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 10:10:07.269384+03
54	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 16:06:18.307209+03
55	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 16:09:30.834856+03
56	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 16:27:27.738809+03
57	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 16:29:13.353009+03
58	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 16:54:48.620744+03
59	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 17:03:47.873253+03
60	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 18:12:06.796511+03
61	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 18:52:26.484562+03
62	7	ASSIGN ASSET	Assignment	9	{"asset_id": 3, "employee_id": 5}	2025-10-09 19:01:27.145006+03
63	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-09 19:02:31.938809+03
64	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-10 04:57:34.359848+03
65	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-10 10:57:12.195822+03
66	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-10 11:18:12.468953+03
67	7	CREATE	Expense	3	{"amount": "10000.00", "asset_id": 4}	2025-10-10 11:42:57.074449+03
68	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-11 09:08:24.929573+03
69	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-11 09:12:02.717209+03
70	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-14 07:34:05.692561+03
71	7	CREATE	Expense	4	{"amount": "3500.00", "asset_id": 6}	2025-10-14 10:38:22.641417+03
72	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-14 11:13:00.654903+03
73	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-15 12:04:20.630002+03
74	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-15 12:04:21.007701+03
75	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-15 12:04:21.131751+03
76	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-15 16:07:14.706904+03
77	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-17 16:21:50.66354+03
78	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-18 11:48:52.420611+03
79	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-18 12:19:43.804751+03
80	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-18 12:47:55.039586+03
81	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-19 10:44:57.590809+03
82	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-19 12:48:22.082283+03
83	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-10-19 14:26:51.797691+03
84	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-11-26 16:39:27.11842+03
85	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-11-28 12:48:31.087238+03
86	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-12-01 22:15:32.173052+03
87	7	LOGIN	User	7	{"email": "fmbugua@jiranismart.com"}	2025-12-03 14:38:36.873512+03
88	7	UPDATE	Asset	6	{"new_data": {"notes": "Replacement laptop", "status": "In Stock", "asset_tag": "LPT-RTR-005", "serial_number": "L-345678", "purchase_price": 30000}, "old_data": {"id": 6, "model": "latitude", "notes": "Replacement laptop.", "status": "In Stock", "asset_tag": "LPT-RTR-005", "branch_id": 1, "asset_type": "Laptop", "manufacturer": "Dell", "asset_type_id": 1, "purchase_date": "2025-10-01T21:00:00.000Z", "serial_number": "L-345678", "purchase_price": "30000.00", "asset_status_id": 3}}	2025-12-03 14:50:30.435783+03
\.


--
-- TOC entry 5031 (class 0 OID 769836)
-- Dependencies: 238
-- Data for Name: asset_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_statuses (id, name, is_available, description, created_at, updated_at) FROM stdin;
1	In Use	f	Asset is currently assigned and deployed.	2025-10-09 18:12:23.042878+03	2025-10-09 18:12:23.042878+03
3	In Stock	f	Asset is currently assigned and deployed.	2025-10-09 18:12:42.355423+03	2025-10-09 18:12:42.355423+03
\.


--
-- TOC entry 5029 (class 0 OID 769822)
-- Dependencies: 236
-- Data for Name: asset_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_types (id, name, description, created_at, updated_at) FROM stdin;
1	Laptop	Portable computers assigned to staff, typically high-value assets.	2025-10-09 16:56:06.312923+03	2025-10-09 16:56:06.312923+03
3	Router	Router.	2025-10-18 12:20:32.117117+03	2025-10-18 12:20:32.117117+03
4	Printer	Printer.	2025-10-18 12:20:54.583249+03	2025-10-18 12:20:54.583249+03
\.


--
-- TOC entry 5011 (class 0 OID 745115)
-- Dependencies: 218
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, asset_tag, asset_type, manufacturer, model, serial_number, status, purchase_date, purchase_price, notes, asset_type_id, asset_status_id, branch_id) FROM stdin;
2	ICT-PRT-002	Printer	HP	LaserJet Pro MFP	HP-LJ-789012	In Use	2022-05-20	35000.00	Color printer for the finance team.	4	1	1
3	ICT-RTR-003	Router	Cisco	Meraki MX64	C-MRK-345678	In Stock	2023-03-10	400.00	Spare router. test	3	3	1
4	ICT-RTR-004	Router	Huawei	Huawei b35	H-B-345678	In Stock	2024-03-10	4000.00	Replacement router.	3	3	1
5	LPT-RTR-004	Laptop	Huawei	Huawei Lap	L-B-345678	In Stock	2024-03-10	40000.00	Replacement laptop.	1	3	1
1	ICT-LPT-001	Laptop	Dell	XPS 15	D-XPS-123456	In Stock	2022-05-20	150000.00	Test	1	3	1
6	LPT-RTR-005	Laptop	Dell	latitude	L-345678	In Stock	2025-10-02	30000.00	Replacement laptop	1	3	1
\.


--
-- TOC entry 5013 (class 0 OID 745133)
-- Dependencies: 220
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, asset_id, employee_id, assignment_date, return_date, notes) FROM stdin;
6	1	4	2025-09-20	\N	Meets the minimum requirement
7	4	5	2025-10-03	\N	test
8	6	4	2025-10-08	\N	good for web hosting
9	3	5	2025-10-09	\N	to improve branch network
\.


--
-- TOC entry 5027 (class 0 OID 753476)
-- Dependencies: 234
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, location, created_at, updated_at) FROM stdin;
1	HQ	Mwatate, Taita Taveta	2025-09-20 11:29:51.759883+03	2025-09-20 11:29:51.759883+03
\.


--
-- TOC entry 5025 (class 0 OID 753453)
-- Dependencies: 232
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
9	Finance / Admin	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
10	Human Resource	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
11	Customer Care	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
12	Management	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
13	Business	2025-09-17 11:50:54.702412+03	2025-09-17 11:50:54.702412+03
\.


--
-- TOC entry 5009 (class 0 OID 745086)
-- Dependencies: 216
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, first_name, branch_location, department, department_id, middle_name, last_name, branch_id) FROM stdin;
2	Fredrick	\N	\N	1		Mbugua	1
3	Fredrick	\N	\N	1		Mbugua	1
4	Fredrick	\N	\N	1		Mbugua	1
5	Dev	\N	\N	1		Dev	1
\.


--
-- TOC entry 5033 (class 0 OID 778014)
-- Dependencies: 240
-- Data for Name: expense_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_types (id, name, description, created_at, updated_at) FROM stdin;
1	Purchase	Original capitalized cost of the asset.	2025-10-10 10:58:54.100412+03	2025-10-10 10:58:54.100412+03
3	Repair	Repair cost of the asset.	2025-10-10 11:07:44.784952+03	2025-10-10 11:07:44.784952+03
4	Logistics	Transport cost of the asset.	2025-10-10 11:08:14.682477+03	2025-10-10 11:08:14.682477+03
\.


--
-- TOC entry 5015 (class 0 OID 745153)
-- Dependencies: 222
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, asset_id, date, amount, vendor, invoice_number, notes, expense_type_id) FROM stdin;
3	4	2025-10-01	10000.00	Free technologies	234	replacement for spoilt network router in Meru branch.	1
4	6	2025-10-14	3500.00	Free technologies	235	Battery purchase and replcaement costs.	3
\.


--
-- TOC entry 5021 (class 0 OID 745308)
-- Dependencies: 228
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, token, user_id, expires_at) FROM stdin;
45	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJpY3RAamlyYW5pc21hcnQuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzU5NDEyNzM2LCJleHAiOjE3NjAwMTc1MzZ9.TuOUTxwzGiQrbAH8Y9XM2a9UiyavpCKW4AO7eTzRqic	8	2025-10-09 16:45:36.858+03
20	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJmbWJ1Z3VhQGppcmFuaXNtYXJ0LmNvbSIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc2NDc2NDk5MywiZXhwIjoxNzY1MzY5NzkzfQ.3_0A1ai3CakWBkHHgoQeGieDi9_nYJO_Pcw6r3by_pg	7	2025-12-10 15:29:53.85+03
\.


--
-- TOC entry 5017 (class 0 OID 745275)
-- Dependencies: 224
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	Admin
2	Standard User
\.


--
-- TOC entry 5034 (class 0 OID 827166)
-- Dependencies: 241
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
N5LL6SN8ggmodUmG2haQ8ft4M4VYU9_1	{"cookie":{"originalMaxAge":86400000,"expires":"2025-12-04T11:38:33.734Z","secure":false,"httpOnly":true,"path":"/"},"returnTo":"/"}	2025-12-04 16:18:53
\.


--
-- TOC entry 5019 (class 0 OID 745284)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, employee_id, first_name, middle_name, last_name, email, password, role_id, department_id, phone, branch_id) FROM stdin;
7	4	Fredrick		Mbugua	fmbugua@jiranismart.com	$2a$10$HR0dy1le/l3GCWL/mwbyk.0c1FVWy8DmCPK2hlqWVpTqZmvLsRjuq	1	\N	+254740790088	1
8	5	Dev		Dev	ict@jiranismart.com	$2a$10$8aGHsw15ZtlamO1D9SyWSeAdOiRs/Mx.rJoo1oGz4JqKWM1XQkQTe	1	\N	+254793577021	1
\.


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 229
-- Name: action_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_logs_id_seq', 88, true);


--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 237
-- Name: asset_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_statuses_id_seq', 3, true);


--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 235
-- Name: asset_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_types_id_seq', 4, true);


--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 217
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assets_id_seq', 6, true);


--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 219
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignments_id_seq', 9, true);


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 233
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 2, true);


--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 231
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 13, true);


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 215
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 5, true);


--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 239
-- Name: expense_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_types_id_seq', 5, true);


--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 221
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 4, true);


--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 227
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 106, true);


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 223
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- TOC entry 4825 (class 2606 OID 753446)
-- Name: action_logs action_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs
    ADD CONSTRAINT action_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4840 (class 2606 OID 769848)
-- Name: asset_statuses asset_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses
    ADD CONSTRAINT asset_statuses_name_key UNIQUE (name);


--
-- TOC entry 4842 (class 2606 OID 769846)
-- Name: asset_statuses asset_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_statuses
    ADD CONSTRAINT asset_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 769833)
-- Name: asset_types asset_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT asset_types_name_key UNIQUE (name);


--
-- TOC entry 4837 (class 2606 OID 769831)
-- Name: asset_types asset_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT asset_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4788 (class 2606 OID 745124)
-- Name: assets assets_asset_tag_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_tag_key UNIQUE (asset_tag);


--
-- TOC entry 4790 (class 2606 OID 745122)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4792 (class 2606 OID 745126)
-- Name: assets assets_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_serial_number_key UNIQUE (serial_number);


--
-- TOC entry 4798 (class 2606 OID 745138)
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 753487)
-- Name: branches branches_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_name_key UNIQUE (name);


--
-- TOC entry 4833 (class 2606 OID 753485)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 753462)
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- TOC entry 4829 (class 2606 OID 753460)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 4785 (class 2606 OID 745093)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 4845 (class 2606 OID 778025)
-- Name: expense_types expense_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT expense_types_name_key UNIQUE (name);


--
-- TOC entry 4847 (class 2606 OID 778023)
-- Name: expense_types expense_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT expense_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 745160)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 4819 (class 2606 OID 745313)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 745315)
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- TOC entry 4823 (class 2606 OID 745317)
-- Name: refresh_tokens refresh_tokens_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_key UNIQUE (user_id);


--
-- TOC entry 4807 (class 2606 OID 745282)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 4809 (class 2606 OID 745280)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4850 (class 2606 OID 827172)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 4812 (class 2606 OID 745295)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4814 (class 2606 OID 745293)
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- TOC entry 4816 (class 2606 OID 745291)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4843 (class 1259 OID 769849)
-- Name: idx_asset_statuses_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_asset_statuses_name ON public.asset_statuses USING btree (name);


--
-- TOC entry 4838 (class 1259 OID 769834)
-- Name: idx_asset_types_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_asset_types_name ON public.asset_types USING btree (name);


--
-- TOC entry 4793 (class 1259 OID 745127)
-- Name: idx_assets_asset_tag; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_asset_tag ON public.assets USING btree (asset_tag);


--
-- TOC entry 4794 (class 1259 OID 745131)
-- Name: idx_assets_purchase_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_purchase_price ON public.assets USING btree (purchase_price);


--
-- TOC entry 4795 (class 1259 OID 745128)
-- Name: idx_assets_serial_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_serial_number ON public.assets USING btree (serial_number);


--
-- TOC entry 4796 (class 1259 OID 745129)
-- Name: idx_assets_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_type ON public.assets USING btree (asset_type);


--
-- TOC entry 4799 (class 1259 OID 745149)
-- Name: idx_assignments_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_asset_id ON public.assignments USING btree (asset_id);


--
-- TOC entry 4800 (class 1259 OID 745151)
-- Name: idx_assignments_current_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_current_asset ON public.assignments USING btree (employee_id, return_date) WHERE (return_date IS NULL);


--
-- TOC entry 4801 (class 1259 OID 745150)
-- Name: idx_assignments_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_employee_id ON public.assignments USING btree (employee_id);


--
-- TOC entry 4786 (class 1259 OID 745094)
-- Name: idx_employees_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_location ON public.employees USING btree (branch_location);


--
-- TOC entry 4848 (class 1259 OID 778026)
-- Name: idx_expense_types_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_expense_types_name ON public.expense_types USING btree (name);


--
-- TOC entry 4804 (class 1259 OID 745166)
-- Name: idx_expenses_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_asset_id ON public.expenses USING btree (asset_id);


--
-- TOC entry 4805 (class 1259 OID 745167)
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);


--
-- TOC entry 4817 (class 1259 OID 745323)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 4810 (class 1259 OID 745306)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4864 (class 2606 OID 753447)
-- Name: action_logs action_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs
    ADD CONSTRAINT action_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4852 (class 2606 OID 786210)
-- Name: assets asset_status_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT asset_status_id_fk FOREIGN KEY (asset_status_id) REFERENCES public.asset_statuses(id) ON DELETE CASCADE;


--
-- TOC entry 4853 (class 2606 OID 786205)
-- Name: assets asset_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT asset_type_id_fk FOREIGN KEY (asset_type_id) REFERENCES public.asset_types(id) ON DELETE CASCADE;


--
-- TOC entry 4855 (class 2606 OID 745139)
-- Name: assignments assignments_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 4856 (class 2606 OID 745144)
-- Name: assignments assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 4854 (class 2606 OID 786215)
-- Name: assets branch_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- TOC entry 4857 (class 2606 OID 778027)
-- Name: expenses expense_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expense_type_id_fk FOREIGN KEY (expense_type_id) REFERENCES public.expense_types(id) ON DELETE CASCADE;


--
-- TOC entry 4858 (class 2606 OID 745161)
-- Name: expenses expenses_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 4851 (class 2606 OID 753468)
-- Name: employees fk_employees_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 4859 (class 2606 OID 753488)
-- Name: users fk_users_branch; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- TOC entry 4860 (class 2606 OID 753463)
-- Name: users fk_users_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 4863 (class 2606 OID 745318)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4861 (class 2606 OID 745296)
-- Name: users users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- TOC entry 4862 (class 2606 OID 745301)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


-- Completed on 2025-12-03 16:23:55

--
-- PostgreSQL database dump complete
--

