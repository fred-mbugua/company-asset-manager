--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.0

-- Started on 2025-09-20 12:46:28

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
-- TOC entry 859 (class 1247 OID 745060)
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
-- TOC entry 862 (class 1247 OID 745070)
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
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 229
-- Name: action_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_logs_id_seq OWNED BY public.action_logs.id;


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
    location character varying(255) NOT NULL,
    purchase_date date,
    purchase_price numeric(10,2),
    notes text
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
-- TOC entry 4985 (class 0 OID 0)
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
-- TOC entry 4986 (class 0 OID 0)
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
-- TOC entry 4987 (class 0 OID 0)
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
-- TOC entry 4988 (class 0 OID 0)
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
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 215
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- TOC entry 222 (class 1259 OID 745153)
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    asset_id integer,
    expense_type public.expense_type NOT NULL,
    date date NOT NULL,
    amount numeric(10,2) NOT NULL,
    vendor character varying(255),
    invoice_number character varying(255),
    notes text
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
-- TOC entry 4990 (class 0 OID 0)
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
-- TOC entry 4991 (class 0 OID 0)
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
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 223
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


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
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4747 (class 2604 OID 753441)
-- Name: action_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs ALTER COLUMN id SET DEFAULT nextval('public.action_logs_id_seq'::regclass);


--
-- TOC entry 4741 (class 2604 OID 745118)
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- TOC entry 4742 (class 2604 OID 745136)
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- TOC entry 4752 (class 2604 OID 753479)
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- TOC entry 4749 (class 2604 OID 753456)
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- TOC entry 4740 (class 2604 OID 745089)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 4743 (class 2604 OID 745156)
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- TOC entry 4746 (class 2604 OID 745311)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4744 (class 2604 OID 745278)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4745 (class 2604 OID 745287)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4974 (class 0 OID 753438)
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
\.


--
-- TOC entry 4962 (class 0 OID 745115)
-- Dependencies: 218
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, asset_tag, asset_type, manufacturer, model, serial_number, status, location, purchase_date, purchase_price, notes) FROM stdin;
1	ICT-LPT-001	Laptop	Dell	XPS 15	D-XPS-123456	In Stock	Head Office	2023-01-15	150000.00	High-performance laptop for a developer.
2	ICT-PRT-002	Printer	HP	LaserJet Pro MFP	HP-LJ-789012	In Use	Kibwezi Branch	2022-05-20	35000.00	Color printer for the finance team.
3	ICT-RTR-003	Router	Cisco	Meraki MX64	C-MRK-345678	In Stock	Mombasa Branch	2023-03-10	400.00	Spare router.
4	ICT-RTR-004	Router	Huawei	Huawei b35	H-B-345678	In Stock	Wote Branch	2024-03-10	4000.00	Replacement router.
\.


--
-- TOC entry 4964 (class 0 OID 745133)
-- Dependencies: 220
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, asset_id, employee_id, assignment_date, return_date, notes) FROM stdin;
6	1	4	2025-09-20	\N	Meets the minimum requirement
\.


--
-- TOC entry 4978 (class 0 OID 753476)
-- Dependencies: 234
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, location, created_at, updated_at) FROM stdin;
1	Headquarters	Mwatate, Taita Taveta	2025-09-20 11:29:51.759883+03	2025-09-20 11:29:51.759883+03
\.


--
-- TOC entry 4976 (class 0 OID 753453)
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
-- TOC entry 4960 (class 0 OID 745086)
-- Dependencies: 216
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, first_name, branch_location, department, department_id, middle_name, last_name, branch_id) FROM stdin;
2	Fredrick	\N	\N	1		Mbugua	1
3	Fredrick	\N	\N	1		Mbugua	1
4	Fredrick	\N	\N	1		Mbugua	1
\.


--
-- TOC entry 4966 (class 0 OID 745153)
-- Dependencies: 222
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, asset_id, expense_type, date, amount, vendor, invoice_number, notes) FROM stdin;
\.


--
-- TOC entry 4972 (class 0 OID 745308)
-- Dependencies: 228
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, token, user_id, expires_at) FROM stdin;
20	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJmbWJ1Z3VhQGppcmFuaXNtYXJ0LmNvbSIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc1ODM1OTA3MCwiZXhwIjoxNzU4OTYzODcwfQ.D6iTkNytCXmQ5B5NIq4CZy4r9IghJKAH8WsZoFFnBaE	7	2025-09-27 12:04:30.203+03
\.


--
-- TOC entry 4968 (class 0 OID 745275)
-- Dependencies: 224
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	Admin
2	Standard User
\.


