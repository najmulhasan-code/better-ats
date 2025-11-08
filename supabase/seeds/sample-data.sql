-- Sample Data for Development/Testing
-- This file contains sample data to help with development and testing
-- Run this after setting up the database schema

-- Insert sample companies
INSERT INTO companies (id, name, website, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Tech Corp', 'https://techcorp.example.com', 'A leading technology company specializing in software development and cloud solutions.'),
    ('00000000-0000-0000-0000-000000000002', 'StartupXYZ', 'https://startupxyz.example.com', 'An innovative startup focused on AI and machine learning applications.')
ON CONFLICT (id) DO NOTHING;

-- Insert sample job postings
INSERT INTO job_postings (id, company_id, title, description, location, employment_type, status) VALUES
    (
        '10000000-0000-0000-0000-000000000001', 
        '00000000-0000-0000-0000-000000000001', 
        'Senior Software Engineer', 
        'We are looking for an experienced software engineer to join our team. You will work on cutting-edge projects using modern technologies.',
        'San Francisco, CA', 
        'FULL_TIME', 
        'PUBLISHED'
    ),
    (
        '10000000-0000-0000-0000-000000000002', 
        '00000000-0000-0000-0000-000000000002', 
        'Product Manager', 
        'Join our team as a Product Manager and help shape the future of our products. You will work closely with engineering and design teams.',
        'Remote', 
        'FULL_TIME', 
        'PUBLISHED'
    ),
    (
        '10000000-0000-0000-0000-000000000003', 
        '00000000-0000-0000-0000-000000000001', 
        'Frontend Developer', 
        'We are seeking a talented Frontend Developer to build beautiful and responsive user interfaces.',
        'New York, NY', 
        'FULL_TIME', 
        'PUBLISHED'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample candidates
INSERT INTO candidates (id, first_name, last_name, email, phone, linkedin_url) VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        'John',
        'Doe',
        'john.doe@example.com',
        '+1-555-0100',
        'https://linkedin.com/in/johndoe'
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        'Jane',
        'Smith',
        'jane.smith@example.com',
        '+1-555-0101',
        'https://linkedin.com/in/janesmith'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample applications
INSERT INTO applications (id, job_posting_id, candidate_id, status, cover_letter) VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'APPLIED',
        'I am very interested in this position and believe my experience aligns well with your requirements.'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002',
        'INTERVIEWING',
        'I would love to contribute to your innovative product team.'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample interviews
INSERT INTO interviews (id, application_id, interview_type, scheduled_at, location, status) VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000002',
        'VIDEO',
        NOW() + INTERVAL '7 days',
        'Zoom Meeting',
        'SCHEDULED'
    )
ON CONFLICT (id) DO NOTHING;

