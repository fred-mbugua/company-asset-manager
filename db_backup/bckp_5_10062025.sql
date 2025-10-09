--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.0

-- Started on 2025-10-06 00:31:24

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
-- TOC entry 6 (class 2615 OID 562556)
-- Name: logs; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA logs;


ALTER SCHEMA logs OWNER TO postgres;

--
-- TOC entry 987 (class 1247 OID 655821)
-- Name: user_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_type AS ENUM (
    'job_seeker',
    'employer',
    'staff'
);


ALTER TYPE public.user_type OWNER TO postgres;

--
-- TOC entry 330 (class 1255 OID 737019)
-- Name: add_user_education(integer, character varying, character varying, character varying, date, date, boolean, character varying, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_user_education(p_user_id integer, p_institution_name character varying, p_degree character varying, p_field_of_study character varying, p_start_date date, p_end_date date, p_is_current boolean, p_grade character varying, p_description text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_education_id INTEGER;
BEGIN
    INSERT INTO public.user_education (
        user_id, institution_name, degree, field_of_study,
        start_date, end_date, is_current, grade, description
    ) VALUES (
        p_user_id, p_institution_name, p_degree, p_field_of_study,
        p_start_date, p_end_date, p_is_current, p_grade, p_description
    ) RETURNING id INTO v_education_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Education added successfully',
        'education_id', v_education_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error adding education: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.add_user_education(p_user_id integer, p_institution_name character varying, p_degree character varying, p_field_of_study character varying, p_start_date date, p_end_date date, p_is_current boolean, p_grade character varying, p_description text) OWNER TO postgres;

--
-- TOC entry 327 (class 1255 OID 737016)
-- Name: add_user_experience(integer, character varying, character varying, character varying, date, date, boolean, text, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_user_experience(p_user_id integer, p_job_title character varying, p_company_name character varying, p_company_location character varying, p_start_date date, p_end_date date, p_is_current boolean, p_description text, p_skills_used text[]) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_experience_id INTEGER;
BEGIN
    INSERT INTO public.user_experience (
        user_id, job_title, company_name, company_location, 
        start_date, end_date, is_current, description, skills_used
    ) VALUES (
        p_user_id, p_job_title, p_company_name, p_company_location,
        p_start_date, p_end_date, p_is_current, p_description, p_skills_used
    ) RETURNING id INTO v_experience_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Experience added successfully',
        'experience_id', v_experience_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error adding experience: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.add_user_experience(p_user_id integer, p_job_title character varying, p_company_name character varying, p_company_location character varying, p_start_date date, p_end_date date, p_is_current boolean, p_description text, p_skills_used text[]) OWNER TO postgres;

--
-- TOC entry 336 (class 1255 OID 737023)
-- Name: add_user_skill(integer, character varying, integer, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_user_skill(p_user_id integer, p_skill_name character varying, p_proficiency_level integer DEFAULT 3, p_years_experience numeric DEFAULT 0) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_skill_id INTEGER;
    v_existing_skill INTEGER;
BEGIN
    -- Check if skill exists
    SELECT id INTO v_skill_id FROM skills WHERE LOWER(name) = LOWER(p_skill_name);
    
    -- If skill doesn't exist, create it
    IF v_skill_id IS NULL THEN
        INSERT INTO skills (name, category) VALUES (p_skill_name, 'General') RETURNING id INTO v_skill_id;
    END IF;
    
    -- Check if user already has this skill
    SELECT id INTO v_existing_skill FROM user_skill_proficiency 
    WHERE user_id = p_user_id AND skill_id = v_skill_id;
    
    IF v_existing_skill IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'You already have this skill in your profile'
        );
    END IF;
    
    -- Add skill to user profile
    INSERT INTO user_skill_proficiency (user_id, skill_id, proficiency_level, years_experience)
    VALUES (p_user_id, v_skill_id, p_proficiency_level, p_years_experience);
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Skill added successfully',
        'skill_id', v_skill_id,
        'skill_name', p_skill_name
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error adding skill: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.add_user_skill(p_user_id integer, p_skill_name character varying, p_proficiency_level integer, p_years_experience numeric) OWNER TO postgres;

--
-- TOC entry 321 (class 1255 OID 728773)
-- Name: archive_old_applications(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.archive_old_applications(p_days_old integer DEFAULT 365) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_archived_count INTEGER;
BEGIN
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS applications_archive (LIKE applications INCLUDING ALL);
    
    -- Move old applications to archive
    INSERT INTO applications_archive 
    SELECT * FROM applications 
    WHERE status IN ('Withdrawn', 'Rejected') 
    AND applied_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days_old;
    
    GET DIAGNOSTICS v_archived_count = ROW_COUNT;
    
    -- Delete from main table
    DELETE FROM applications 
    WHERE status IN ('Withdrawn', 'Rejected') 
    AND applied_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days_old;
    
    RETURN v_archived_count;
END;
$$;


ALTER FUNCTION public.archive_old_applications(p_days_old integer) OWNER TO postgres;

--
-- TOC entry 311 (class 1255 OID 720769)
-- Name: calculate_job_match_score(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_job_match_score(p_user_id integer, p_job_id integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_skill_score DECIMAL(5,2) := 0;
    v_location_score DECIMAL(5,2) := 0;
    v_salary_score DECIMAL(5,2) := 0;
    v_experience_score DECIMAL(5,2) := 0;
    v_total_score DECIMAL(5,2) := 0;
    v_skill_weight DECIMAL(5,2);
    v_location_weight DECIMAL(5,2);
    v_salary_weight DECIMAL(5,2);
    v_experience_weight DECIMAL(5,2);
BEGIN
    -- Get algorithm weights
    SELECT param_value INTO v_skill_weight FROM matching_algorithm_params WHERE param_name = 'skill_match_weight';
    SELECT param_value INTO v_location_weight FROM matching_algorithm_params WHERE param_name = 'location_match_weight';
    SELECT param_value INTO v_salary_weight FROM matching_algorithm_params WHERE param_name = 'salary_match_weight';
    SELECT param_value INTO v_experience_weight FROM matching_algorithm_params WHERE param_name = 'experience_match_weight';
    
    -- Calculate skill match score (0-100)
    SELECT COALESCE(
        (COUNT(DISTINCT usp.skill_id) * 100.0 / NULLIF(COUNT(DISTINCT jsr.skill_id), 0)), 0
    ) INTO v_skill_score
    FROM job_skill_requirements jsr
    LEFT JOIN user_skill_proficiency usp ON jsr.skill_id = usp.skill_id AND usp.user_id = p_user_id
    WHERE jsr.job_id = p_job_id;
    
    -- Calculate location match score (0-100) - using actual column names from backup
    -- We'll use country-based matching
    SELECT CASE 
        WHEN c1.country_name = c2.country_name THEN 100
        WHEN c1.country_name IS NULL OR c2.country_name IS NULL THEN 50
        ELSE 25
    END INTO v_location_score
    FROM users u
    JOIN countries c1 ON u.country_id = c1.id
    CROSS JOIN jobs j
    JOIN countries c2 ON j.job_employer_country_serial = c2.id
    WHERE u.id = p_user_id AND j.id = p_job_id;
    
    -- Calculate salary match score (0-100) - using actual column names from backup
    -- Jobs have job_salary (single value), not salary_min/salary_max
    SELECT CASE 
        WHEN ua.salary_preference_weight IS NULL THEN 50
        WHEN j.job_salary IS NULL THEN 50
        WHEN ua.salary_preference_weight BETWEEN j.job_salary * 0.8 AND j.job_salary * 1.2 THEN 100
        WHEN ua.salary_preference_weight < j.job_salary * 0.8 THEN 
            GREATEST(0, 100 - ((j.job_salary * 0.8 - ua.salary_preference_weight) * 100.0 / j.job_salary))
        ELSE 
            GREATEST(0, 100 - ((ua.salary_preference_weight - j.job_salary * 1.2) * 100.0 / j.job_salary))
    END INTO v_salary_score
    FROM users u
    LEFT JOIN user_profile_analytics ua ON u.id = ua.user_id
    CROSS JOIN jobs j
    WHERE u.id = p_user_id AND j.id = p_job_id;
    
    -- Calculate experience match score (0-100)
    SELECT CASE 
        WHEN ua.experience_level_preference IS NULL THEN 50
        WHEN ua.experience_level_preference = 0 THEN 50
        ELSE 50  -- Default score since experience_level column might not exist
    END INTO v_experience_score
    FROM users u
    LEFT JOIN user_profile_analytics ua ON u.id = ua.user_id
    CROSS JOIN jobs j
    WHERE u.id = p_user_id AND j.id = p_job_id;
    
    -- Calculate weighted total score
    v_total_score := (v_skill_score * v_skill_weight) + 
                     (v_location_score * v_location_weight) + 
                     (v_salary_score * v_salary_weight) + 
                     (v_experience_score * v_experience_weight);
    
    RETURN ROUND(v_total_score, 2);
END;
$$;


ALTER FUNCTION public.calculate_job_match_score(p_user_id integer, p_job_id integer) OWNER TO postgres;

--
-- TOC entry 297 (class 1255 OID 728770)
-- Name: check_existing_application(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_existing_application(p_job_id integer, p_user_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_application_id INTEGER;
    v_status VARCHAR(50);
BEGIN
    SELECT id, status INTO v_application_id, v_status
    FROM applications
    WHERE job_id = p_job_id AND user_id = p_user_id;
    
    IF v_application_id IS NULL THEN
        RETURN jsonb_build_object(
            'exists', false,
            'message', 'No existing application found'
        );
    ELSE
        RETURN jsonb_build_object(
            'exists', true,
            'application_id', v_application_id,
            'status', v_status,
            'message', 'Application already exists with status: ' || v_status
        );
    END IF;
END;
$$;


ALTER FUNCTION public.check_existing_application(p_job_id integer, p_user_id integer) OWNER TO postgres;

--
-- TOC entry 320 (class 1255 OID 728772)
-- Name: cleanup_old_applications(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_old_applications(p_days_old integer DEFAULT 365) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete applications older than specified days (only withdrawn/rejected ones)
    DELETE FROM applications 
    WHERE status IN ('Withdrawn', 'Rejected') 
    AND applied_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days_old;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$;


ALTER FUNCTION public.cleanup_old_applications(p_days_old integer) OWNER TO postgres;

--
-- TOC entry 331 (class 1255 OID 728763)
-- Name: create_job_application(integer, integer, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_job_application(p_job_id integer, p_user_id integer, p_cv_url text DEFAULT NULL::text, p_cover_letter_url text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_application_id INTEGER;
    v_result JSONB;
    v_existing_application INTEGER;
BEGIN
    -- Check if user has already applied for this job
    SELECT id INTO v_existing_application 
    FROM applications 
    WHERE job_id = p_job_id AND user_id = p_user_id;
    
    IF v_existing_application IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'You have already applied for this job',
            'application_id', v_existing_application
        );
    END IF;
    
    -- Check if job exists and is active
    IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = p_job_id AND job_is_draft = false) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Job not found or not available'
        );
    END IF;
    
    -- Check if user exists and is active
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND user_is_active = true) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not found or inactive'
        );
    END IF;
    
    -- Insert new application
    INSERT INTO applications (job_id, user_id, cv_url, cover_letter_url, status)
    VALUES (p_job_id, p_user_id, p_cv_url, p_cover_letter_url, 'Pending')
    RETURNING id INTO v_application_id;
    
    -- Insert initial status history
    INSERT INTO application_status_history (application_id, old_status, new_status, changed_by)
    VALUES (v_application_id, NULL, 'Pending', p_user_id);
    
    -- Return success response
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Application submitted successfully',
        'application_id', v_application_id,
        'status', 'Pending',
        'applied_at', CURRENT_TIMESTAMP
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error creating application: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.create_job_application(p_job_id integer, p_user_id integer, p_cv_url text, p_cover_letter_url text) OWNER TO postgres;

--
-- TOC entry 314 (class 1255 OID 737021)
-- Name: delete_user_education(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_user_education(p_education_id integer, p_user_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM public.user_education 
    WHERE id = p_education_id AND user_id = p_user_id;
    
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Education deleted successfully'
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Education not found or unauthorized'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error deleting education: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.delete_user_education(p_education_id integer, p_user_id integer) OWNER TO postgres;

--
-- TOC entry 329 (class 1255 OID 737018)
-- Name: delete_user_experience(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_user_experience(p_experience_id integer, p_user_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM public.user_experience 
    WHERE id = p_experience_id AND user_id = p_user_id;
    
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Experience deleted successfully'
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Experience not found or unauthorized'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error deleting experience: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.delete_user_experience(p_experience_id integer, p_user_id integer) OWNER TO postgres;

--
-- TOC entry 339 (class 1255 OID 761630)
-- Name: generate_job_recommendations(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_job_recommendations(p_user_id integer, p_limit integer DEFAULT 10) RETURNS TABLE(id integer, title character varying, company character varying, company_logo_url character varying, location character varying, description character varying, salary_min integer, salary_max integer, salary_currency character varying, type character varying, match_score numeric, recommendation_reason text, skills character varying[])
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Clear expired recommendations
    DELETE FROM job_recommendations_cache 
    WHERE user_id = p_user_id AND expires_at < CURRENT_TIMESTAMP;
    
    -- Generate new recommendations - using job_is_draft
    INSERT INTO job_recommendations_cache (user_id, job_id, match_score, recommendation_reason)
    SELECT 
        p_user_id,
        j.id,
        calculate_job_match_score(p_user_id, j.id) AS match_score,
        CASE 
            WHEN calculate_job_match_score(p_user_id, j.id) >= 80 THEN 'Excellent match based on your skills and preferences'
            WHEN calculate_job_match_score(p_user_id, j.id) >= 60 THEN 'Good match with some alignment to your profile'
            ELSE 'Potential match based on available criteria'
        END AS recommendation_reason
    FROM jobs j
    WHERE j.job_is_draft = FALSE
      AND j.id NOT IN (
          SELECT jrc.job_id
          FROM job_recommendations_cache jrc
          WHERE jrc.user_id = p_user_id AND jrc.is_active = TRUE
      )
    ORDER BY calculate_job_match_score(p_user_id, j.id) DESC
    LIMIT p_limit;
    
    -- Return recommendations with full job details + company_logo_url
    RETURN QUERY
    SELECT
        j.id,
        COALESCE(j.job_title, 'Job Title Not Available')::VARCHAR AS title,
        companies.company_name AS company,
        COALESCE(companies.logo_url, companies.profile_image) AS company_logo_url,
        companies.location AS location,
        COALESCE(j.job_details, 'Job description not available')::VARCHAR AS description,
        CASE WHEN j.job_salary IS NOT NULL THEN CAST(j.job_salary AS INTEGER) ELSE NULL END AS salary_min,
        CASE WHEN j.job_salary IS NOT NULL THEN CAST(j.job_salary AS INTEGER) ELSE NULL END AS salary_max,
        'KES'::VARCHAR AS salary_currency,
        CASE
            WHEN j.job_positions IS NULL THEN 'Full-time'
            WHEN j.job_positions = 1 THEN 'Full-time'
            WHEN j.job_positions = 2 THEN 'Part-time'
            WHEN j.job_positions = 3 THEN 'Contract'
            WHEN j.job_positions = 4 THEN 'Internship'
            ELSE 'Full-time'
        END::VARCHAR AS type,
        jrc.match_score,
        jrc.recommendation_reason,
        COALESCE(j.job_tags, ARRAY[]::VARCHAR[]) AS skills
    FROM
        job_recommendations_cache jrc
        INNER JOIN jobs j ON jrc.job_id = j.id
        INNER JOIN companies ON j.job_employer_company_serial = companies.id
    WHERE
        jrc.user_id = p_user_id
        AND jrc.is_active
    ORDER BY
        jrc.match_score DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION public.generate_job_recommendations(p_user_id integer, p_limit integer) OWNER TO postgres;

--
-- TOC entry 338 (class 1255 OID 761629)
-- Name: get_all_jobs_with_skills(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_jobs_with_skills() RETURNS TABLE(id integer, job_title character varying, job_details character varying, job_is_draft boolean, job_last_updated character varying, job_last_updated_condition boolean, job_published_at character varying, job_tags character varying[], job_positions integer, job_salary integer, currency_name character varying, currency_abbreviation character varying, company_name character varying, registered_date character varying, industry character varying, location character varying, logo_url character varying, "companyLogo" character varying, email character varying, about text, country_name character varying, country_abbreviation character varying, job_location character varying, job_type character varying, job_type_id integer, job_remote_option_name character varying, job_experience_level character varying, job_experience_level_id integer, job_required_skills text[])
    LANGUAGE sql STABLE
    AS $$
    SELECT
        jobs.id,
        jobs.job_title,
        jobs.job_details,
        jobs.job_is_draft,
        jobs.job_last_updated,
        jobs.job_last_updated_condition,
        jobs.job_published_at,
        jobs.job_tags,
        jobs.job_positions,
        jobs.job_salary,
        curr.currency_name,
        curr.currency_abbreviation,
        companies.company_name,
        companies.registered_date,
        companies.industry,
        companies.location,
        companies.logo_url,
        COALESCE(companies.logo_url, companies.profile_image) AS "companyLogo",
        companies.email,
        companies.about,
        cou.country_name,
        cou.country_abbreviation,
        jobs.job_location,
        job_types.job_type_name,
        job_types.id AS id1,
        job_remote_options.job_remote_option_name,
        job_experience_level.job_level,
        job_experience_level.id AS job_experience_level_id,
        COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), ARRAY[]::TEXT[]) AS job_required_skills
    FROM
        jobs
        INNER JOIN currencies curr ON jobs.job_currency_id = curr.id
        INNER JOIN countries cou ON jobs.job_employer_country_serial = cou.id
        INNER JOIN companies ON jobs.job_employer_company_serial = companies.id
        LEFT JOIN job_skills js ON js.job_id = jobs.id
        LEFT JOIN skills s ON s.id = js.skill_id
        INNER JOIN jobs_job_type_mapping ON jobs_job_type_mapping.job_id = jobs.id
        INNER JOIN job_types ON jobs_job_type_mapping.job_type_id = job_types.id
        INNER JOIN jobs_job_remote_options_mapping ON jobs_job_remote_options_mapping.job_id = jobs.id
        INNER JOIN job_remote_options ON jobs_job_remote_options_mapping.job_remote_option_id = job_remote_options.id
        INNER JOIN jobs_job_experience_level_mapping ON jobs_job_experience_level_mapping.job_id = jobs.id
        INNER JOIN job_experience_level ON jobs_job_experience_level_mapping.job_experience_level = job_experience_level.id
    GROUP BY
        jobs.id,
        curr.currency_name,
        curr.currency_abbreviation,
        companies.company_name,
        companies.registered_date,
        companies.industry,
        companies.location,
        companies.logo_url,
        companies.profile_image,
        companies.email,
        companies.about,
        cou.country_name,
        cou.country_abbreviation,
        job_types.job_type_name,
        job_types.id,
        job_remote_options.job_remote_option_name,
        job_experience_level.job_level,
        job_experience_level.id
    ORDER BY
        jobs.job_published_at DESC;
$$;


ALTER FUNCTION public.get_all_jobs_with_skills() OWNER TO postgres;

--
-- TOC entry 326 (class 1255 OID 728764)
-- Name: get_application_by_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_application_by_id(p_application_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'application', jsonb_build_object(
                'id', a.id,
                'job_id', a.job_id,
                'user_id', a.user_id,
                'cv_url', a.cv_url,
                'cover_letter_url', a.cover_letter_url,
                'status', a.status,
                'applied_at', a.applied_at,
                'employer_notes', a.employer_notes,
                'interview_date', a.interview_date
            ),
            'job', jsonb_build_object(
                'id', j.id,
                'job_title', j.job_title,
                'job_details', j.job_details,
                'job_location', j.job_location,
                'job_salary', j.job_salary,
                'job_published_at', j.job_published_at
            ),
            'company', jsonb_build_object(
                'company_name', c.company_name,
                'location', c.location,
                'industry', c.industry,
                'logo_url', c.logo_url
            ),
            'applicant', jsonb_build_object(
                'first_name', u.first_name,
                'last_name', u.surname,
                'email', u.email,
                'phone_number', u.phone_number,
                'title', u.title
            )
        )
    ) INTO v_result
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN companies c ON j.job_employer_company_serial = c.id
    JOIN users u ON a.user_id = u.id
    WHERE a.id = p_application_id;
    
    IF v_result IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Application not found'
        );
    END IF;
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error retrieving application: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.get_application_by_id(p_application_id integer) OWNER TO postgres;

--
-- TOC entry 335 (class 1255 OID 728766)
-- Name: get_job_applications(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_job_applications(p_job_id integer, p_limit integer DEFAULT 10, p_offset integer DEFAULT 0) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_result JSONB;
    v_total_count INTEGER;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO v_total_count
    FROM applications
    WHERE job_id = p_job_id;
    
    -- Get applications with pagination
    SELECT jsonb_build_object(
        'success', true,
        'data', jsonb_agg(
            jsonb_build_object(
                'id', a.id,
                'user_id', a.user_id,
                'first_name', u.first_name,
                'last_name', u.surname,
                'email', u.email,
                'title', u.title,
                'cv_url', a.cv_url,
                'cover_letter_url', a.cover_letter_url,
                'status', a.status,
                'applied_at', a.applied_at,
                'employer_notes', a.employer_notes,
                'interview_date', a.interview_date
            )
        ),
        'pagination', jsonb_build_object(
            'total', v_total_count,
            'limit', p_limit,
            'offset', p_offset,
            'has_more', (p_offset + p_limit) < v_total_count
        )
    ) INTO v_result
    FROM applications a
    JOIN users u ON a.user_id = u.id
    WHERE a.job_id = p_job_id
	GROUP BY a.applied_at
    ORDER BY a.applied_at DESC
	
    LIMIT p_limit OFFSET p_offset;
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error retrieving job applications: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.get_job_applications(p_job_id integer, p_limit integer, p_offset integer) OWNER TO postgres;

--
-- TOC entry 316 (class 1255 OID 728771)
-- Name: get_user_application_stats(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_application_stats(p_user_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'total_applications', COUNT(*),
            'pending_applications', COUNT(*) FILTER (WHERE status = 'Pending'),
            'under_review_applications', COUNT(*) FILTER (WHERE status = 'Under Review'),
            'interview_scheduled_applications', COUNT(*) FILTER (WHERE status = 'Interview Scheduled'),
            'accepted_applications', COUNT(*) FILTER (WHERE status = 'Accepted'),
            'rejected_applications', COUNT(*) FILTER (WHERE status = 'Rejected'),
            'withdrawn_applications', COUNT(*) FILTER (WHERE status = 'Withdrawn'),
            'success_rate', CASE 
                WHEN COUNT(*) > 0 THEN 
                    ROUND((COUNT(*) FILTER (WHERE status = 'Accepted')::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
                ELSE 0 
            END
        )
    ) INTO v_result
    FROM applications
    WHERE user_id = p_user_id;
    
    RETURN v_result;
END;
$$;


ALTER FUNCTION public.get_user_application_stats(p_user_id integer) OWNER TO postgres;

--
-- TOC entry 340 (class 1255 OID 761631)
-- Name: get_user_applications(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_applications(p_user_id integer, p_limit integer DEFAULT 10, p_offset integer DEFAULT 0) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_result JSONB;
    v_total_count INTEGER;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO v_total_count
    FROM applications
    WHERE user_id = p_user_id;
    
    -- Get applications with pagination
    SELECT jsonb_build_object(
        'success', true,
        'data', jsonb_agg(
            jsonb_build_object(
                'id', ap.id,
                'job_id', ap.job_id,
                'job_title', j.job_title,
                'company_name', c.company_name,
                'company_logo_url', COALESCE(c.logo_url, c.profile_image),
                'location', j.job_location,
                'status', ap.status,
                'applied_at', ap.applied_at,
                'interview_date', ap.interview_date,
                'job_salary', j.job_salary,
                'job_type_name', job_types.job_type_name
            )
        ),
        'pagination', jsonb_build_object(
            'total', v_total_count,
            'limit', p_limit,
            'offset', p_offset,
            'has_more', (p_offset + p_limit) < v_total_count
        )
    ) INTO v_result
    FROM
        applications ap
        INNER JOIN jobs j ON ap.job_id = j.id
        INNER JOIN companies c ON j.job_employer_company_serial = c.id
        INNER JOIN jobs_job_type_mapping ON jobs_job_type_mapping.job_id = j.id
        INNER JOIN job_types ON jobs_job_type_mapping.job_type_id = job_types.id
    WHERE
        ap.user_id = p_user_id
    GROUP BY
        ap.applied_at,
        j.job_salary,
        job_types.job_type_name
    ORDER BY
        ap.applied_at DESC
    LIMIT p_limit OFFSET p_offset;

    RETURN v_result;    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error retrieving user applications: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.get_user_applications(p_user_id integer, p_limit integer, p_offset integer) OWNER TO postgres;

--
-- TOC entry 315 (class 1255 OID 695933)
-- Name: get_user_data_as_json(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_data_as_json(username character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_type VARCHAR;
    v_result JSONB;
BEGIN
    -- get the user's type
    SELECT user_type INTO v_user_type
    FROM public.users
    WHERE user_name = username;

    -- Check if a user with the given username exists
    IF v_user_type IS NULL THEN
        RAISE EXCEPTION 'User with username % not found', username;
    END IF;

    -- Construct the JSON object dynamically based on user_type
    IF v_user_type = 'job_seeker' THEN
        SELECT jsonb_build_object(
			'id', users.id,
            'country_name', countries.country_name,
            'country_abbreviation', countries.country_abbreviation,
            'country_code', countries.country_code,
            'user_name', users.user_name,
			'email', users.email,
			'phone_number', users.phone_number,
			'first_name', users.first_name,
			'surname', users.surname,
			'other_names', users.other_names,
			'password_hash', users.password_hash,
			'user_type', users.user_type,
			'title', users.title
        ) INTO v_result
        FROM users Inner Join
          countries On users.country_id = countries.id
        WHERE users.user_name = username;
		
    ELSIF v_user_type = 'employer' THEN
        SELECT jsonb_build_object(
			'id', users.id,
            'country_name', countries.country_name,
            'country_abbreviation', countries.country_abbreviation,
            'country_code', countries.country_code,
            'user_name', users.user_name,
			'email', users.email,
			'phone_number', users.phone_number,
			'first_name', users.first_name,
			'surname', users.surname,
			'other_names', users.other_names,
			'password_hash', users.password_hash,
			'user_type', users.user_type,
			'company_name', companies.company_name,
			'registered_date', companies.registered_date,
    		'industry', companies.industry,
    		'location', companies.location,
    		'logo_url', companies.logo_url,
    		'email', companies.email,
    		'about', companies.about,
			'company_id', companies.id
			
        ) INTO v_result
        From
			users Inner Join
			countries On users.country_id = countries.id Inner Join
			user_company_mapping On user_company_mapping.user_id = users.id Inner Join
			companies On user_company_mapping.company_id = companies.id
		Where
			users.user_name = username;
    END IF;
    RETURN v_result;
END;
$$;


ALTER FUNCTION public.get_user_data_as_json(username character varying) OWNER TO postgres;

--
-- TOC entry 318 (class 1255 OID 737022)
-- Name: get_user_profile_complete(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_profile_complete(p_user_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user', jsonb_build_object(
            'id', u.id,
            'username', u.user_name,
            'email', u.email,
            'first_name', u.first_name,
            'surname', u.surname,
            'other_names', u.other_names,
            'title', u.title,
            'profile_image', COALESCE(u.profile_image, '/client_side/images/default-avatar.png'),
            'phone_number', u.phone_number
        ),
        'skills', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', s.id,
                    'name', s.name,
                    'category', s.category,
                    'proficiency_level', usp.proficiency_level,
                    'years_experience', usp.years_experience
                )
            ) FROM user_skill_proficiency usp
            JOIN skills s ON usp.skill_id = s.id
            WHERE usp.user_id = p_user_id), '[]'::jsonb
        ),
        'experience', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', ue.id,
                    'job_title', ue.job_title,
                    'company_name', ue.company_name,
                    'company_location', ue.company_location,
                    'start_date', ue.start_date,
                    'end_date', ue.end_date,
                    'is_current', ue.is_current,
                    'description', ue.description,
                    'skills_used', ue.skills_used
                ) ORDER BY ue.start_date DESC
            ) FROM user_experience ue
            WHERE ue.user_id = p_user_id), '[]'::jsonb
        ),
        'education', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', ued.id,
                    'institution_name', ued.institution_name,
                    'degree', ued.degree,
                    'field_of_study', ued.field_of_study,
                    'start_date', ued.start_date,
                    'end_date', ued.end_date,
                    'is_current', ued.is_current,
                    'grade', ued.grade,
                    'description', ued.description
                ) ORDER BY ued.start_date DESC
            ) FROM user_education ued
            WHERE ued.user_id = p_user_id), '[]'::jsonb
        )
    ) INTO v_result
    FROM users u
    WHERE u.id = p_user_id;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error retrieving user profile: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.get_user_profile_complete(p_user_id integer) OWNER TO postgres;

--
-- TOC entry 325 (class 1255 OID 736977)
-- Name: get_user_saved_jobs(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_saved_jobs(p_user_id integer, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0) RETURNS TABLE(id integer, job_title character varying, company_name character varying, location character varying, job_details character varying, job_salary integer, job_tags character varying[], job_type_name character varying, job_remote_option_name character varying, saved_at timestamp without time zone, match_score numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.job_title,
        c.company_name,
        c.location,
        j.job_details,
        j.job_salary,
        j.job_tags,
        jt.job_type_name,
        jro.job_remote_option_name,
        sj.saved_at,
        COALESCE(jrc.match_score, 0) as match_score
    FROM saved_jobs sj
    JOIN jobs j ON sj.job_id = j.id
    JOIN companies c ON j.job_employer_company_serial = c.id
    LEFT JOIN jobs_job_type_mapping jjtm ON j.id = jjtm.job_id
    LEFT JOIN job_types jt ON jjtm.job_type_id = jt.id
    LEFT JOIN jobs_job_remote_options_mapping jjrom ON j.id = jjrom.job_id
    LEFT JOIN job_remote_options jro ON jjrom.job_remote_option_id = jro.id
    LEFT JOIN job_recommendations_cache jrc ON (jrc.job_id = j.id AND jrc.user_id = p_user_id)
    WHERE sj.user_id = p_user_id
    AND j.job_is_draft = false
    ORDER BY sj.saved_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;


ALTER FUNCTION public.get_user_saved_jobs(p_user_id integer, p_limit integer, p_offset integer) OWNER TO postgres;

--
-- TOC entry 319 (class 1255 OID 728700)
-- Name: get_user_skills(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_skills(username_param character varying) RETURNS TABLE(skill_name character varying, skill_category character varying, skill_id integer, user_id integer, username character varying, is_active boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        skls.name AS skill_name,
        skls.category AS skill_category,
        skls.id AS skill_id,
        u.id AS user_id,
        u.user_name AS username,
        u.user_is_active AS is_active
    FROM
        skills skls
    INNER JOIN
        user_skill_proficiency ON user_skill_proficiency.skill_id = skls.id
    INNER JOIN
        users u ON user_skill_proficiency.user_id = u.id
    WHERE
        u.user_name = username_param;
END;
$$;


ALTER FUNCTION public.get_user_skills(username_param character varying) OWNER TO postgres;

--
-- TOC entry 312 (class 1255 OID 704206)
-- Name: insert_job_and_action_logs(integer, character varying, character varying, boolean, boolean, character varying, text[], integer, integer, integer, integer, integer, character varying, integer, character varying, integer, integer, integer, integer, integer, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_job_and_action_logs(user_id_data integer, job_title_data character varying, job_details_data character varying, job_is_draft_data boolean, job_is_updated_data boolean, job_published_at_time_data character varying, job_tags_data text[], job_positions_data integer, job_salary_data integer, job_currency_id_data integer, job_employer_country_serial_data integer, job_employer_company_serial_data integer, job_location_data character varying, job_published_by_user_id_data integer, job_application_deadline_data character varying, action_log_id_data integer, category_id_data integer, job_experience_level_id_data integer, job_type_id_data integer, job_remote_option_id_data integer, job_department_data character varying) RETURNS record
    LANGUAGE plpgsql
    AS $$
 
	DECLARE
	  job_record record;
	  jobs_table public.jobs;
	  user_role_id int;
	  action_logs_mapping_serial INT := 1;
	BEGIN
		-- Check if job_title already exists
		IF EXISTS (SELECT 1 FROM public.jobs WHERE job_title = job_title_data) THEN
			RAISE EXCEPTION 'Job title "%" already exists.', job_title_data;
		END IF;
		
	  -- Inserting into jobs listing table
	  INSERT INTO public.jobs (
		  job_title,
		  job_details,
		  job_is_draft,
		  job_last_updated,
		  job_last_updated_condition,
		  job_published_at,
		  job_tags,
		  job_positions,
		  job_salary,
		  job_currency_id,
		  job_employer_country_serial,
		  job_employer_company_serial,
		  job_location,
		  job_published_by_user_id,
		  job_application_deadline,
		  job_department
		  
	  ) SELECT 
		  job_title_data,
		  job_details_data,
		  job_is_draft_data,
		  job_published_at_time_data,
		  false,
		  job_published_at_time_data,
		  job_tags_data,
		  job_positions_data,
		  job_salary_data,
		  job_currency_id_data,
		  job_employer_country_serial_data,
		  job_employer_company_serial_data,
		  job_location_data,
		  job_published_by_user_id_data,
		  job_application_deadline_data,
		  job_department_data
	  
	  WHERE NOT EXISTS (
		SELECT job_title FROM public.jobs WHERE job_title = job_title_data
		)
	  RETURNING * INTO job_record;
	  
	   --Insert into action logs mapping table
		INSERT INTO logs.users_jobs_action_logs_mapping (
			user_id,
			action_log_id,
			action_log_time,
			job_id,
			employer_user_id
		) SELECT
			  1,
			  action_log_id_data,
			  job_published_at_time_data,
			  job_record.id,
			  user_id_data;
			  
		--Insert into job categories mapping table
		INSERT INTO public.job_categories_mapping (
			job_id,
			category_id
		) SELECT
			  job_record.id,
			  category_id_data;
			  
		--Insert into jobs job experience level mapping table
		INSERT INTO public.jobs_job_experience_level_mapping (
			job_id,
			job_experience_level
		) SELECT
			  job_record.id,
			  job_experience_level_id_data;
			  
		--Insert into jobs job type mapping table
		INSERT INTO public.jobs_job_type_mapping (
			job_id,
			job_type_id
		) SELECT
			  job_record.id,
			  job_type_id_data;
			  
		--Insert into jobs job remote options mapping table
		INSERT INTO public.jobs_job_remote_options_mapping (
			job_id,
			job_remote_option_id
		) SELECT
			  job_record.id,
			  job_remote_option_id_data;	  
		
	  RETURN job_record;
	END;
$$;


ALTER FUNCTION public.insert_job_and_action_logs(user_id_data integer, job_title_data character varying, job_details_data character varying, job_is_draft_data boolean, job_is_updated_data boolean, job_published_at_time_data character varying, job_tags_data text[], job_positions_data integer, job_salary_data integer, job_currency_id_data integer, job_employer_country_serial_data integer, job_employer_company_serial_data integer, job_location_data character varying, job_published_by_user_id_data integer, job_application_deadline_data character varying, action_log_id_data integer, category_id_data integer, job_experience_level_id_data integer, job_type_id_data integer, job_remote_option_id_data integer, job_department_data character varying) OWNER TO postgres;

--
-- TOC entry 310 (class 1255 OID 502355)
-- Name: insert_staff_and_roles(character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, integer, character varying, boolean, character varying, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_staff_and_roles(s_first_name character varying, s_middle_name character varying, s_last_name character varying, s_user_name character varying, s_identification_number character varying, s_nationality character varying, s_country_of_residence character varying, s_mobile_number character varying, s_email character varying, s_added_by_staff_id integer, s_created_on character varying, s_is_active boolean, s_password character varying, s_user_group_ids text[]) RETURNS record
    LANGUAGE plpgsql
    AS $$

	DECLARE
	  staff_record record;
	  user_role_id int;
	  roles_mapping_serial INT := 1;
	  staff_id_variable INTEGER;
	BEGIN
	  -- Insert into staff table
	  INSERT INTO public.staff(
		  		staff_first_name,
		  		staff_middle_name,
				staff_last_name,
				staff_user_name,
				staff_identification_number,
				staff_nationality,
				staff_country_of_residence,
				staff_mobile_number,
				staff_email,
				staff_added_by_staff_id,
				staff_created_on,
				staff_is_active,
				staff_password
	  ) SELECT 
		  	s_first_name,
			s_middle_name,
			s_last_name,
			s_user_name,
			s_identification_number,
			s_nationality,
			s_country_of_residence,
			s_mobile_number,
			s_email,
			s_added_by_staff_id,
			s_created_on,
			s_is_active,
			s_password
	  
	  WHERE NOT EXISTS (
		SELECT staff_user_name FROM public.staff WHERE staff_user_name = s_user_name
		)
	  RETURNING * INTO staff_record;
	  	  

	  -- Loop through roles array
		FOREACH user_role_id IN ARRAY s_user_group_ids LOOP
			INSERT INTO public.staff_roles_mapping (
				staff_roles_mapping_staff_id,
				staff_roles_mapping_role_id
			)
			SELECT
				(SELECT id FROM public.staff WHERE staff_user_name = s_user_name),
				user_role_id
			WHERE NOT EXISTS (
				SELECT 1 
				FROM public.staff_roles_mapping 
				WHERE staff_roles_mapping_staff_id = (SELECT id FROM public.staff WHERE staff_user_name = s_user_name) 
				  AND staff_roles_mapping_role_id = user_role_id
			);
		END LOOP;

	
	  RETURN staff_record;
	END;

$$;


ALTER FUNCTION public.insert_staff_and_roles(s_first_name character varying, s_middle_name character varying, s_last_name character varying, s_user_name character varying, s_identification_number character varying, s_nationality character varying, s_country_of_residence character varying, s_mobile_number character varying, s_email character varying, s_added_by_staff_id integer, s_created_on character varying, s_is_active boolean, s_password character varying, s_user_group_ids text[]) OWNER TO postgres;

--
-- TOC entry 309 (class 1255 OID 656314)
-- Name: insert_user(character varying, character varying, character varying, character varying, integer, public.user_type, character varying, character varying, boolean, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_user(u_first_name character varying, u_surname character varying, u_othernames character varying, u_user_name character varying, u_country_id integer, u_user_type public.user_type, u_email character varying, u_mobile_number character varying, u_is_active boolean, u_password character varying) RETURNS record
    LANGUAGE plpgsql
    AS $$

	DECLARE
	  user_record record;
	BEGIN
	  --Check if the username exists
	  	IF EXISTS (SELECT 1 FROM public.users WHERE user_name = u_user_name) THEN
			RAISE EXCEPTION 'Username "%" is already taken. Please choose a different username.', u_user_name;
		END IF;
	  -- Insert into users table
	  INSERT INTO public.users(
		  user_name,
		  email,
		  phone_number,
		  password_hash,
		  user_type,
		  country_id,
		  first_name,
		  surname,
		  other_names,
		  user_is_active 
	  ) SELECT 
		  	u_user_name,
			u_email,
			u_mobile_number,
			u_password,
			u_user_type,
			u_country_id,
			u_first_name,
			u_surname,
			u_othernames,
			u_is_active
	  
	  WHERE NOT EXISTS (
		SELECT user_name FROM public.users WHERE user_name = u_user_name
		)
	  RETURNING * INTO user_record;
	  RETURN user_record;
	END;

$$;


ALTER FUNCTION public.insert_user(u_first_name character varying, u_surname character varying, u_othernames character varying, u_user_name character varying, u_country_id integer, u_user_type public.user_type, u_email character varying, u_mobile_number character varying, u_is_active boolean, u_password character varying) OWNER TO postgres;

--
-- TOC entry 323 (class 1255 OID 736975)
-- Name: is_job_saved(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_job_saved(p_user_id integer, p_job_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM saved_jobs 
        WHERE user_id = p_user_id AND job_id = p_job_id
    );
END;
$$;


ALTER FUNCTION public.is_job_saved(p_user_id integer, p_job_id integer) OWNER TO postgres;

--
-- TOC entry 332 (class 1255 OID 728768)
-- Name: is_valid_status_transition(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_valid_status_transition(p_old_status character varying, p_new_status character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Define valid status transitions
    CASE p_old_status
        WHEN 'Pending' THEN
            RETURN p_new_status IN ('Under Review', 'Rejected', 'Withdrawn');
        WHEN 'Under Review' THEN
            RETURN p_new_status IN ('Interview Scheduled', 'Rejected', 'Withdrawn');
        WHEN 'Interview Scheduled' THEN
            RETURN p_new_status IN ('Accepted', 'Rejected', 'Withdrawn');
        WHEN 'Accepted' THEN
            RETURN p_new_status IN ('Withdrawn'); -- Can only withdraw after acceptance
        WHEN 'Rejected' THEN
            RETURN p_new_status IN ('Withdrawn'); -- Can only withdraw after rejection
        WHEN 'Withdrawn' THEN
            RETURN FALSE; -- Cannot change status after withdrawal
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;


ALTER FUNCTION public.is_valid_status_transition(p_old_status character varying, p_new_status character varying) OWNER TO postgres;

--
-- TOC entry 337 (class 1255 OID 737024)
-- Name: remove_user_skill(integer, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.remove_user_skill(p_user_id integer, p_skill_name character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_skill_id INTEGER;
BEGIN
    -- Get skill ID
    SELECT id INTO v_skill_id FROM skills WHERE LOWER(name) = LOWER(p_skill_name);
    
    IF v_skill_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Skill not found'
        );
    END IF;
    
    -- Remove skill from user profile
    DELETE FROM user_skill_proficiency 
    WHERE user_id = p_user_id AND skill_id = v_skill_id;
    
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Skill removed successfully'
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Skill not found in your profile'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error removing skill: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.remove_user_skill(p_user_id integer, p_skill_name character varying) OWNER TO postgres;

--
-- TOC entry 324 (class 1255 OID 736976)
-- Name: toggle_saved_job(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.toggle_saved_job(p_user_id integer, p_job_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_exists BOOLEAN;
    v_action TEXT;
BEGIN
    -- Check if the job is already saved
    SELECT EXISTS(SELECT 1 FROM saved_jobs WHERE user_id = p_user_id AND job_id = p_job_id) INTO v_exists;
    
    IF v_exists THEN
        -- Remove from saved jobs
        DELETE FROM saved_jobs WHERE user_id = p_user_id AND job_id = p_job_id;
        v_action := 'removed';
    ELSE
        -- Add to saved jobs
        INSERT INTO saved_jobs (user_id, job_id) VALUES (p_user_id, p_job_id);
        v_action := 'saved';
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'action', v_action,
        'message', CASE 
            WHEN v_action = 'saved' THEN 'Job saved successfully!'
            ELSE 'Job removed from saved list!'
        END
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.toggle_saved_job(p_user_id integer, p_job_id integer) OWNER TO postgres;

--
-- TOC entry 333 (class 1255 OID 728767)
-- Name: update_application_status(integer, character varying, integer, text, timestamp without time zone, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_application_status(p_application_id integer, p_new_status character varying, p_changed_by integer, p_change_reason text DEFAULT NULL::text, p_interview_date timestamp without time zone DEFAULT NULL::timestamp without time zone, p_employer_notes text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_old_status VARCHAR(50);
    v_result JSONB;
BEGIN
    -- Get current status
    SELECT status INTO v_old_status
    FROM applications
    WHERE id = p_application_id;
    
    IF v_old_status IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Application not found'
        );
    END IF;
    
    -- Validate status transition
    IF NOT is_valid_status_transition(v_old_status, p_new_status) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid status transition from ' || v_old_status || ' to ' || p_new_status
        );
    END IF;
    
    -- Update application
    UPDATE applications 
    SET 
        status = p_new_status,
        updated_at = CURRENT_TIMESTAMP,
        interview_date = COALESCE(p_interview_date, interview_date),
        employer_notes = COALESCE(p_employer_notes, employer_notes)
    WHERE id = p_application_id;
    
    -- Record status change
    INSERT INTO application_status_history (
        application_id, 
        old_status, 
        new_status, 
        changed_by, 
        change_reason
    ) VALUES (
        p_application_id, 
        v_old_status, 
        p_new_status, 
        p_changed_by, 
        p_change_reason
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Application status updated successfully',
        'old_status', v_old_status,
        'new_status', p_new_status,
        'updated_at', CURRENT_TIMESTAMP
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error updating application status: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.update_application_status(p_application_id integer, p_new_status character varying, p_changed_by integer, p_change_reason text, p_interview_date timestamp without time zone, p_employer_notes text) OWNER TO postgres;

--
-- TOC entry 322 (class 1255 OID 736926)
-- Name: update_interviews_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_interviews_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_interviews_updated_at() OWNER TO postgres;

--
-- TOC entry 317 (class 1255 OID 737020)
-- Name: update_user_education(integer, integer, character varying, character varying, character varying, date, date, boolean, character varying, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_education(p_education_id integer, p_user_id integer, p_institution_name character varying, p_degree character varying, p_field_of_study character varying, p_start_date date, p_end_date date, p_is_current boolean, p_grade character varying, p_description text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE public.user_education SET
        institution_name = p_institution_name,
        degree = p_degree,
        field_of_study = p_field_of_study,
        start_date = p_start_date,
        end_date = p_end_date,
        is_current = p_is_current,
        grade = p_grade,
        description = p_description,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_education_id AND user_id = p_user_id;
    
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Education updated successfully'
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Education not found or unauthorized'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error updating education: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.update_user_education(p_education_id integer, p_user_id integer, p_institution_name character varying, p_degree character varying, p_field_of_study character varying, p_start_date date, p_end_date date, p_is_current boolean, p_grade character varying, p_description text) OWNER TO postgres;

--
-- TOC entry 328 (class 1255 OID 737017)
-- Name: update_user_experience(integer, integer, character varying, character varying, character varying, date, date, boolean, text, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_experience(p_experience_id integer, p_user_id integer, p_job_title character varying, p_company_name character varying, p_company_location character varying, p_start_date date, p_end_date date, p_is_current boolean, p_description text, p_skills_used text[]) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE public.user_experience SET
        job_title = p_job_title,
        company_name = p_company_name,
        company_location = p_company_location,
        start_date = p_start_date,
        end_date = p_end_date,
        is_current = p_is_current,
        description = p_description,
        skills_used = p_skills_used,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_experience_id AND user_id = p_user_id;
    
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Experience updated successfully'
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Experience not found or unauthorized'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error updating experience: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.update_user_experience(p_experience_id integer, p_user_id integer, p_job_title character varying, p_company_name character varying, p_company_location character varying, p_start_date date, p_end_date date, p_is_current boolean, p_description text, p_skills_used text[]) OWNER TO postgres;

--
-- TOC entry 313 (class 1255 OID 720771)
-- Name: update_user_preferences_from_interactions(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_preferences_from_interactions(p_user_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update user profile analytics based on interactions
    INSERT INTO user_profile_analytics (user_id, skill_match_preference, location_preference_weight, salary_preference_weight)
    SELECT 
        p_user_id,
        AVG(CASE WHEN uji.interaction_type IN ('apply', 'like') THEN 1.0 ELSE 0.0 END) as skill_match_preference,
        AVG(CASE WHEN uji.interaction_type IN ('apply', 'like') THEN 1.0 ELSE 0.0 END) as location_preference_weight,
        AVG(CASE WHEN uji.interaction_type IN ('apply', 'like') THEN 1.0 ELSE 0.0 END) as salary_preference_weight
    FROM user_job_interactions uji
    WHERE uji.user_id = p_user_id
    ON CONFLICT (user_id) DO UPDATE SET
        skill_match_preference = EXCLUDED.skill_match_preference,
        location_preference_weight = EXCLUDED.location_preference_weight,
        salary_preference_weight = EXCLUDED.salary_preference_weight,
        last_updated = CURRENT_TIMESTAMP;
END;
$$;


ALTER FUNCTION public.update_user_preferences_from_interactions(p_user_id integer) OWNER TO postgres;

--
-- TOC entry 334 (class 1255 OID 728769)
-- Name: withdraw_application(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.withdraw_application(p_application_id integer, p_user_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_current_status VARCHAR(50);
    v_result JSONB;
BEGIN
    -- Get current application status
    SELECT status INTO v_current_status
    FROM applications
    WHERE id = p_application_id AND user_id = p_user_id;
    
    IF v_current_status IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Application not found or access denied'
        );
    END IF;
    
    -- Check if application can be withdrawn
    IF v_current_status IN ('Accepted', 'Rejected') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Cannot withdraw application with status: ' || v_current_status
        );
    END IF;
    
    -- Update status to withdrawn
    UPDATE applications 
    SET 
        status = 'Withdrawn',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_application_id;
    
    -- Record status change
    INSERT INTO application_status_history (
        application_id, 
        old_status, 
        new_status, 
        changed_by, 
        change_reason
    ) VALUES (
        p_application_id, 
        v_current_status, 
        'Withdrawn', 
        p_user_id, 
        'Application withdrawn by applicant'
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Application withdrawn successfully',
        'old_status', v_current_status,
        'new_status', 'Withdrawn'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error withdrawing application: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.withdraw_application(p_application_id integer, p_user_id integer) OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 562578)
-- Name: action_logs_serial_no_seq; Type: SEQUENCE; Schema: logs; Owner: postgres
--

CREATE SEQUENCE logs.action_logs_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE logs.action_logs_serial_no_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 562557)
-- Name: action_logs; Type: TABLE; Schema: logs; Owner: postgres
--

CREATE TABLE logs.action_logs (
    id integer DEFAULT nextval('logs.action_logs_serial_no_seq'::regclass) NOT NULL,
    action_name character varying NOT NULL
);


ALTER TABLE logs.action_logs OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 562579)
-- Name: users_action_logs_mapping_serial_no_seq; Type: SEQUENCE; Schema: logs; Owner: postgres
--

CREATE SEQUENCE logs.users_action_logs_mapping_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE logs.users_action_logs_mapping_serial_no_seq OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 562573)
-- Name: users_jobs_action_logs_mapping; Type: TABLE; Schema: logs; Owner: postgres
--

CREATE TABLE logs.users_jobs_action_logs_mapping (
    id integer DEFAULT nextval('logs.users_action_logs_mapping_serial_no_seq'::regclass) NOT NULL,
    user_id integer,
    action_log_id integer NOT NULL,
    action_log_time character varying(50) NOT NULL,
    job_id integer NOT NULL,
    employer_user_id integer
);


ALTER TABLE logs.users_jobs_action_logs_mapping OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 720725)
-- Name: ai_model_performance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_model_performance (
    id integer NOT NULL,
    model_version character varying(20) NOT NULL,
    metric_name character varying(100) NOT NULL,
    metric_value numeric(10,4) NOT NULL,
    sample_size integer DEFAULT 0,
    confidence_interval numeric(5,2),
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ai_model_performance OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 720724)
-- Name: ai_model_performance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_model_performance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_model_performance_id_seq OWNER TO postgres;

--
-- TOC entry 5444 (class 0 OID 0)
-- Dependencies: 273
-- Name: ai_model_performance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_model_performance_id_seq OWNED BY public.ai_model_performance.id;


--
-- TOC entry 281 (class 1259 OID 728742)
-- Name: application_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_status_history (
    id integer NOT NULL,
    application_id integer NOT NULL,
    old_status character varying(50),
    new_status character varying(50) NOT NULL,
    changed_by integer,
    change_reason text,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.application_status_history OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 728741)
-- Name: application_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_status_history_id_seq OWNER TO postgres;

--
-- TOC entry 5445 (class 0 OID 0)
-- Dependencies: 280
-- Name: application_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_status_history_id_seq OWNED BY public.application_status_history.id;


--
-- TOC entry 279 (class 1259 OID 728712)
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    job_id integer NOT NULL,
    user_id integer NOT NULL,
    cv_url text,
    cover_letter_url text,
    status character varying(50) DEFAULT 'Pending'::character varying,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    employer_notes text,
    interview_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT applications_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Under Review'::character varying, 'Interview Scheduled'::character varying, 'Accepted'::character varying, 'Rejected'::character varying, 'Withdrawn'::character varying])::text[])))
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 728711)
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO postgres;

--
-- TOC entry 5446 (class 0 OID 0)
-- Dependencies: 278
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- TOC entry 221 (class 1259 OID 502331)
-- Name: clients_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_serial_no_seq OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 502305)
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id integer DEFAULT nextval('public.clients_serial_no_seq'::regclass) NOT NULL,
    client_username character varying(10) NOT NULL,
    client_first_name character varying(20) NOT NULL,
    client_second_name character varying(20) NOT NULL,
    client_third_name character varying(20) NOT NULL,
    client_country_of_residence character varying(20) NOT NULL,
    client_mobile_number character varying(15) NOT NULL,
    client_email character varying(50) NOT NULL,
    client_date_of_birth character varying(20) NOT NULL,
    client_about character varying(10000)
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 695911)
-- Name: companies_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_serial_no_seq OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 695906)
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer DEFAULT nextval('public.companies_serial_no_seq'::regclass) NOT NULL,
    company_name character varying(50) NOT NULL,
    registered_date character varying(50) NOT NULL,
    industry character varying(50),
    location character varying(100),
    logo_url character varying(500),
    email character varying(50),
    about character varying(1000),
    profile_image character varying(500) DEFAULT '/client_side/images/default-company-logo.png'::character varying,
    updated_at time with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 654706)
-- Name: country_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.country_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.country_serial_no_seq OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 654701)
-- Name: countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.countries (
    id integer DEFAULT nextval('public.country_serial_no_seq'::regclass) NOT NULL,
    country_name character varying(60) NOT NULL,
    country_abbreviation character varying(5) NOT NULL,
    country_code character varying(5)
);


ALTER TABLE public.countries OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 654694)
-- Name: currencies_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.currencies_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.currencies_serial_no_seq OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 654687)
-- Name: currencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currencies (
    id integer DEFAULT nextval('public.currencies_serial_no_seq'::regclass) NOT NULL,
    currency_name character varying(30),
    currency_abbreviation character varying
);


ALTER TABLE public.currencies OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 712297)
-- Name: employee_user_skills_mapping_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_user_skills_mapping_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_user_skills_mapping_serial_no_seq OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 712290)
-- Name: employee_user_skills_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_user_skills_mapping (
    id integer DEFAULT nextval('public.employee_user_skills_mapping_serial_no_seq'::regclass) NOT NULL,
    employee_id integer NOT NULL,
    employee_skills character varying(50000)[]
);


ALTER TABLE public.employee_user_skills_mapping OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 736929)
-- Name: interview_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_history (
    id integer NOT NULL,
    interview_id integer NOT NULL,
    old_date timestamp without time zone,
    new_date timestamp without time zone,
    old_status character varying(50),
    new_status character varying(50),
    change_reason text,
    changed_by integer NOT NULL,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.interview_history OWNER TO postgres;

--
-- TOC entry 5447 (class 0 OID 0)
-- Dependencies: 290
-- Name: TABLE interview_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.interview_history IS 'Tracks changes to interview scheduling and status';


--
-- TOC entry 289 (class 1259 OID 736928)
-- Name: interview_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interview_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interview_history_id_seq OWNER TO postgres;

--
-- TOC entry 5448 (class 0 OID 0)
-- Dependencies: 289
-- Name: interview_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interview_history_id_seq OWNED BY public.interview_history.id;


--
-- TOC entry 288 (class 1259 OID 736897)
-- Name: interviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviews (
    id integer NOT NULL,
    application_id integer NOT NULL,
    interview_date timestamp without time zone NOT NULL,
    interview_type character varying(50) DEFAULT 'In-Person'::character varying,
    interview_status character varying(50) DEFAULT 'Scheduled'::character varying,
    interview_location text,
    interview_notes text,
    interviewer_notes text,
    candidate_feedback text,
    interview_duration integer,
    meeting_link text,
    scheduled_by integer NOT NULL,
    scheduled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT interviews_interview_status_check CHECK (((interview_status)::text = ANY ((ARRAY['Scheduled'::character varying, 'Completed'::character varying, 'Cancelled'::character varying, 'Rescheduled'::character varying, 'No Show'::character varying])::text[]))),
    CONSTRAINT interviews_interview_type_check CHECK (((interview_type)::text = ANY ((ARRAY['In-Person'::character varying, 'Video Call'::character varying, 'Phone Call'::character varying, 'Panel Interview'::character varying])::text[])))
);


ALTER TABLE public.interviews OWNER TO postgres;

--
-- TOC entry 5449 (class 0 OID 0)
-- Dependencies: 288
-- Name: TABLE interviews; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.interviews IS 'Stores interview scheduling and management data';


--
-- TOC entry 5450 (class 0 OID 0)
-- Dependencies: 288
-- Name: COLUMN interviews.interview_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.interviews.interview_type IS 'Type of interview: In-Person, Video Call, Phone Call, Panel Interview';


--
-- TOC entry 5451 (class 0 OID 0)
-- Dependencies: 288
-- Name: COLUMN interviews.interview_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.interviews.interview_status IS 'Current status of the interview';


--
-- TOC entry 5452 (class 0 OID 0)
-- Dependencies: 288
-- Name: COLUMN interviews.interview_duration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.interviews.interview_duration IS 'Planned or actual duration in minutes';


--
-- TOC entry 5453 (class 0 OID 0)
-- Dependencies: 288
-- Name: COLUMN interviews.meeting_link; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.interviews.meeting_link IS 'Video call link for remote interviews';


--
-- TOC entry 287 (class 1259 OID 736896)
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interviews_id_seq OWNER TO postgres;

--
-- TOC entry 5454 (class 0 OID 0)
-- Dependencies: 287
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- TOC entry 231 (class 1259 OID 562649)
-- Name: job_categories_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_categories_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_categories_serial_no_seq OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 562644)
-- Name: job_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_categories (
    id integer DEFAULT nextval('public.job_categories_serial_no_seq'::regclass) NOT NULL,
    job_category_name character varying(50) NOT NULL,
    job_icon_css_class character varying(50)
);


ALTER TABLE public.job_categories OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 562656)
-- Name: job_categories_mapping_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_categories_mapping_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_categories_mapping_serial_no_seq OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 562651)
-- Name: job_categories_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_categories_mapping (
    id integer DEFAULT nextval('public.job_categories_mapping_serial_no_seq'::regclass) NOT NULL,
    job_id integer NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE public.job_categories_mapping OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 704137)
-- Name: job_level_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_level_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_level_serial_no_seq OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 704132)
-- Name: job_experience_level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_experience_level (
    id integer DEFAULT nextval('public.job_level_serial_no_seq'::regclass) NOT NULL,
    job_level character varying(35) NOT NULL
);


ALTER TABLE public.job_experience_level OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 704161)
-- Name: job_experience_level_mapping_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_experience_level_mapping_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_experience_level_mapping_serial_no_seq OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 704144)
-- Name: job_level_mapping_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_level_mapping_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_level_mapping_serial_no_seq OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 720649)
-- Name: job_recommendations_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_recommendations_cache (
    id integer NOT NULL,
    user_id integer,
    job_id integer,
    match_score numeric(5,2) NOT NULL,
    recommendation_reason text,
    algorithm_version character varying(20) DEFAULT 'v1.0'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '24:00:00'::interval)
);


