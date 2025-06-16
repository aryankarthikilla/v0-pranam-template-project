-- Create a new table to store completed filter values
-- This table will store the filter key and the corresponding interval.

CREATE TABLE completed_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filter_key VARCHAR NOT NULL,
    interval_value INTERVAL NOT NULL
);
