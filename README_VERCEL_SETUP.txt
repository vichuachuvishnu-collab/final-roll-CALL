ROLL CALL LIVE — VERCEL DEPLOYMENT FIX

This version is specifically structured for Vercel. The previous 401 is an API authorization failure, usually because the Admin PIN configured in Vercel does not match the PIN entered on the page, or the old API deployment is still active.

1. Supabase
- Create a project at https://supabase.com/
- Open SQL Editor and run SUPABASE_SETUP.sql.
- In Project Settings > API, copy Project URL and the service_role key. Keep the service_role key private.

2. GitHub
- Replace the files in the GitHub repository connected to your Vercel project with all files from this ZIP.
- IMPORTANT: include the api folder and api/order.js. Do not upload only index.html.
- Commit and push the changes.

3. Vercel environment variables
In Vercel > Project > Settings > Environment Variables add:
SUPABASE_URL = your Supabase Project URL
SUPABASE_SERVICE_ROLE_KEY = your Supabase service_role key
ADMIN_PIN = choose your own PIN

Apply to Production (and Preview if needed), save, then go to Deployments and redeploy the latest commit. Enter exactly the same ADMIN_PIN in the webpage beside PUBLISH ORDER.

4. URLs
Admin: https://your-project.vercel.app/
TV display: https://your-project.vercel.app/?display=1

5. Verify
Open https://your-project.vercel.app/api/order in a browser. It should show JSON, not a Vercel 404/NOT_FOUND. If it reports missing environment variables, check the Vercel variables and redeploy.
If POST returns 401, the entered PIN and Vercel ADMIN_PIN do not match. If it returns 503, check Supabase URL/key/table.