ALTER TABLE public.job_recommendations_cache OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 720648)
-- Name: job_recommendations_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_recommendations_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_recommendations_cache_id_seq OWNER TO postgres;

--
-- TOC entry 5455 (class 0 OID 0)
-- Dependencies: 267
-- Name: job_recommendations_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_recommendations_cache_id_seq OWNED BY public.job_recommendations_cache.id;


--
-- TOC entry 254 (class 1259 OID 704178)
-- Name: job_remote_options_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_remote_options_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_remote_options_serial_no_seq OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 704173)
-- Name: job_remote_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_remote_options (
    id integer DEFAULT nextval('public.job_remote_options_serial_no_seq'::regclass) NOT NULL,
    job_remote_option_name character varying(50) NOT NULL
);


ALTER TABLE public.job_remote_options OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 720702)
-- Name: job_skill_requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_skill_requirements (
    id integer NOT NULL,
    job_id integer,
    skill_id integer,
    importance_level integer,
    required_years_experience numeric(3,1) DEFAULT 0.0,
    is_mandatory boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT job_skill_requirements_importance_level_check CHECK (((importance_level >= 1) AND (importance_level <= 5)))
);


ALTER TABLE public.job_skill_requirements OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 720701)
-- Name: job_skill_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_skill_requirements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_skill_requirements_id_seq OWNER TO postgres;

