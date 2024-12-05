import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export const config = {
    api: {
        bodyParser: false, // Disable Next.js body parsing for file uploads
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://file-sharing-website-two.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        // Respond with a status 200 OK for the preflight request
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);
        const fileName = req.headers['file-name']; // File name from headers
        const contentType = req.headers['content-type']; // Content type from headers

        if (!fileName || !buffer.length) {
            return res.status(400).json({ error: 'Invalid file data' });
        }

        // Upload the file to Supabase Storage
        const { data, error } = await supabase.storage
            .from('uploads') // Replace with your bucket name
            .upload(fileName, buffer, {
                contentType,
            });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Generate a public URL for the uploaded file
        const { publicURL, error: urlError } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);

        if (urlError) {
            return res.status(500).json({ error: urlError.message });
        }

        return res.status(200).json({ publicURL });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
