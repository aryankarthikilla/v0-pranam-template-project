-- Insert common time filters into completed_filters table

INSERT INTO completed_filters (filter_key, interval_value) VALUES
('5 min', INTERVAL '5 minutes'),
('10 min', INTERVAL '10 minutes'),
('30 min', INTERVAL '30 minutes'),
('1 hour', INTERVAL '1 hour'),
('2 hours', INTERVAL '2 hours'),
('3 hours', INTERVAL '3 hours'),
('6 hours', INTERVAL '6 hours'),
('12 hours', INTERVAL '12 hours'),
('Today', date_trunc('day', now()) - now()), -- special case, handled in procedure
('2 days', INTERVAL '2 days'),
('3 days', INTERVAL '3 days'),
('1 week', INTERVAL '1 week'),
('1 month', INTERVAL '1 month'),
('3 months', INTERVAL '3 months'),
('1 year', INTERVAL '1 year');