--
-- TOC entry 5456 (class 0 OID 0)
-- Dependencies: 271
-- Name: job_skill_requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_skill_requirements_id_seq OWNED BY public.job_skill_requirements.id;


--
-- TOC entry 277 (class 1259 OID 728684)
-- Name: job_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_skills (
    job_id integer NOT NULL,
    skill_id integer NOT NULL
);


ALTER TABLE public.job_skills OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 704130)
-- Name: job_type_mapping_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_type_mapping_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_type_mapping_serial_no_seq OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 704113)
-- Name: job_type_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_type_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_type_serial_no_seq OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 704108)
-- Name: job_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_types (
    id integer DEFAULT nextval('public.job_type_serial_no_seq'::regclass) NOT NULL,
    job_type_name character varying(50) NOT NULL
);


ALTER TABLE public.job_types OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 502333)
-- Name: jobs_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_serial_no_seq OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 502312)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id integer DEFAULT nextval('public.jobs_serial_no_seq'::regclass) NOT NULL,
    job_title character varying NOT NULL,
    job_details character varying(100000) NOT NULL,
    job_is_draft boolean DEFAULT true NOT NULL,
    job_last_updated character varying(50) NOT NULL,
    job_last_updated_condition boolean DEFAULT false NOT NULL,
    job_published_at character varying(50) NOT NULL,
    job_tags character varying(1000)[],
    job_positions integer NOT NULL,
    job_salary integer NOT NULL,
    job_currency_id integer NOT NULL,
    job_employer_country_serial integer NOT NULL,
    job_employer_company_serial integer NOT NULL,
    job_location character varying(200) NOT NULL,
    job_published_by_user_id integer NOT NULL,
    job_application_deadline character varying(100),
    job_department character varying(100)
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 704156)
-- Name: jobs_job_experience_level_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs_job_experience_level_mapping (
    id integer DEFAULT nextval('public.job_experience_level_mapping_serial_no_seq'::regclass) NOT NULL,
    job_id integer NOT NULL,
    job_experience_level integer NOT NULL
);