--
-- TOC entry 4970 (class 0 OID 745284)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, employee_id, first_name, middle_name, last_name, email, password, role_id, department_id, phone, branch_id) FROM stdin;
7	4	Fredrick		Mbugua	fmbugua@jiranismart.com	$2a$10$HR0dy1le/l3GCWL/mwbyk.0c1FVWy8DmCPK2hlqWVpTqZmvLsRjuq	1	\N	+254740790088	1
\.


--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 229
-- Name: action_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_logs_id_seq', 18, true);


--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 217
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assets_id_seq', 4, true);


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 219
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignments_id_seq', 6, true);


--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 233
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 1, true);


--
-- TOC entry 4998 (class 0 OID 0)
-- Dependencies: 231
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 13, true);


--
-- TOC entry 4999 (class 0 OID 0)
-- Dependencies: 215
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 4, true);


--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 221
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, false);


--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 227
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 23, true);


--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 223
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- TOC entry 5003 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- TOC entry 4797 (class 2606 OID 753446)
-- Name: action_logs action_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs
    ADD CONSTRAINT action_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4759 (class 2606 OID 745124)
-- Name: assets assets_asset_tag_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_tag_key UNIQUE (asset_tag);


--
-- TOC entry 4761 (class 2606 OID 745122)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 745126)
-- Name: assets assets_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_serial_number_key UNIQUE (serial_number);


--
-- TOC entry 4770 (class 2606 OID 745138)
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 753487)
-- Name: branches branches_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_name_key UNIQUE (name);


--
-- TOC entry 4805 (class 2606 OID 753485)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 753462)
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- TOC entry 4801 (class 2606 OID 753460)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 4756 (class 2606 OID 745093)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 4775 (class 2606 OID 745160)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 2606 OID 745313)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4793 (class 2606 OID 745315)
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- TOC entry 4795 (class 2606 OID 745317)
-- Name: refresh_tokens refresh_tokens_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_key UNIQUE (user_id);


--
-- TOC entry 4779 (class 2606 OID 745282)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 4781 (class 2606 OID 745280)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4784 (class 2606 OID 745295)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4786 (class 2606 OID 745293)
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- TOC entry 4788 (class 2606 OID 745291)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4764 (class 1259 OID 745127)
-- Name: idx_assets_asset_tag; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_asset_tag ON public.assets USING btree (asset_tag);


--
-- TOC entry 4765 (class 1259 OID 745130)
-- Name: idx_assets_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_location ON public.assets USING btree (location);


--
-- TOC entry 4766 (class 1259 OID 745131)
-- Name: idx_assets_purchase_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_purchase_price ON public.assets USING btree (purchase_price);


--
-- TOC entry 4767 (class 1259 OID 745128)
-- Name: idx_assets_serial_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_serial_number ON public.assets USING btree (serial_number);


--
-- TOC entry 4768 (class 1259 OID 745129)
-- Name: idx_assets_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_type ON public.assets USING btree (asset_type);


--
-- TOC entry 4771 (class 1259 OID 745149)
-- Name: idx_assignments_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_asset_id ON public.assignments USING btree (asset_id);


--
-- TOC entry 4772 (class 1259 OID 745151)
-- Name: idx_assignments_current_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_current_asset ON public.assignments USING btree (employee_id, return_date) WHERE (return_date IS NULL);


--
-- TOC entry 4773 (class 1259 OID 745150)
-- Name: idx_assignments_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_employee_id ON public.assignments USING btree (employee_id);


--
-- TOC entry 4757 (class 1259 OID 745094)
-- Name: idx_employees_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_location ON public.employees USING btree (branch_location);


--
-- TOC entry 4776 (class 1259 OID 745166)
-- Name: idx_expenses_asset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_asset_id ON public.expenses USING btree (asset_id);


--
-- TOC entry 4777 (class 1259 OID 745167)
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);


--
-- TOC entry 4789 (class 1259 OID 745323)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 4782 (class 1259 OID 745306)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4815 (class 2606 OID 753447)
-- Name: action_logs action_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_logs
    ADD CONSTRAINT action_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4807 (class 2606 OID 745139)
-- Name: assignments assignments_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 4808 (class 2606 OID 745144)
-- Name: assignments assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 4809 (class 2606 OID 745161)
-- Name: expenses expenses_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 4806 (class 2606 OID 753468)
-- Name: employees fk_employees_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 4810 (class 2606 OID 753488)
-- Name: users fk_users_branch; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- TOC entry 4811 (class 2606 OID 753463)
-- Name: users fk_users_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 4814 (class 2606 OID 745318)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4812 (class 2606 OID 745296)
-- Name: users users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- TOC entry 4813 (class 2606 OID 745301)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


-- Completed on 2025-09-20 12:46:28

--
-- PostgreSQL database dump complete
--

