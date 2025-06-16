-- Fix the completed_filters table to allow NULL interval_value for "no" option

-- First, drop the existing table if it exists
DROP TABLE IF EXISTS completed_filters;

-- Recreate the table with interval_value allowing NULL
CREATE TABLE completed_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filter_key VARCHAR NOT NULL UNIQUE,
    interval_value INTERVAL NULL  -- Allow NULL for "no" option
);

-- Insert all the filter options including "no" with NULL interval
INSERT INTO completed_filters (filter_key, interval_value) VALUES
('no', NULL),  -- This is now allowed
('5 min', INTERVAL '5 minutes'),
('10 min', INTERVAL '10 minutes'),
('30 min', INTERVAL '30 minutes'),
('1 hour', INTERVAL '1 hour'),
('2 hours', INTERVAL '2 hours'),
('3 hours', INTERVAL '3 hours'),
('6 hours', INTERVAL '6 hours'),
('12 hours', INTERVAL '12 hours'),
('Today', INTERVAL '1 day'),  -- We'll handle this specially in the procedure
('2 days', INTERVAL '2 days'),
('3 days', INTERVAL '3 days'),
('1 week', INTERVAL '1 week'),
('1 month', INTERVAL '1 month'),
('3 months', INTERVAL '3 months'),
('1 year', INTERVAL '1 year');

-- Verify the data was inserted correctly
SELECT 'Completed filters table fixed:' as info;
SELECT 
    filter_key,
    interval_value,
    CASE 
        WHEN interval_value IS NULL THEN 'NULL (allowed)'
        ELSE interval_value::text
    END as interval_display
FROM completed_filters
ORDER BY 
    CASE 
        WHEN filter_key = 'no' THEN 0
        WHEN interval_value IS NULL THEN 1
        ELSE 2
    END,
    interval_value;