ALTER TABLE public.jobs_job_experience_level_mapping OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 704185)
-- Name: jobs_job_remote_options_mapping_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_job_remote_options_mapping_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_job_remote_options_mapping_serial_no_seq OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 704180)
-- Name: jobs_job_remote_options_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs_job_remote_options_mapping (
    id integer DEFAULT nextval('public.jobs_job_remote_options_mapping_serial_no_seq'::regclass) NOT NULL,
    job_id integer NOT NULL,
    job_remote_option_id integer NOT NULL
);


ALTER TABLE public.jobs_job_remote_options_mapping OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 704115)
-- Name: jobs_job_type_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs_job_type_mapping (
    id integer DEFAULT nextval('public.job_type_mapping_serial_no_seq'::regclass) NOT NULL,
    job_id integer NOT NULL,
    job_type_id integer NOT NULL
);


ALTER TABLE public.jobs_job_type_mapping OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 720576)
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matches (
    id integer NOT NULL,
    job_seeker_user_id integer,
    job_listing_id integer,
    score double precision,
    feedback integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.matches OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 720575)
-- Name: matches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.matches_id_seq OWNER TO postgres;

--
-- TOC entry 5457 (class 0 OID 0)
-- Dependencies: 259
-- Name: matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matches_id_seq OWNED BY public.matches.id;


--
-- TOC entry 264 (class 1259 OID 720613)
-- Name: matching_algorithm_params; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matching_algorithm_params (
    id integer NOT NULL,
    param_name character varying(100) NOT NULL,
    param_value numeric(5,2) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.matching_algorithm_params OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 720612)
