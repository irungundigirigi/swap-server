--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-0+deb12u2)
-- Dumped by pg_dump version 15.12 (Debian 15.12-0+deb12u2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: item_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_categories (
    category_id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.item_categories OWNER TO postgres;

--
-- Name: item_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.item_categories_category_id_seq OWNER TO postgres;

--
-- Name: item_categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_categories_category_id_seq OWNED BY public.item_categories.category_id;


--
-- Name: item_conditions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_conditions (
    id integer NOT NULL,
    condition character varying(20)
);


ALTER TABLE public.item_conditions OWNER TO postgres;

--
-- Name: item_conditions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_conditions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.item_conditions_id_seq OWNER TO postgres;

--
-- Name: item_conditions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_conditions_id_seq OWNED BY public.item_conditions.id;


--
-- Name: item_tag_association; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_tag_association (
    item_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.item_tag_association OWNER TO postgres;

--
-- Name: item_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_tags (
    id integer NOT NULL,
    category_id integer,
    tag_name character varying(50),
    tag_type character varying(50)
);


ALTER TABLE public.item_tags OWNER TO postgres;

--
-- Name: item_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.item_tags_id_seq OWNER TO postgres;

--
-- Name: item_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_tags_id_seq OWNED BY public.item_tags.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    item_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    category_id integer,
    title character varying(255) NOT NULL,
    description text,
    condition character varying(50),
    image text[],
    location point,
    status character varying(20) DEFAULT 'available'::character varying,
    verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT items_condition_check CHECK (((condition)::text = ANY ((ARRAY['new'::character varying, 'gently-used'::character varying, 'used'::character varying, 'damaged'::character varying, 'vintage'::character varying])::text[]))),
    CONSTRAINT items_status_check CHECK (((status)::text = ANY ((ARRAY['on-hold'::character varying, 'available'::character varying, 'reserved'::character varying, 'swapped'::character varying])::text[])))
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: listing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listing (
    listing_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    caption character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    location point
);


ALTER TABLE public.listing OWNER TO postgres;

--
-- Name: listing_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listing_item (
    listing_id uuid NOT NULL,
    item_id uuid NOT NULL
);


ALTER TABLE public.listing_item OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    name character varying(100) NOT NULL,
    profile_pic text,
    bio text,
    location point,
    verified boolean DEFAULT false,
    account_status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_account_status_check CHECK (((account_status)::text = ANY ((ARRAY['active'::character varying, 'deactivated'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: item_categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_categories ALTER COLUMN category_id SET DEFAULT nextval('public.item_categories_category_id_seq'::regclass);


--
-- Name: item_conditions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_conditions ALTER COLUMN id SET DEFAULT nextval('public.item_conditions_id_seq'::regclass);


--
-- Name: item_tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_tags ALTER COLUMN id SET DEFAULT nextval('public.item_tags_id_seq'::regclass);


--
-- Data for Name: item_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_categories (category_id, title, description) FROM stdin;
1	Camping	Tents, sleeping bags, portable stoves, and other camping essentials
2	books	Textbooks, novels, and learning materials.
\.


--
-- Data for Name: item_conditions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_conditions (id, condition) FROM stdin;
1	new
2	gently-used
3	used
4	damaged
5	vintage
\.


--
-- Data for Name: item_tag_association; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_tag_association (item_id, tag_id) FROM stdin;
0e488a45-cd10-4dfd-beb2-2ddf265abd5b	4
43967849-9caa-4a77-b4f3-61543d683756	33
43967849-9caa-4a77-b4f3-61543d683756	30
d5008c2a-c01b-40d5-be2b-bc5a9f1d6df3	1
d5008c2a-c01b-40d5-be2b-bc5a9f1d6df3	2
d5008c2a-c01b-40d5-be2b-bc5a9f1d6df3	4
\.


--
-- Data for Name: item_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_tags (id, category_id, tag_name, tag_type) FROM stdin;
1	1	lightweight	other
2	1	compact	other
3	1	durable	other
4	1	waterproof	other
5	1	windproof	other
6	1	insulated	other
7	1	UV resistant	other
8	1	quick dry	other
9	1	odor resistant	other
10	1	adjustable	other
11	1	nylon	material
12	1	polyester	material
13	1	gore-tex	material
14	1	down insulation	material
15	1	synthetic insulation	material
16	1	aluminium	material
17	1	carbon	material
18	1	stainless steel	material
19	1	silicone	material
20	1	merino wool	material
21	2	hardcover	material
22	2	paperback	material
23	2	recycled-paper	material
26	2	textbook	interest
29	2	first-edition	other
30	2	limited-edition	other
31	2	signed-copy	other
32	2	collectors-item	other
33	2	vintage	other
34	2	sustainable-sourcing	other
35	2	non-toxic-ink	other
36	2	durable	other
37	2	waterproof	other
24	2	fiction	genre
25	2	non-fiction	genre
28	2	biography	genre
27	2	self-help	genre
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (item_id, user_id, category_id, title, description, condition, image, location, status, verified, created_at) FROM stdin;
0e488a45-cd10-4dfd-beb2-2ddf265abd5b	a6aa11e0-ddf9-44b8-92bf-9160c19edf06	1	Friends Egret Sleeping Bag	An extra warm sleeping bag in good condition.	gently-used	{/uploads/FriendsEgretSleepingBag_22.jpg}	\N	available	f	2025-05-05 17:50:09.778093
43967849-9caa-4a77-b4f3-61543d683756	a6aa11e0-ddf9-44b8-92bf-9160c19edf06	2	No picnic On Mt Kenya	An interesting read by an Italian writer about escape from a POW camp in Nanyuki in the early 90s  to climb Mt Kenya.	used	{/uploads/NopicnicOnMtKenya_24.jpg}	\N	available	f	2025-05-05 18:04:40.448699
d5008c2a-c01b-40d5-be2b-bc5a9f1d6df3	f1a1f8b0-fa20-4567-99d8-7b625ee0f844	1	Hiking BackPack 15L	In good condition but limited space. Best for day packing .	gently-used	{/uploads/HikingBackPack15L_48.jpg}	\N	available	f	2025-05-05 18:13:36.237038
\.


--
-- Data for Name: listing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listing (listing_id, user_id, caption, created_at, updated_at, location) FROM stdin;
d5708a02-2fe2-4214-845b-ba4470426069	a6aa11e0-ddf9-44b8-92bf-9160c19edf06	Anyone looking to swap something valuable for this extra sleeping bag. 	2025-05-05 17:58:42.940601	2025-05-05 17:58:42.940601	(37.0579784,-0.1829901)
fa5bb816-14d2-45c1-851c-23f30d588280	a6aa11e0-ddf9-44b8-92bf-9160c19edf06	Looking for an interesting read, maybe a classic.	2025-05-05 18:05:27.687671	2025-05-05 18:05:27.687671	(37.0579784,-0.1829901)
3bf601b0-d770-4432-b73a-4ea18949cc72	f1a1f8b0-fa20-4567-99d8-7b625ee0f844	Looking to trade this backpack for a nice sleeping bag.	2025-05-05 18:14:15.463495	2025-05-05 18:14:15.463495	(37.0579784,-0.1829901)
\.


--
-- Data for Name: listing_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listing_item (listing_id, item_id) FROM stdin;
d5708a02-2fe2-4214-845b-ba4470426069	0e488a45-cd10-4dfd-beb2-2ddf265abd5b
fa5bb816-14d2-45c1-851c-23f30d588280	43967849-9caa-4a77-b4f3-61543d683756
3bf601b0-d770-4432-b73a-4ea18949cc72	d5008c2a-c01b-40d5-be2b-bc5a9f1d6df3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, email, password, name, profile_pic, bio, location, verified, account_status, created_at, updated_at) FROM stdin;
f1a1f8b0-fa20-4567-99d8-7b625ee0f844	mugure_m	mark.mugure@gmail.com	$2a$10$/jGdMc.LYMbvPUDwmHFiV.tcNcbuKPsRp4lX7LYT/WCSKbK6Oyq7y	Mark Mugure	https://randomuser.me/api/portraits/men/5.jpg	Hello there! Nice to meet you.	(37.3084,-0.1521)	t	active	2025-05-05 17:44:03.915833	2025-05-05 17:44:03.915833
a6aa11e0-ddf9-44b8-92bf-9160c19edf06	alice78	alice.wangui@gmail.com	$2a$10$7NTxpMiBWS2d2/c8R/M8SOa3uEBDudI25sgJ.BA5NBy.Cr1h7LcHK	Alice Wangui	https://randomuser.me/api/portraits/women/5.jpg	Hello there! Nice to meet you.	(37.3084,0.0002)	t	active	2025-05-05 17:46:10.008766	2025-05-05 17:46:10.008766
\.


--
-- Name: item_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_categories_category_id_seq', 10, true);


--
-- Name: item_conditions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_conditions_id_seq', 5, true);


--
-- Name: item_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_tags_id_seq', 37, true);


--
-- Name: item_categories item_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_categories
    ADD CONSTRAINT item_categories_pkey PRIMARY KEY (category_id);


--
-- Name: item_categories item_categories_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_categories
    ADD CONSTRAINT item_categories_title_key UNIQUE (title);


--
-- Name: item_conditions item_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_conditions
    ADD CONSTRAINT item_conditions_pkey PRIMARY KEY (id);


--
-- Name: item_tag_association item_tag_association_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_tag_association
    ADD CONSTRAINT item_tag_association_pkey PRIMARY KEY (item_id, tag_id);


--
-- Name: item_tags item_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (item_id);


--
-- Name: listing_item listing_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_item
    ADD CONSTRAINT listing_item_pkey PRIMARY KEY (listing_id, item_id);


--
-- Name: listing listing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_pkey PRIMARY KEY (listing_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: item_tag_association item_tag_association_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_tag_association
    ADD CONSTRAINT item_tag_association_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id) ON DELETE CASCADE;


--
-- Name: item_tag_association item_tag_association_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_tag_association
    ADD CONSTRAINT item_tag_association_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.item_tags(id) ON DELETE CASCADE;


--
-- Name: item_tags item_tags_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.item_categories(category_id) ON DELETE CASCADE;


--
-- Name: items items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.item_categories(category_id) ON DELETE CASCADE;


--
-- Name: items items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: listing_item listing_item_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_item
    ADD CONSTRAINT listing_item_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id) ON DELETE CASCADE;


--
-- Name: listing_item listing_item_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_item
    ADD CONSTRAINT listing_item_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listing(listing_id) ON DELETE CASCADE;


--
-- Name: listing listing_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

