import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable'; // Correct import for IncomingForm
import fs from 'fs';

// Initialize Supabase client
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export const config = {
    api: {
        bodyParser: false, // Disables Next.js default body parser for file upload
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://file-sharing-website-five.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, file-name');

    // Handle preflight request (for CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle file upload (POST method)
    if (req.method === 'POST') {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error parsing the file upload' });
            }

            // Retrieve file information (assuming the key is 'file')
            const file = files.file[0];
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            try {
                const fileBuffer = await fs.promises.readFile(file.filepath);
                const fileName = file.originalFilename;
                const contentType = file.mimetype;

                // Upload the file to Supabase storage
                const { data, error: uploadError } = await supabase.storage
                    .from('uploads') // Your Supabase bucket name
                    .upload(fileName, fileBuffer, {
                        contentType: contentType,
                        upsert: true, // Overwrite the file if it exists
                    });

                if (uploadError) {
                    return res.status(500).json({ error: uploadError.message });
                }

                // Get the public URL of the uploaded file
                const { publicURL, error: urlError } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(fileName);

                if (urlError) {
                    return res.status(500).json({ error: urlError.message });
                }

                // Respond with the public URL of the uploaded file
                return res.status(200).json({ publicURL });
            } catch (error) {
                console.error('File upload failed:', error);
                return res.status(500).json({ error: 'File upload failed' });
            }
        });
    }

    // Handle file deletion (DELETE method)
    else if (req.method === 'DELETE') {
        // The filename should be passed in the request body (ensure it's JSON)
        const { filename } = req.body; // You should send this from frontend

        if (!filename) {
            return res.status(400).json({ error: 'Filename is required' });
        }

        try {
            // Remove the file from Supabase storage
            const { error: deleteError } = await supabase.storage
                .from('uploads') // Your Supabase bucket name
                .remove([filename]);

            if (deleteError) {
                return res.status(500).json({ error: deleteError.message });
            }

            return res.status(200).json({ message: 'File deleted successfully' });
        } catch (error) {
            console.error('File deletion failed:', error);
            return res.status(500).json({ error: 'File deletion failed' });
        }
    }

    // Handle unsupported methods
    else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