-- Name: matching_algorithm_params_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matching_algorithm_params_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.matching_algorithm_params_id_seq OWNER TO postgres;

--
-- TOC entry 5458 (class 0 OID 0)
-- Dependencies: 263
-- Name: matching_algorithm_params_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matching_algorithm_params_id_seq OWNED BY public.matching_algorithm_params.id;


--
-- TOC entry 286 (class 1259 OID 736880)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    user_role character varying(20) NOT NULL,
    type character varying(30) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    source_key integer NOT NULL,
    application_id integer,
    job_id integer,
    is_read boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 736879)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5459 (class 0 OID 0)
-- Dependencies: 285
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 223 (class 1259 OID 502335)
-- Name: roles_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_serial_no_seq OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 502321)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer DEFAULT nextval('public.roles_serial_no_seq'::regclass) NOT NULL,
    role_name character varying(20) NOT NULL,
    role_description character varying(300) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 736952)
-- Name: saved_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_jobs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    job_id integer NOT NULL,
    saved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.saved_jobs OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 736951)
-- Name: saved_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_jobs_id_seq OWNER TO postgres;

--
-- TOC entry 5460 (class 0 OID 0)
-- Dependencies: 291
-- Name: saved_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_jobs_id_seq OWNED BY public.saved_jobs.id;


--
-- TOC entry 270 (class 1259 OID 720693)
-- Name: skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(100),
    created_at timestamp with time zone
);


ALTER TABLE public.skills OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 720692)
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_id_seq OWNER TO postgres;

--
-- TOC entry 5461 (class 0 OID 0)
-- Dependencies: 269
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- TOC entry 224 (class 1259 OID 502337)
-- Name: staff_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_serial_no_seq OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 502300)
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id integer DEFAULT nextval('public.staff_serial_no_seq'::regclass) NOT NULL,
    staff_first_name character varying(50) NOT NULL,
    staff_middle_name character varying(50) NOT NULL,
    staff_last_name character varying(50) NOT NULL,
    staff_user_name character varying(20) NOT NULL,
    staff_identification_number character varying(30) NOT NULL,
    staff_nationality character varying(20) NOT NULL,
    staff_country_of_residence character varying(20) NOT NULL,
    staff_mobile_number character varying(15) NOT NULL,
    staff_email character varying(50) NOT NULL,
    staff_added_by_staff_id integer NOT NULL,
    staff_created_on character varying(50),
    staff_is_active boolean DEFAULT true,
    staff_password character varying(100)
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 502339)
-- Name: staff_roles_mapping_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_roles_mapping_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_roles_mapping_serial_no_seq OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 502326)
-- Name: staff_roles_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_roles_mapping (
    id integer DEFAULT nextval('public.staff_roles_mapping_serial_no_seq'::regclass) NOT NULL,
    staff_roles_mapping_staff_id integer NOT NULL,
    staff_roles_mapping_role_id integer NOT NULL
);


ALTER TABLE public.staff_roles_mapping OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 695918)
-- Name: user_company_serial_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_company_serial_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_company_serial_no_seq OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 695913)
-- Name: user_company_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_company_mapping (
    id integer DEFAULT nextval('public.user_company_serial_no_seq'::regclass) NOT NULL,
    company_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.user_company_mapping OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 736998)
-- Name: user_education; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_education (
    id integer NOT NULL,
    user_id integer NOT NULL,
    institution_name character varying(200) NOT NULL,
    degree character varying(200) NOT NULL,
    field_of_study character varying(200),
    start_date date NOT NULL,
    end_date date,
    is_current boolean DEFAULT false,
    grade character varying(50),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_education OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 736997)
-- Name: user_education_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_education_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_education_id_seq OWNER TO postgres;

--
-- TOC entry 5462 (class 0 OID 0)
-- Dependencies: 295
-- Name: user_education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_education_id_seq OWNED BY public.user_education.id;


--
-- TOC entry 294 (class 1259 OID 736981)
-- Name: user_experience; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_experience (
    id integer NOT NULL,
    user_id integer NOT NULL,
    job_title character varying(200) NOT NULL,
    company_name character varying(200) NOT NULL,
    company_location character varying(200),
    start_date date NOT NULL,
    end_date date,
    is_current boolean DEFAULT false,
    description text,
    skills_used text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_experience OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 736980)
-- Name: user_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_experience_id_seq OWNER TO postgres;

--
-- TOC entry 5463 (class 0 OID 0)
-- Dependencies: 293
-- Name: user_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_experience_id_seq OWNED BY public.user_experience.id;


--
-- TOC entry 266 (class 1259 OID 720627)
-- Name: user_job_interactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_job_interactions (
    id integer NOT NULL,
    user_id integer,
    job_id integer,
    interaction_type character varying(20) NOT NULL,
    interaction_score numeric(3,2) DEFAULT 0.00,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_job_interactions_interaction_type_check CHECK (((interaction_type)::text = ANY ((ARRAY['view'::character varying, 'apply'::character varying, 'save'::character varying, 'ignore'::character varying, 'like'::character varying])::text[])))
);


ALTER TABLE public.user_job_interactions OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 720626)
-- Name: user_job_interactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_job_interactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_job_interactions_id_seq OWNER TO postgres;

--
-- TOC entry 5464 (class 0 OID 0)
-- Dependencies: 265
-- Name: user_job_interactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_job_interactions_id_seq OWNED BY public.user_job_interactions.id;


--
-- TOC entry 284 (class 1259 OID 736867)
-- Name: user_notification_state; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notification_state (
    id integer NOT NULL,
    user_id integer NOT NULL,
    source_type character varying(30) NOT NULL,
    source_id integer NOT NULL,
    is_read boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_notification_state OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 736866)
-- Name: user_notification_state_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_notification_state_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_notification_state_id_seq OWNER TO postgres;

--
-- TOC entry 5465 (class 0 OID 0)
-- Dependencies: 283
-- Name: user_notification_state_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_notification_state_id_seq OWNED BY public.user_notification_state.id;


--
-- TOC entry 262 (class 1259 OID 720594)
-- Name: user_profile_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile_analytics (
    id integer NOT NULL,
    user_id integer,
    profile_completeness_score numeric(5,2) DEFAULT 0.00,
    skill_match_preference numeric(5,2) DEFAULT 0.00,
    location_preference_weight numeric(5,2) DEFAULT 0.00,
    salary_preference_weight numeric(5,2) DEFAULT 0.00,
    experience_level_preference integer DEFAULT 0,
    remote_work_preference boolean DEFAULT false,
    industry_preference character varying(100),
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_profile_analytics OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 720593)
-- Name: user_profile_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_profile_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profile_analytics_id_seq OWNER TO postgres;

--
-- TOC entry 5466 (class 0 OID 0)
-- Dependencies: 261
-- Name: user_profile_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_profile_analytics_id_seq OWNED BY public.user_profile_analytics.id;


--
-- TOC entry 276 (class 1259 OID 720739)
-- Name: user_skill_proficiency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_skill_proficiency (
    id integer NOT NULL,
    user_id integer NOT NULL,
    skill_id integer NOT NULL,
    proficiency_level integer NOT NULL,
    years_experience numeric(3,1) DEFAULT 0.0,
    last_used_date date,
    confidence_score numeric(3,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_skill_proficiency_proficiency_level_check CHECK (((proficiency_level >= 1) AND (proficiency_level <= 5)))
);


ALTER TABLE public.user_skill_proficiency OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 720738)
-- Name: user_skill_proficiency_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_skill_proficiency_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_skill_proficiency_id_seq OWNER TO postgres;

--
-- TOC entry 5467 (class 0 OID 0)
-- Dependencies: 275
-- Name: user_skill_proficiency_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_skill_proficiency_id_seq OWNED BY public.user_skill_proficiency.id;


--
-- TOC entry 239 (class 1259 OID 655837)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    user_name character varying(20) NOT NULL,
    email character varying(255) NOT NULL,
    phone_number character varying(15) NOT NULL,
    password_hash character varying(255) NOT NULL,
    user_type public.user_type NOT NULL,
    country_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    first_name character varying(30) NOT NULL,
    surname character varying(30) NOT NULL,
    other_names character varying(30) NOT NULL,
    user_is_active boolean NOT NULL,
    title character varying(200),
    profile_image character varying(500) DEFAULT '/client_side/images/default-avatar.png'::character varying,
    updated_at time with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 655836)
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
-- TOC entry 5468 (class 0 OID 0)
-- Dependencies: 238
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 282 (class 1259 OID 728774)
-- Name: v_result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.v_result (
    jsonb_build_object jsonb
);


ALTER TABLE public.v_result OWNER TO postgres;

--
-- TOC entry 4981 (class 2604 OID 720728)
-- Name: ai_model_performance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_model_performance ALTER COLUMN id SET DEFAULT nextval('public.ai_model_performance_id_seq'::regclass);


--
-- TOC entry 4994 (class 2604 OID 728745)
-- Name: application_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history ALTER COLUMN id SET DEFAULT nextval('public.application_status_history_id_seq'::regclass);


--
-- TOC entry 4989 (class 2604 OID 728715)
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- TOC entry 5012 (class 2604 OID 736932)
-- Name: interview_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_history ALTER COLUMN id SET DEFAULT nextval('public.interview_history_id_seq'::regclass);


--
-- TOC entry 5006 (class 2604 OID 736900)
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- TOC entry 4971 (class 2604 OID 720652)
-- Name: job_recommendations_cache id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_recommendations_cache ALTER COLUMN id SET DEFAULT nextval('public.job_recommendations_cache_id_seq'::regclass);


--
-- TOC entry 4977 (class 2604 OID 720705)
-- Name: job_skill_requirements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skill_requirements ALTER COLUMN id SET DEFAULT nextval('public.job_skill_requirements_id_seq'::regclass);


--
-- TOC entry 4954 (class 2604 OID 720579)
-- Name: matches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches ALTER COLUMN id SET DEFAULT nextval('public.matches_id_seq'::regclass);


--
-- TOC entry 4964 (class 2604 OID 720616)
-- Name: matching_algorithm_params id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matching_algorithm_params ALTER COLUMN id SET DEFAULT nextval('public.matching_algorithm_params_id_seq'::regclass);


--
-- TOC entry 5001 (class 2604 OID 736883)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 5014 (class 2604 OID 736955)
-- Name: saved_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs ALTER COLUMN id SET DEFAULT nextval('public.saved_jobs_id_seq'::regclass);


--
-- TOC entry 4976 (class 2604 OID 720696)
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- TOC entry 5022 (class 2604 OID 737001)
-- Name: user_education id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_education ALTER COLUMN id SET DEFAULT nextval('public.user_education_id_seq'::regclass);


--
-- TOC entry 5018 (class 2604 OID 736984)
-- Name: user_experience id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_experience ALTER COLUMN id SET DEFAULT nextval('public.user_experience_id_seq'::regclass);


--
-- TOC entry 4968 (class 2604 OID 720630)
-- Name: user_job_interactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_job_interactions ALTER COLUMN id SET DEFAULT nextval('public.user_job_interactions_id_seq'::regclass);


--
-- TOC entry 4996 (class 2604 OID 736870)
-- Name: user_notification_state id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_state ALTER COLUMN id SET DEFAULT nextval('public.user_notification_state_id_seq'::regclass);


--
-- TOC entry 4956 (class 2604 OID 720597)
-- Name: user_profile_analytics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_analytics ALTER COLUMN id SET DEFAULT nextval('public.user_profile_analytics_id_seq'::regclass);


--
-- TOC entry 4984 (class 2604 OID 720742)
-- Name: user_skill_proficiency id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skill_proficiency ALTER COLUMN id SET DEFAULT nextval('public.user_skill_proficiency_id_seq'::regclass);


--
-- TOC entry 4939 (class 2604 OID 655840)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5368 (class 0 OID 562557)
-- Dependencies: 226
-- Data for Name: action_logs; Type: TABLE DATA; Schema: logs; Owner: postgres
--

COPY logs.action_logs (id, action_name) FROM stdin;
1	create job listing
2	edit job listing
3	delete job listing
\.


--
-- TOC entry 5369 (class 0 OID 562573)
-- Dependencies: 227
-- Data for Name: users_jobs_action_logs_mapping; Type: TABLE DATA; Schema: logs; Owner: postgres
--

COPY logs.users_jobs_action_logs_mapping (id, user_id, action_log_id, action_log_time, job_id, employer_user_id) FROM stdin;
6	1	1	2025-03-10T12:41:57.186Z	5	17
8	1	1	2025-07-20T18:11:46.766Z	8	17
10	1	1	2025-07-20T19:19:48.303Z	10	17
\.


--
-- TOC entry 5416 (class 0 OID 720725)
-- Dependencies: 274
-- Data for Name: ai_model_performance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_model_performance (id, model_version, metric_name, metric_value, sample_size, confidence_interval, recorded_at) FROM stdin;
\.


--
-- TOC entry 5423 (class 0 OID 728742)
-- Dependencies: 281
-- Data for Name: application_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_status_history (id, application_id, old_status, new_status, changed_by, change_reason, changed_at) FROM stdin;
1	2	Pending	Under Review	17	\N	2025-08-27 16:55:26.918079
2	2	Under Review	Interview Scheduled	17	\N	2025-08-27 16:55:27.062297
3	2	Interview Scheduled	Accepted	17	\N	2025-08-27 17:13:56.415157
4	3	\N	Pending	7	\N	2025-08-30 08:48:22.568616
5	3	Pending	Withdrawn	7	Application withdrawn by applicant	2025-08-30 08:49:01.095484
\.


--
-- TOC entry 5421 (class 0 OID 728712)
-- Dependencies: 279
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, job_id, user_id, cv_url, cover_letter_url, status, applied_at, employer_notes, interview_date, created_at, updated_at) FROM stdin;
2	8	7	/uploads/1755981242701-FREDRICK MBUGUA-CV.pdf	/uploads/1755981242702-Fredrick Mbugua - Cover Letter.docx	Accepted	2025-08-23 20:34:02.706		2025-09-03 08:00:00	2025-08-23 23:34:02.707618	2025-08-27 17:13:56.415157
3	10	7	/uploads/1756532900789-64915705-FREDRICK_MBUGUA-CV.pdf	/uploads/1756532900825-81812087-Cover_Letter_for_ICT_Intern_Position_at_Kenya_Institute_of_Management.pdf	Withdrawn	2025-08-30 08:48:22.568616	\N	\N	2025-08-30 08:48:22.568616	2025-08-30 08:49:01.095484
\.


--
-- TOC entry 5359 (class 0 OID 502305)
-- Dependencies: 217
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, client_username, client_first_name, client_second_name, client_third_name, client_country_of_residence, client_mobile_number, client_email, client_date_of_birth, client_about) FROM stdin;
\.


--
-- TOC entry 5382 (class 0 OID 695906)
-- Dependencies: 240
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, company_name, registered_date, industry, location, logo_url, email, about, profile_image, updated_at) FROM stdin;
1	Free Style Code Technologies	2025-06-15 19:18:42.828816+03	Technology	Kitengela, Kenya	/uploads/profile-images/profile-1756543650748-427285453.png	freestylecodetechnologies@gmail.com	We are a software development company solving all your tech needs	/client_side/images/default-company-logo.png	11:47:31.027378+03
\.


--
-- TOC entry 5378 (class 0 OID 654701)
-- Dependencies: 236
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.countries (id, country_name, country_abbreviation, country_code) FROM stdin;
1	Kenya	KE	+254
2	United States of America	USA	+1
\.


--
-- TOC entry 5376 (class 0 OID 654687)
-- Dependencies: 234
-- Data for Name: currencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.currencies (id, currency_name, currency_abbreviation) FROM stdin;
1	Kenya Shillings	KSH
2	US Dollars	USD
\.


--
-- TOC entry 5399 (class 0 OID 712290)
-- Dependencies: 257
-- Data for Name: employee_user_skills_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_user_skills_mapping (id, employee_id, employee_skills) FROM stdin;
1	7	{coding,git,github,linux}
\.


--
-- TOC entry 5432 (class 0 OID 736929)
-- Dependencies: 290
-- Data for Name: interview_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_history (id, interview_id, old_date, new_date, old_status, new_status, change_reason, changed_by, changed_at) FROM stdin;
\.


