import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);
export default async function handler(req, res) {
    // Set CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request (for CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle file fetch request (GET method)
    if (req.method === 'GET') {
        const { userEmail } = req.query; // Get user email from query parameter

        if (!userEmail) {
            return res.status(400).json({ error: 'Email is required' });
        }

        try {
            // Fetch files from the 'files' table for the specific user
            const { data, error } = await supabase
                .from('files') // Your Supabase table name
                .select('file_name, file_url, uploaded_at')
                .eq('user_email', userEmail); // Query files by user email

            if (error) {
                return res.status(500).json({ error: 'Error fetching files from database.' });
            }

            return res.status(200).json({ files: data }); // Return the list of files
        } catch (err) {
            console.error("Error fetching files:", err);
            return res.status(500).json({ error: 'Error fetching files.' });
        }
    }

    // Handle unsupported methods
    else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}