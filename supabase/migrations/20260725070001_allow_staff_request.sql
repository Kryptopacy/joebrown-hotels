-- Allow any authenticated user to request access (insert as pending)
CREATE POLICY "Allow users to request access"
ON public.staff_users FOR INSERT
TO authenticated
WITH CHECK (
  email = (select auth.jwt()->>'email') 
  AND status = 'pending'
);

-- Allow users to insert themselves as pending when they sign in for the first time
CREATE POLICY "Allow users to insert themselves as pending" 
ON public.staff_users FOR INSERT 
WITH CHECK (
    auth.jwt()->>'email' = email 
    AND status = 'pending' 
    AND role = 'receptionist'
);

-- Allow users to read their own row (needed for middleware to check status)
CREATE POLICY "Allow users to read their own row" 
ON public.staff_users FOR SELECT 
USING (auth.jwt()->>'email' = email);