--
-- TOC entry 5430 (class 0 OID 736897)
-- Dependencies: 288
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviews (id, application_id, interview_date, interview_type, interview_status, interview_location, interview_notes, interviewer_notes, candidate_feedback, interview_duration, meeting_link, scheduled_by, scheduled_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5372 (class 0 OID 562644)
-- Dependencies: 230
-- Data for Name: job_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_categories (id, job_category_name, job_icon_css_class) FROM stdin;
1	Information Technology	\N
2	Engineering	\N
3	Medicine	\N
\.


--
-- TOC entry 5374 (class 0 OID 562651)
-- Dependencies: 232
-- Data for Name: job_categories_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_categories_mapping (id, job_id, category_id) FROM stdin;
4	8	1
8	5	1
9	10	1
\.


--
-- TOC entry 5390 (class 0 OID 704132)
-- Dependencies: 248
-- Data for Name: job_experience_level; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_experience_level (id, job_level) FROM stdin;
1	Entry Level
2	Mid Level
3	Senior Level
4	Executive
\.


--
-- TOC entry 5410 (class 0 OID 720649)
-- Dependencies: 268
-- Data for Name: job_recommendations_cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_recommendations_cache (id, user_id, job_id, match_score, recommendation_reason, algorithm_version, is_active, created_at, expires_at) FROM stdin;
41	7	8	71.51	Good match with some alignment to your profile	v1.0	t	2025-10-05 18:14:37.370277	2025-10-06 18:14:37.370277
42	7	6	71.50	Good match with some alignment to your profile	v1.0	t	2025-10-05 18:14:37.370277	2025-10-06 18:14:37.370277
43	7	5	59.83	Potential match based on available criteria	v1.0	t	2025-10-05 18:14:37.370277	2025-10-06 18:14:37.370277
44	7	10	36.50	Potential match based on available criteria	v1.0	t	2025-10-05 18:14:37.370277	2025-10-06 18:14:37.370277
\.


--
-- TOC entry 5395 (class 0 OID 704173)
-- Dependencies: 253
-- Data for Name: job_remote_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_remote_options (id, job_remote_option_name) FROM stdin;
1	On-Site
2	Remote
3	Hybrid
\.


--
-- TOC entry 5414 (class 0 OID 720702)
-- Dependencies: 272
-- Data for Name: job_skill_requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_skill_requirements (id, job_id, skill_id, importance_level, required_years_experience, is_mandatory, created_at) FROM stdin;
1	5	194	5	3.0	t	2025-08-14 08:55:09.019254
2	5	195	4	2.0	t	2025-08-14 08:55:09.019254
3	5	200	3	1.0	f	2025-08-14 08:55:09.019254
4	6	197	5	2.0	t	2025-08-14 08:55:09.019254
5	6	199	4	1.5	t	2025-08-14 08:55:09.019254
6	8	194	5	3.0	t	2025-08-14 08:55:09.019254
7	8	195	4	2.0	t	2025-08-14 08:55:09.019254
8	10	198	5	3.0	t	2025-08-14 08:55:09.019254
9	10	218	4	2.0	t	2025-08-14 08:55:09.019254
\.


--
-- TOC entry 5419 (class 0 OID 728684)
-- Dependencies: 277
-- Data for Name: job_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_skills (job_id, skill_id) FROM stdin;
\.


--
-- TOC entry 5386 (class 0 OID 704108)
-- Dependencies: 244
-- Data for Name: job_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_types (id, job_type_name) FROM stdin;
1	Full-Time
2	Part-Time
3	Contract
4	Internship
5	Freelance
\.


--
-- TOC entry 5360 (class 0 OID 502312)
-- Dependencies: 218
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, job_title, job_details, job_is_draft, job_last_updated, job_last_updated_condition, job_published_at, job_tags, job_positions, job_salary, job_currency_id, job_employer_country_serial, job_employer_company_serial, job_location, job_published_by_user_id, job_application_deadline, job_department) FROM stdin;
5	UI/UX Designer	#Test 1\nTesting the editor...\n\n\n###Testing jobs:\n\n^Tech jobs\n^Engineering jobs\n^HR jobs\n\n\n\n	f	2025-07-28 03:30:37.10308+03	t	2025-03-10T12:41:57.186Z	{test,ict,hr,engineering,"editor test",editor,test,computing}	3	30000	1	1	1	Kitengela, Kenya	17	2025-07-28T00:00:00.000Z	ICT
10	Android developer	wq	f	2025-07-28 03:37:54.025981+03	t	2025-07-20T19:19:48.303Z	{information,technology,"free style code technologies",android,developer}	3	100000	1	1	1	Maissonete 53, Jem Park. Sabaki-Mololongo, Machakos	17	2025-07-20T00:00:00.000Z	ICT
6	Nurse	Lorem ipsum	f	2025-06-11T06:31:58.312Z	f	2025-06-11T06:31:58.312Z	{nurse}	3	40000	1	1	1	Kitengela, Kenya	17	\N	Medical
8	refr	rfe	f	2025-07-20T18:11:46.766Z	f	2025-07-20T18:11:46.766Z	{information,technology,"free style code technologies",refr}	1	1000	1	1	1	re	17	2025-07-20T00:00:00.000Z	ICT
\.


--
-- TOC entry 5393 (class 0 OID 704156)
-- Dependencies: 251
-- Data for Name: jobs_job_experience_level_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs_job_experience_level_mapping (id, job_id, job_experience_level) FROM stdin;
3	6	2
4	8	2
7	5	2
8	10	3
\.


--
-- TOC entry 5397 (class 0 OID 704180)
-- Dependencies: 255
-- Data for Name: jobs_job_remote_options_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs_job_remote_options_mapping (id, job_id, job_remote_option_id) FROM stdin;
3	6	1
4	8	1
7	5	1
8	10	1
\.


--
-- TOC entry 5388 (class 0 OID 704115)
-- Dependencies: 246
-- Data for Name: jobs_job_type_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs_job_type_mapping (id, job_id, job_type_id) FROM stdin;
3	6	4
4	8	1
7	5	1
8	10	1
\.


--
-- TOC entry 5402 (class 0 OID 720576)
-- Dependencies: 260
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matches (id, job_seeker_user_id, job_listing_id, score, feedback, created_at) FROM stdin;
\.


--
-- TOC entry 5406 (class 0 OID 720613)
-- Dependencies: 264
-- Data for Name: matching_algorithm_params; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matching_algorithm_params (id, param_name, param_value, description, is_active, created_at, updated_at) FROM stdin;
1	skill_match_weight	0.35	Weight for skill matching in overall score	t	2025-08-12 11:24:24.639163	2025-08-12 11:24:24.639163
2	location_match_weight	0.25	Weight for location matching in overall score	t	2025-08-12 11:24:24.639163	2025-08-12 11:24:24.639163
3	salary_match_weight	0.20	Weight for salary range matching in overall score	t	2025-08-12 11:24:24.639163	2025-08-12 11:24:24.639163
4	experience_match_weight	0.15	Weight for experience level matching in overall score	t	2025-08-12 11:24:24.639163	2025-08-12 11:24:24.639163
5	company_culture_weight	0.05	Weight for company culture matching in overall score	t	2025-08-12 11:24:24.639163	2025-08-12 11:24:24.639163
\.


--
-- TOC entry 5428 (class 0 OID 736880)
-- Dependencies: 286
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, user_role, type, title, message, source_key, application_id, job_id, is_read, is_deleted, created_at, updated_at) FROM stdin;
1	7	job_seeker	job	New Job Match	We found a new match: "refr" at Free Style Code Technologies (72%)	2000029	\N	8	t	t	2025-08-26 12:29:03.745383	2025-08-30 09:40:46.665242
2	7	job_seeker	job	New Job Match	We found a new match: "Nurse" at Free Style Code Technologies (72%)	2000030	\N	6	t	t	2025-08-26 12:29:03.745383	2025-08-30 09:40:46.665242
3	7	job_seeker	job	New Job Match	We found a new match: "UI/UX Designer" at Free Style Code Technologies (60%)	2000031	\N	5	t	t	2025-08-26 12:29:03.745383	2025-08-30 09:40:46.665242
4	7	job_seeker	job	New Job Match	We found a new match: "Android developer" at Free Style Code Technologies (37%)	2000032	\N	10	t	t	2025-08-26 12:29:03.745383	2025-08-30 09:40:46.665242
115	7	job_seeker	job	New Job Match	We found a new match: "refr" at Free Style Code Technologies (72%)	2000033	\N	8	t	t	2025-08-27 15:20:42.611334	2025-08-30 09:40:46.665242
116	7	job_seeker	job	New Job Match	We found a new match: "Nurse" at Free Style Code Technologies (72%)	2000034	\N	6	t	t	2025-08-27 15:20:42.611334	2025-08-30 09:40:46.665242
89	17	employer	application	New Application	joy njoki applied for "refr"	2	2	8	t	f	2025-08-23 23:34:02.707618	2025-08-27 17:13:32.455141
117	7	job_seeker	job	New Job Match	We found a new match: "UI/UX Designer" at Free Style Code Technologies (60%)	2000035	\N	5	t	t	2025-08-27 15:20:42.611334	2025-08-30 09:40:46.665242
118	7	job_seeker	job	New Job Match	We found a new match: "Android developer" at Free Style Code Technologies (37%)	2000036	\N	10	t	t	2025-08-27 15:20:42.611334	2025-08-30 09:40:46.665242
124	7	job_seeker	application	Application Pending → Under Review	Your application for "refr" at Free Style Code Technologies changed to Under Review	1	2	8	t	t	2025-08-27 16:55:26.918079	2025-08-30 09:40:46.665242
125	7	job_seeker	application	Application Under Review → Interview Scheduled	Your application for "refr" at Free Style Code Technologies changed to Interview Scheduled	2	2	8	t	t	2025-08-27 16:55:27.062297	2025-08-30 09:40:46.665242
126	7	job_seeker	interview	Interview Scheduled	Interview scheduled for "refr" at Free Style Code Technologies	1000002	2	8	t	t	2025-09-03 08:00:00	2025-08-30 09:40:46.665242
159	7	job_seeker	application	Application Interview Scheduled → Accepted	Your application for "refr" at Free Style Code Technologies changed to Accepted	3	2	8	t	t	2025-08-27 17:13:56.415157	2025-08-30 09:40:46.665242
209	7	job_seeker	job	New Job Match	We found a new match: "refr" at Free Style Code Technologies (72%)	2000037	\N	8	t	t	2025-08-29 14:18:05.059701	2025-08-30 09:40:46.665242
210	7	job_seeker	job	New Job Match	We found a new match: "Nurse" at Free Style Code Technologies (72%)	2000038	\N	6	t	t	2025-08-29 14:18:05.059701	2025-08-30 09:40:46.665242
211	7	job_seeker	job	New Job Match	We found a new match: "UI/UX Designer" at Free Style Code Technologies (60%)	2000039	\N	5	t	t	2025-08-29 14:18:05.059701	2025-08-30 09:40:46.665242
212	7	job_seeker	job	New Job Match	We found a new match: "Android developer" at Free Style Code Technologies (37%)	2000040	\N	10	t	t	2025-08-29 14:18:05.059701	2025-08-30 09:40:46.665242
146	17	employer	interview	Interview Scheduled	Interview scheduled for "refr" with joy njoki	3000002	2	8	t	t	2025-09-03 08:00:00	2025-10-05 18:07:09.034359
474	7	job_seeker	application	Application New → Pending	Your application for "Android developer" at Free Style Code Technologies changed to Pending	4	3	10	t	t	2025-08-30 08:48:22.568616	2025-08-30 09:40:46.665242
475	7	job_seeker	application	Application Pending → Withdrawn	Your application for "Android developer" at Free Style Code Technologies changed to Withdrawn	5	3	10	t	t	2025-08-30 08:49:01.095484	2025-08-30 09:40:46.665242
561	17	employer	application	New Application	joy njoki applied for "Android developer"	3	3	10	f	f	2025-08-30 08:48:22.568616	2025-08-31 13:03:30.233922
594	7	job_seeker	job	New Job Match	We found a new match: "refr" at Free Style Code Technologies (72%)	2000041	\N	8	f	f	2025-10-05 18:14:37.370277	2025-10-05 18:14:37.563562
595	7	job_seeker	job	New Job Match	We found a new match: "Nurse" at Free Style Code Technologies (72%)	2000042	\N	6	f	f	2025-10-05 18:14:37.370277	2025-10-05 18:14:37.563562
596	7	job_seeker	job	New Job Match	We found a new match: "UI/UX Designer" at Free Style Code Technologies (60%)	2000043	\N	5	f	f	2025-10-05 18:14:37.370277	2025-10-05 18:14:37.563562
597	7	job_seeker	job	New Job Match	We found a new match: "Android developer" at Free Style Code Technologies (37%)	2000044	\N	10	f	f	2025-10-05 18:14:37.370277	2025-10-05 18:14:37.563562
\.


--
-- TOC entry 5361 (class 0 OID 502321)
-- Dependencies: 219
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, role_name, role_description) FROM stdin;
1	admin	Overall rights
\.


--
-- TOC entry 5434 (class 0 OID 736952)
-- Dependencies: 292
-- Data for Name: saved_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_jobs (id, user_id, job_id, saved_at, created_at, updated_at) FROM stdin;
5	7	10	2025-08-29 22:11:52.666223	2025-08-29 22:11:52.666223	2025-08-29 22:11:52.666223
\.


--
-- TOC entry 5412 (class 0 OID 720693)
-- Dependencies: 270
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skills (id, name, category, created_at) FROM stdin;
194	JavaScript	Programming	\N
195	React	Frontend	\N
196	Node.js	Backend	\N
197	Python	Programming	\N
198	Java	Programming	\N
199	SQL	Database	\N
200	HTML	Frontend	\N
201	CSS	Frontend	\N
202	TypeScript	Programming	\N
203	Angular	Frontend	\N
204	Vue.js	Frontend	\N
205	Express.js	Backend	\N
206	Django	Backend	\N
207	Spring Boot	Backend	\N
208	PostgreSQL	Database	\N
209	MongoDB	Database	\N
210	Redis	Database	\N
211	Docker	DevOps	\N
212	Kubernetes	DevOps	\N
213	AWS	Cloud	\N
214	Azure	Cloud	\N
215	Git	Version Control	\N
216	Jenkins	DevOps	\N
217	CI/CD	DevOps	\N
218	Android	Mobile Development	\N
244	Firebase	General	\N
\.


--
-- TOC entry 5358 (class 0 OID 502300)
-- Dependencies: 216
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, staff_first_name, staff_middle_name, staff_last_name, staff_user_name, staff_identification_number, staff_nationality, staff_country_of_residence, staff_mobile_number, staff_email, staff_added_by_staff_id, staff_created_on, staff_is_active, staff_password) FROM stdin;
1	admin	admin	admin	sys-admin	0	kenyan	kenya	0740790088	fredmbugua320@gmail.com	1	\N	t	\N
4	joy	njoki	maina	joy-njoki	2004	kenyan	Kenya	+254793577021	joy@gmail.com	1	2025-01-26T20:16:21.755Z	t	$2b$10$F.uXUm/LdnOo/b.ypnxB1OQXjE66MhdokjrmLkEfGM4UjippPZzlS
\.


--
-- TOC entry 5362 (class 0 OID 502326)
-- Dependencies: 220
-- Data for Name: staff_roles_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_roles_mapping (id, staff_roles_mapping_staff_id, staff_roles_mapping_role_id) FROM stdin;
1	1	1
2	4	1
\.


--
-- TOC entry 5384 (class 0 OID 695913)
-- Dependencies: 242
-- Data for Name: user_company_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_company_mapping (id, company_id, user_id) FROM stdin;
2	1	17
\.


--
-- TOC entry 5438 (class 0 OID 736998)
-- Dependencies: 296
-- Data for Name: user_education; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_education (id, user_id, institution_name, degree, field_of_study, start_date, end_date, is_current, grade, description, created_at, updated_at) FROM stdin;
1	7	KU	IT	IT	2023-01-30	2025-08-30	t		\N	2025-08-30 11:21:19.793742	2025-08-30 11:21:19.793742
\.


