-- Create a debug function to help with authentication issues
-- This will help identify why auth.uid() is returning NULL

CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS TABLE (
    context_info TEXT,
    value TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Return various auth context information
    RETURN QUERY SELECT 'auth.uid()'::TEXT, COALESCE(auth.uid()::TEXT, 'NULL');
    RETURN QUERY SELECT 'auth.role()'::TEXT, COALESCE(auth.role()::TEXT, 'NULL');
    RETURN QUERY SELECT 'current_user'::TEXT, current_user::TEXT;
    RETURN QUERY SELECT 'session_user'::TEXT, session_user::TEXT;
    
    -- Check if we're in a security definer context
    RETURN QUERY SELECT 'security_context'::TEXT, 
        CASE 
            WHEN current_user = session_user THEN 'INVOKER'
            ELSE 'DEFINER'
        END;
        
    -- Check for JWT claims if available
    RETURN QUERY SELECT 'jwt_claims'::TEXT, 
        COALESCE(
            (SELECT auth.jwt()::TEXT), 
            'No JWT available'
        );
END;
$$;

-- Test the debug function
SELECT * FROM debug_auth_context();