--
-- TOC entry 5436 (class 0 OID 736981)
-- Dependencies: 294
-- Data for Name: user_experience; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_experience (id, user_id, job_title, company_name, company_location, start_date, end_date, is_current, description, skills_used, created_at, updated_at) FROM stdin;
1	7	Software Developer	Kenyan Tech Zone	\N	2019-01-30	2025-08-30	t	Built softwares	\N	2025-08-30 10:48:15.477528	2025-08-30 10:48:15.477528
\.


--
-- TOC entry 5408 (class 0 OID 720627)
-- Dependencies: 266
-- Data for Name: user_job_interactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_job_interactions (id, user_id, job_id, interaction_type, interaction_score, "timestamp") FROM stdin;
2	7	6	save	0.80	2025-08-23 12:08:56.138429
1	7	8	save	0.80	2025-08-29 21:56:35.901125
12	7	8	ignore	0.20	2025-08-29 22:02:07.712711
6	7	5	apply	0.60	2025-08-29 22:21:16.070073
13	7	8	apply	0.72	2025-08-30 08:10:39.098747
5	7	6	apply	0.72	2025-10-05 22:17:01.358567
7	7	10	apply	0.37	2025-10-05 22:17:07.478138
\.


--
-- TOC entry 5426 (class 0 OID 736867)
-- Dependencies: 284
-- Data for Name: user_notification_state; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_notification_state (id, user_id, source_type, source_id, is_read, is_deleted, created_at, updated_at) FROM stdin;
1	7	job	2000031	t	\N	2025-08-26 17:29:19.074088	2025-08-26 17:29:23.143294
\.


--
-- TOC entry 5404 (class 0 OID 720594)
-- Dependencies: 262
-- Data for Name: user_profile_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profile_analytics (id, user_id, profile_completeness_score, skill_match_preference, location_preference_weight, salary_preference_weight, experience_level_preference, remote_work_preference, industry_preference, last_updated) FROM stdin;
1	7	75.00	0.57	0.57	0.57	3	t	\N	2025-10-05 22:17:07.479996
\.


--
-- TOC entry 5418 (class 0 OID 720739)
-- Dependencies: 276
-- Data for Name: user_skill_proficiency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_skill_proficiency (id, user_id, skill_id, proficiency_level, years_experience, last_used_date, confidence_score, created_at, updated_at) FROM stdin;
2	7	194	4	3.5	\N	0.85	2025-08-14 08:54:58.155556	2025-08-14 14:29:38.723041
3	7	195	4	2.0	\N	0.80	2025-08-14 08:54:58.155556	2025-08-14 14:29:38.723041
4	7	196	3	1.5	\N	0.70	2025-08-14 08:54:58.155556	2025-08-14 14:29:38.723041
5	7	197	3	2.0	\N	0.75	2025-08-14 08:54:58.155556	2025-08-14 14:29:38.723041
6	7	199	4	3.0	\N	0.90	2025-08-14 08:54:58.155556	2025-08-14 14:29:38.723041
17	7	244	3	4.0	2025-08-30	0.80	2025-08-30 10:27:17.374209	2025-08-30 10:27:17.374209
\.


--
-- TOC entry 5381 (class 0 OID 655837)
-- Dependencies: 239
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, user_name, email, phone_number, password_hash, user_type, country_id, created_at, first_name, surname, other_names, user_is_active, title, profile_image, updated_at) FROM stdin;
7	joy-njoki	joy@gmail.com	+254793577021	$2b$10$JCKodYpRbK47VDx6Dk34NuomRSnncW3vuy6//YXDQ6dwLIqfDmQ0O	job_seeker	1	2025-06-15 19:18:42.828816+03	joy	njoki	maina	t	Software developer	/uploads/profile-images/profile-1756542295314-63363378.jpg	11:24:55.491128+03
17	fred-mbugua	fredmbugua320@gmail.com	+254740790088	$2b$10$JJN.A9dTByofT15d4PJfs.86zznmFaue.EN5S2voONA/CWXIrAa9O	employer	1	2025-06-16 01:41:16.410375+03	Fredrick	Mbugua	Kang'ethe	t	UI/UX developer	/uploads/profile-images/profile-1756543282849-456611295.png	11:41:24.08764+03
\.


--
-- TOC entry 5424 (class 0 OID 728774)
-- Dependencies: 282
-- Data for Name: v_result; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.v_result (jsonb_build_object) FROM stdin;
{"data": [{"id": 2, "job_id": 8, "status": "Pending", "location": "re", "job_title": "refr", "applied_at": "2025-08-23T20:34:02.706", "company_name": "Free Style Code Technologies", "interview_date": null}], "success": true, "pagination": {"limit": 10, "total": 10, "offset": 2, "has_more": false}}
\.


--
-- TOC entry 5469 (class 0 OID 0)
-- Dependencies: 228
-- Name: action_logs_serial_no_seq; Type: SEQUENCE SET; Schema: logs; Owner: postgres
--

SELECT pg_catalog.setval('logs.action_logs_serial_no_seq', 3, true);


--
-- TOC entry 5470 (class 0 OID 0)
-- Dependencies: 229
-- Name: users_action_logs_mapping_serial_no_seq; Type: SEQUENCE SET; Schema: logs; Owner: postgres
--

SELECT pg_catalog.setval('logs.users_action_logs_mapping_serial_no_seq', 10, true);


--
-- TOC entry 5471 (class 0 OID 0)
-- Dependencies: 273
-- Name: ai_model_performance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_model_performance_id_seq', 1, false);


--
-- TOC entry 5472 (class 0 OID 0)
-- Dependencies: 280
-- Name: application_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_status_history_id_seq', 5, true);


--
-- TOC entry 5473 (class 0 OID 0)
-- Dependencies: 278
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_id_seq', 3, true);


--
-- TOC entry 5474 (class 0 OID 0)
-- Dependencies: 221
-- Name: clients_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_serial_no_seq', 1, false);


--
-- TOC entry 5475 (class 0 OID 0)
-- Dependencies: 241
-- Name: companies_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_serial_no_seq', 1, true);


--
-- TOC entry 5476 (class 0 OID 0)
-- Dependencies: 237
-- Name: country_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.country_serial_no_seq', 2, true);


--
-- TOC entry 5477 (class 0 OID 0)
-- Dependencies: 235
-- Name: currencies_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.currencies_serial_no_seq', 2, true);


--
-- TOC entry 5478 (class 0 OID 0)
-- Dependencies: 258
-- Name: employee_user_skills_mapping_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_user_skills_mapping_serial_no_seq', 1, true);


--
-- TOC entry 5479 (class 0 OID 0)
-- Dependencies: 289
-- Name: interview_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interview_history_id_seq', 1, false);


--
-- TOC entry 5480 (class 0 OID 0)
-- Dependencies: 287
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interviews_id_seq', 1, false);


--
-- TOC entry 5481 (class 0 OID 0)
-- Dependencies: 233
-- Name: job_categories_mapping_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_categories_mapping_serial_no_seq', 9, true);


--
-- TOC entry 5482 (class 0 OID 0)
-- Dependencies: 231
-- Name: job_categories_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_categories_serial_no_seq', 3, true);


--
-- TOC entry 5483 (class 0 OID 0)
-- Dependencies: 252
-- Name: job_experience_level_mapping_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_experience_level_mapping_serial_no_seq', 8, true);


--
-- TOC entry 5484 (class 0 OID 0)
-- Dependencies: 250
-- Name: job_level_mapping_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_level_mapping_serial_no_seq', 1, false);


--
-- TOC entry 5485 (class 0 OID 0)
-- Dependencies: 249
-- Name: job_level_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_level_serial_no_seq', 4, true);


--
-- TOC entry 5486 (class 0 OID 0)
-- Dependencies: 267
-- Name: job_recommendations_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_recommendations_cache_id_seq', 44, true);


--
-- TOC entry 5487 (class 0 OID 0)
-- Dependencies: 254
-- Name: job_remote_options_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_remote_options_serial_no_seq', 3, true);


--
-- TOC entry 5488 (class 0 OID 0)
-- Dependencies: 271
-- Name: job_skill_requirements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_skill_requirements_id_seq', 18, true);


--
-- TOC entry 5489 (class 0 OID 0)
-- Dependencies: 247
-- Name: job_type_mapping_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_type_mapping_serial_no_seq', 8, true);


--
-- TOC entry 5490 (class 0 OID 0)
-- Dependencies: 245
-- Name: job_type_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_type_serial_no_seq', 5, true);


--
-- TOC entry 5491 (class 0 OID 0)
-- Dependencies: 256
-- Name: jobs_job_remote_options_mapping_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_job_remote_options_mapping_serial_no_seq', 8, true);


--
-- TOC entry 5492 (class 0 OID 0)
-- Dependencies: 222
-- Name: jobs_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_serial_no_seq', 10, true);


--
-- TOC entry 5493 (class 0 OID 0)
-- Dependencies: 259
-- Name: matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.matches_id_seq', 1, false);


--
-- TOC entry 5494 (class 0 OID 0)
-- Dependencies: 263
-- Name: matching_algorithm_params_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.matching_algorithm_params_id_seq', 190, true);


--
-- TOC entry 5495 (class 0 OID 0)
-- Dependencies: 285
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1040, true);


--
-- TOC entry 5496 (class 0 OID 0)
-- Dependencies: 223
-- Name: roles_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_serial_no_seq', 1, true);


--
-- TOC entry 5497 (class 0 OID 0)
-- Dependencies: 291
-- Name: saved_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saved_jobs_id_seq', 5, true);


--
-- TOC entry 5498 (class 0 OID 0)
-- Dependencies: 269
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skills_id_seq', 244, true);


--
-- TOC entry 5499 (class 0 OID 0)
-- Dependencies: 225
-- Name: staff_roles_mapping_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_roles_mapping_serial_no_seq', 2, true);


--
-- TOC entry 5500 (class 0 OID 0)
-- Dependencies: 224
-- Name: staff_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_serial_no_seq', 4, true);


--
-- TOC entry 5501 (class 0 OID 0)
-- Dependencies: 243
-- Name: user_company_serial_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_company_serial_no_seq', 2, true);


--
-- TOC entry 5502 (class 0 OID 0)
-- Dependencies: 295
-- Name: user_education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_education_id_seq', 1, true);


--
-- TOC entry 5503 (class 0 OID 0)
-- Dependencies: 293
-- Name: user_experience_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_experience_id_seq', 1, true);


--
-- TOC entry 5504 (class 0 OID 0)
-- Dependencies: 265
-- Name: user_job_interactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_job_interactions_id_seq', 22, true);


--
-- TOC entry 5505 (class 0 OID 0)
-- Dependencies: 283
-- Name: user_notification_state_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_notification_state_id_seq', 2, true);


--
-- TOC entry 5506 (class 0 OID 0)
-- Dependencies: 261
-- Name: user_profile_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_profile_analytics_id_seq', 24, true);


--
-- TOC entry 5507 (class 0 OID 0)
-- Dependencies: 275
-- Name: user_skill_proficiency_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_skill_proficiency_id_seq', 17, true);


--
-- TOC entry 5508 (class 0 OID 0)
-- Dependencies: 238
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


--
-- TOC entry 5043 (class 2606 OID 562563)
-- Name: action_logs action_logs_pkey; Type: CONSTRAINT; Schema: logs; Owner: postgres
--

ALTER TABLE ONLY logs.action_logs
    ADD CONSTRAINT action_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5045 (class 2606 OID 562577)
-- Name: users_jobs_action_logs_mapping users_action_logs_mapping_pkey; Type: CONSTRAINT; Schema: logs; Owner: postgres
--

ALTER TABLE ONLY logs.users_jobs_action_logs_mapping
    ADD CONSTRAINT users_action_logs_mapping_pkey PRIMARY KEY (id);


--
-- TOC entry 5115 (class 2606 OID 720732)
-- Name: ai_model_performance ai_model_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_model_performance
    ADD CONSTRAINT ai_model_performance_pkey PRIMARY KEY (id);


--
-- TOC entry 5132 (class 2606 OID 728750)
-- Name: application_status_history application_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history
    ADD CONSTRAINT application_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5124 (class 2606 OID 728724)
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 502311)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 5063 (class 2606 OID 695910)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 5053 (class 2606 OID 654705)
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- TOC entry 5051 (class 2606 OID 654693)
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);


--
-- TOC entry 5079 (class 2606 OID 712296)
-- Name: employee_user_skills_mapping employee_user_skills_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_user_skills_mapping
    ADD CONSTRAINT employee_user_skills_mapping_pkey PRIMARY KEY (id);


--
-- TOC entry 5154 (class 2606 OID 736937)
-- Name: interview_history interview_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_history
    ADD CONSTRAINT interview_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5150 (class 2606 OID 736911)
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5049 (class 2606 OID 562655)
-- Name: job_categories_mapping job_categories_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_categories_mapping
    ADD CONSTRAINT job_categories_mapping_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 562648)
-- Name: job_categories job_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_categories
    ADD CONSTRAINT job_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5071 (class 2606 OID 704136)
-- Name: job_experience_level job_level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_experience_level
    ADD CONSTRAINT job_level_pkey PRIMARY KEY (id);


--
-- TOC entry 5100 (class 2606 OID 720660)
-- Name: job_recommendations_cache job_recommendations_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_recommendations_cache
    ADD CONSTRAINT job_recommendations_cache_pkey PRIMARY KEY (id);


--
-- TOC entry 5102 (class 2606 OID 720662)
-- Name: job_recommendations_cache job_recommendations_cache_user_id_job_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_recommendations_cache
    ADD CONSTRAINT job_recommendations_cache_user_id_job_id_key UNIQUE (user_id, job_id);


--
-- TOC entry 5075 (class 2606 OID 704177)
-- Name: job_remote_options job_remote_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_remote_options
    ADD CONSTRAINT job_remote_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5111 (class 2606 OID 720713)
-- Name: job_skill_requirements job_skill_requirements_job_id_skill_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skill_requirements
    ADD CONSTRAINT job_skill_requirements_job_id_skill_id_key UNIQUE (job_id, skill_id);


--
-- TOC entry 5113 (class 2606 OID 720711)
-- Name: job_skill_requirements job_skill_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skill_requirements
    ADD CONSTRAINT job_skill_requirements_pkey PRIMARY KEY (id);


--
-- TOC entry 5122 (class 2606 OID 728688)
-- Name: job_skills job_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_pkey PRIMARY KEY (job_id, skill_id);


--
-- TOC entry 5067 (class 2606 OID 704112)
-- Name: job_types job_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_types
    ADD CONSTRAINT job_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5073 (class 2606 OID 704160)
-- Name: jobs_job_experience_level_mapping jobs_job_experience_level_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_job_experience_level_mapping
    ADD CONSTRAINT jobs_job_experience_level_mapping_pkey PRIMARY KEY (id);


--
-- TOC entry 5077 (class 2606 OID 704184)
-- Name: jobs_job_remote_options_mapping jobs_job_remote_options_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_job_remote_options_mapping
    ADD CONSTRAINT jobs_job_remote_options_mapping_pkey PRIMARY KEY (id);


--
-- TOC entry 5069 (class 2606 OID 704119)
-- Name: jobs_job_type_mapping jobs_job_type_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_job_type_mapping
    ADD CONSTRAINT jobs_job_type_mapping_pkey PRIMARY KEY (id);


--
-- TOC entry 5037 (class 2606 OID 502320)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 5081 (class 2606 OID 720582)
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- TOC entry 5088 (class 2606 OID 720625)
-- Name: matching_algorithm_params matching_algorithm_params_param_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matching_algorithm_params
    ADD CONSTRAINT matching_algorithm_params_param_name_key UNIQUE (param_name);


--
-- TOC entry 5090 (class 2606 OID 720623)
-- Name: matching_algorithm_params matching_algorithm_params_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matching_algorithm_params
    ADD CONSTRAINT matching_algorithm_params_pkey PRIMARY KEY (id);


--
-- TOC entry 5142 (class 2606 OID 736891)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5144 (class 2606 OID 736893)
-- Name: notifications notifications_unique_per_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_unique_per_user UNIQUE (user_id, source_key);


--
-- TOC entry 5039 (class 2606 OID 502325)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5158 (class 2606 OID 736960)
-- Name: saved_jobs saved_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 5160 (class 2606 OID 736962)
-- Name: saved_jobs saved_jobs_user_id_job_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_user_id_job_id_key UNIQUE (user_id, job_id);


--
-- TOC entry 5104 (class 2606 OID 720700)
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- TOC entry 5106 (class 2606 OID 728675)
-- Name: skills skills_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_unique UNIQUE (name);


--
-- TOC entry 5108 (class 2606 OID 720698)
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- TOC entry 5033 (class 2606 OID 502304)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- TOC entry 5041 (class 2606 OID 502330)
-- Name: staff_roles_mapping staff_roles_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_roles_mapping
    ADD CONSTRAINT staff_roles_mapping_pkey PRIMARY KEY (id);


--
-- TOC entry 5130 (class 2606 OID 728726)
-- Name: applications unique_job_user_application; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT unique_job_user_application UNIQUE (job_id, user_id);


--
-- TOC entry 5065 (class 2606 OID 695917)
-- Name: user_company_mapping user_company_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_company_mapping
    ADD CONSTRAINT user_company_mapping_pkey PRIMARY KEY (id);


--
-- TOC entry 5166 (class 2606 OID 737008)
-- Name: user_education user_education_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_education
    ADD CONSTRAINT user_education_pkey PRIMARY KEY (id);


--
-- TOC entry 5163 (class 2606 OID 736991)
-- Name: user_experience user_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_experience
    ADD CONSTRAINT user_experience_pkey PRIMARY KEY (id);


--
-- TOC entry 5084 (class 2606 OID 728677)
-- Name: user_profile_analytics user_id_unique_constraint; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_analytics
    ADD CONSTRAINT user_id_unique_constraint UNIQUE (user_id);


--
-- TOC entry 5094 (class 2606 OID 720635)
-- Name: user_job_interactions user_job_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_job_interactions
    ADD CONSTRAINT user_job_interactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5096 (class 2606 OID 720637)
-- Name: user_job_interactions user_job_interactions_user_id_job_id_interaction_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_job_interactions
    ADD CONSTRAINT user_job_interactions_user_id_job_id_interaction_type_key UNIQUE (user_id, job_id, interaction_type);


--
-- TOC entry 5136 (class 2606 OID 736876)
-- Name: user_notification_state user_notification_state_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_state
    ADD CONSTRAINT user_notification_state_pkey PRIMARY KEY (id);


--
-- TOC entry 5138 (class 2606 OID 736878)
-- Name: user_notification_state user_notification_state_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_state
    ADD CONSTRAINT user_notification_state_unique UNIQUE (user_id, source_type, source_id);


--
-- TOC entry 5086 (class 2606 OID 720606)
-- Name: user_profile_analytics user_profile_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_analytics
    ADD CONSTRAINT user_profile_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 5118 (class 2606 OID 720749)
-- Name: user_skill_proficiency user_skill_proficiency_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skill_proficiency
    ADD CONSTRAINT user_skill_proficiency_pkey PRIMARY KEY (id);


--
-- TOC entry 5120 (class 2606 OID 720751)
-- Name: user_skill_proficiency user_skill_proficiency_user_id_skill_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skill_proficiency
    ADD CONSTRAINT user_skill_proficiency_user_id_skill_id_key UNIQUE (user_id, skill_id);


--
-- TOC entry 5055 (class 2606 OID 655849)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5057 (class 2606 OID 655851)
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- TOC entry 5059 (class 2606 OID 655845)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 656041)
-- Name: users users_user_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_name_key UNIQUE (user_name);


--
-- TOC entry 5133 (class 1259 OID 728761)
-- Name: idx_application_status_history_application_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_application_status_history_application_id ON public.application_status_history USING btree (application_id);


--
-- TOC entry 5134 (class 1259 OID 728762)
-- Name: idx_application_status_history_changed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_application_status_history_changed_at ON public.application_status_history USING btree (changed_at);


--
-- TOC entry 5125 (class 1259 OID 728740)
-- Name: idx_applications_applied_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_applied_at ON public.applications USING btree (applied_at);


--
-- TOC entry 5126 (class 1259 OID 728737)
-- Name: idx_applications_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_job_id ON public.applications USING btree (job_id);


--
-- TOC entry 5127 (class 1259 OID 728739)
-- Name: idx_applications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_status ON public.applications USING btree (status);


--
-- TOC entry 5128 (class 1259 OID 728738)
-- Name: idx_applications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_user_id ON public.applications USING btree (user_id);


--
-- TOC entry 5151 (class 1259 OID 736949)
-- Name: idx_interview_history_changed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interview_history_changed_at ON public.interview_history USING btree (changed_at);


--
-- TOC entry 5152 (class 1259 OID 736948)
-- Name: idx_interview_history_interview_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interview_history_interview_id ON public.interview_history USING btree (interview_id);


--
-- TOC entry 5145 (class 1259 OID 736922)
-- Name: idx_interviews_application_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_application_id ON public.interviews USING btree (application_id);


--
-- TOC entry 5146 (class 1259 OID 736923)
-- Name: idx_interviews_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_date ON public.interviews USING btree (interview_date);


--
-- TOC entry 5147 (class 1259 OID 736925)
-- Name: idx_interviews_scheduled_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_scheduled_by ON public.interviews USING btree (scheduled_by);


--
-- TOC entry 5148 (class 1259 OID 736924)
-- Name: idx_interviews_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_status ON public.interviews USING btree (interview_status);


--
-- TOC entry 5097 (class 1259 OID 720766)
-- Name: idx_job_recommendations_cache_match_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_recommendations_cache_match_score ON public.job_recommendations_cache USING btree (match_score);


--
-- TOC entry 5098 (class 1259 OID 720765)
-- Name: idx_job_recommendations_cache_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_recommendations_cache_user_id ON public.job_recommendations_cache USING btree (user_id);


--
-- TOC entry 5109 (class 1259 OID 720768)
-- Name: idx_job_skill_requirements_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_skill_requirements_job_id ON public.job_skill_requirements USING btree (job_id);


--
-- TOC entry 5139 (class 1259 OID 736895)
-- Name: idx_notifications_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created ON public.notifications USING btree (created_at DESC);


--
-- TOC entry 5140 (class 1259 OID 736894)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- TOC entry 5155 (class 1259 OID 736974)
-- Name: idx_saved_jobs_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_jobs_job_id ON public.saved_jobs USING btree (job_id);


--
-- TOC entry 5156 (class 1259 OID 736973)
-- Name: idx_saved_jobs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs USING btree (user_id);


--
-- TOC entry 5164 (class 1259 OID 737015)
-- Name: idx_user_education_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_education_user_id ON public.user_education USING btree (user_id);


--
-- TOC entry 5161 (class 1259 OID 737014)
-- Name: idx_user_experience_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_experience_user_id ON public.user_experience USING btree (user_id);


--
-- TOC entry 5091 (class 1259 OID 720764)
-- Name: idx_user_job_interactions_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_job_interactions_job_id ON public.user_job_interactions USING btree (job_id);


--
-- TOC entry 5092 (class 1259 OID 720763)
-- Name: idx_user_job_interactions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_job_interactions_user_id ON public.user_job_interactions USING btree (user_id);


--
-- TOC entry 5082 (class 1259 OID 720762)
-- Name: idx_user_profile_analytics_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_profile_analytics_user_id ON public.user_profile_analytics USING btree (user_id);


--
-- TOC entry 5116 (class 1259 OID 720767)
-- Name: idx_user_skill_proficiency_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_skill_proficiency_user_id ON public.user_skill_proficiency USING btree (user_id);


--
-- TOC entry 5214 (class 2620 OID 736927)
-- Name: interviews trigger_interviews_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_interviews_updated_at BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.update_interviews_updated_at();


--
-- TOC entry 5173 (class 2606 OID 562596)
-- Name: users_jobs_action_logs_mapping action_log_id_fk; Type: FK CONSTRAINT; Schema: logs; Owner: postgres
--

ALTER TABLE ONLY logs.users_jobs_action_logs_mapping
    ADD CONSTRAINT action_log_id_fk FOREIGN KEY (action_log_id) REFERENCES logs.action_logs(id) ON DELETE CASCADE;


--
-- TOC entry 5174 (class 2606 OID 704199)
-- Name: users_jobs_action_logs_mapping employer_user_id_fk; Type: FK CONSTRAINT; Schema: logs; Owner: postgres
--

ALTER TABLE ONLY logs.users_jobs_action_logs_mapping
    ADD CONSTRAINT employer_user_id_fk FOREIGN KEY (employer_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5175 (class 2606 OID 562670)
-- Name: users_jobs_action_logs_mapping job_id_fk; Type: FK CONSTRAINT; Schema: logs; Owner: postgres
--

ALTER TABLE ONLY logs.users_jobs_action_logs_mapping
    ADD CONSTRAINT job_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5176 (class 2606 OID 562582)
-- Name: users_jobs_action_logs_mapping user_id_fk; Type: FK CONSTRAINT; Schema: logs; Owner: postgres
--

ALTER TABLE ONLY logs.users_jobs_action_logs_mapping
    ADD CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5177 (class 2606 OID 562663)
-- Name: job_categories_mapping category_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_categories_mapping
    ADD CONSTRAINT category_id_fk FOREIGN KEY (category_id) REFERENCES public.job_categories(id) ON DELETE CASCADE;


--
-- TOC entry 5180 (class 2606 OID 695920)
-- Name: user_company_mapping company_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_company_mapping
    ADD CONSTRAINT company_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 5167 (class 2606 OID 704098)
-- Name: jobs company_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT company_id_fk FOREIGN KEY (job_employer_company_serial) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 5168 (class 2606 OID 654708)
-- Name: jobs countries_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT countries_id_fk FOREIGN KEY (job_employer_country_serial) REFERENCES public.countries(id) ON DELETE CASCADE;


--
-- TOC entry 5179 (class 2606 OID 671071)
-- Name: users country_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT country_id_fk FOREIGN KEY (country_id) REFERENCES public.countries(id) ON DELETE CASCADE;


--
-- TOC entry 5169 (class 2606 OID 654695)
-- Name: jobs currency_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT currency_id_fk FOREIGN KEY (job_currency_id) REFERENCES public.currencies(id) ON DELETE CASCADE;


--
-- TOC entry 5188 (class 2606 OID 712299)
-- Name: employee_user_skills_mapping employee_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_user_skills_mapping
    ADD CONSTRAINT employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5202 (class 2606 OID 728727)
-- Name: applications fk_applications_job_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT fk_applications_job_id FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5203 (class 2606 OID 728732)
-- Name: applications fk_applications_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT fk_applications_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5208 (class 2606 OID 736943)
-- Name: interview_history fk_interview_history_changed_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_history
    ADD CONSTRAINT fk_interview_history_changed_by FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5209 (class 2606 OID 736938)
-- Name: interview_history fk_interview_history_interview; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_history
    ADD CONSTRAINT fk_interview_history_interview FOREIGN KEY (interview_id) REFERENCES public.interviews(id) ON DELETE CASCADE;


--
-- TOC entry 5206 (class 2606 OID 736912)
-- Name: interviews fk_interviews_application; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT fk_interviews_application FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- TOC entry 5207 (class 2606 OID 736917)
-- Name: interviews fk_interviews_scheduled_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT fk_interviews_scheduled_by FOREIGN KEY (scheduled_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5204 (class 2606 OID 728751)
-- Name: application_status_history fk_status_history_application_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history
    ADD CONSTRAINT fk_status_history_application_id FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- TOC entry 5205 (class 2606 OID 728756)
-- Name: application_status_history fk_status_history_changed_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history
    ADD CONSTRAINT fk_status_history_changed_by FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5184 (class 2606 OID 704168)
-- Name: jobs_job_experience_level_mapping job_experience_level_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_job_experience_level_mapping
    ADD CONSTRAINT job_experience_level_id_fk FOREIGN KEY (job_experience_level) REFERENCES public.job_experience_level(id) ON DELETE CASCADE;


--
-- TOC entry 5178 (class 2606 OID 562658)
-- Name: job_categories_mapping job_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_categories_mapping
    ADD CONSTRAINT job_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5182 (class 2606 OID 704120)
-- Name: jobs_job_type_mapping job_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_job_type_mapping
    ADD CONSTRAINT job_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5185 (class 2606 OID 704163)
-- Name: jobs_job_experience_level_mapping job_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_job_experience_level_mapping
    ADD CONSTRAINT job_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5186 (class 2606 OID 704187)
-- Name: jobs_job_remote_options_mapping job_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_job_remote_options_mapping
    ADD CONSTRAINT job_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5194 (class 2606 OID 720668)
-- Name: job_recommendations_cache job_recommendations_cache_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_recommendations_cache
    ADD CONSTRAINT job_recommendations_cache_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5195 (class 2606 OID 720663)
-- Name: job_recommendations_cache job_recommendations_cache_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_recommendations_cache
    ADD CONSTRAINT job_recommendations_cache_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5187 (class 2606 OID 704192)
-- Name: jobs_job_remote_options_mapping job_remote_option_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_job_remote_options_mapping
    ADD CONSTRAINT job_remote_option_id_fk FOREIGN KEY (job_remote_option_id) REFERENCES public.job_remote_options(id) ON DELETE CASCADE;


--
-- TOC entry 5196 (class 2606 OID 720714)
-- Name: job_skill_requirements job_skill_requirements_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skill_requirements
    ADD CONSTRAINT job_skill_requirements_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5197 (class 2606 OID 720719)
-- Name: job_skill_requirements job_skill_requirements_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skill_requirements
    ADD CONSTRAINT job_skill_requirements_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- TOC entry 5200 (class 2606 OID 728689)
-- Name: job_skills job_skills_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5201 (class 2606 OID 728694)
-- Name: job_skills job_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- TOC entry 5183 (class 2606 OID 704125)
-- Name: jobs_job_type_mapping job_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_job_type_mapping
    ADD CONSTRAINT job_type_id_fk FOREIGN KEY (job_type_id) REFERENCES public.job_types(id) ON DELETE CASCADE;


--
-- TOC entry 5189 (class 2606 OID 720588)
-- Name: matches matches_job_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_job_listing_id_fkey FOREIGN KEY (job_listing_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5190 (class 2606 OID 720583)
-- Name: matches matches_job_seeker_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_job_seeker_user_id_fkey FOREIGN KEY (job_seeker_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5171 (class 2606 OID 502346)
-- Name: staff_roles_mapping role_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_roles_mapping
    ADD CONSTRAINT role_id_fk FOREIGN KEY (staff_roles_mapping_role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 5210 (class 2606 OID 736968)
-- Name: saved_jobs saved_jobs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5211 (class 2606 OID 736963)
-- Name: saved_jobs saved_jobs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5172 (class 2606 OID 502341)
-- Name: staff_roles_mapping staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_roles_mapping
    ADD CONSTRAINT staff_id_fk FOREIGN KEY (staff_roles_mapping_staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5181 (class 2606 OID 695925)
-- Name: user_company_mapping us_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_company_mapping
    ADD CONSTRAINT us_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5213 (class 2606 OID 737009)
-- Name: user_education user_education_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_education
    ADD CONSTRAINT user_education_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5212 (class 2606 OID 736992)
-- Name: user_experience user_experience_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_experience
    ADD CONSTRAINT user_experience_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5170 (class 2606 OID 704103)
-- Name: jobs user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT user_id_fk FOREIGN KEY (job_published_by_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5192 (class 2606 OID 720643)
-- Name: user_job_interactions user_job_interactions_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_job_interactions
    ADD CONSTRAINT user_job_interactions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5193 (class 2606 OID 720638)
-- Name: user_job_interactions user_job_interactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_job_interactions
    ADD CONSTRAINT user_job_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5191 (class 2606 OID 720607)
-- Name: user_profile_analytics user_profile_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_analytics
    ADD CONSTRAINT user_profile_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5198 (class 2606 OID 720757)
-- Name: user_skill_proficiency user_skill_proficiency_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skill_proficiency
    ADD CONSTRAINT user_skill_proficiency_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- TOC entry 5199 (class 2606 OID 720752)
-- Name: user_skill_proficiency user_skill_proficiency_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skill_proficiency
    ADD CONSTRAINT user_skill_proficiency_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-10-06 00:31:25

--
-- PostgreSQL database dump complete
--

