import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable';
import fs from 'fs';

// Initialize Supabase client

const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export const config = {
    api: {
        bodyParser: false, // Disable Next.js default body parser for file upload
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://file-sharing-website-five.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, file-name');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error parsing the file upload' });
            }

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
                    .from('public') // Your Supabase bucket name
                    .upload(fileName, fileBuffer, {
                        contentType: contentType,
                        upsert: true,
                    });

                if (uploadError) {
                    return res.status(500).json({ error: uploadError.message });
                }

                // Get the public URL of the uploaded file
                const { publicURL, error: urlError } = supabase.storage
                    .from('public') // Your Supabase bucket name
                    .getPublicUrl(fileName);

                if (urlError) {
                    return res.status(500).json({ error: urlError.message });
                }

                // Insert file details into the `files` table
                const { data: fileData, error: insertError } = await supabase
                    .from('files')
                    .insert([
                        {
                            user_email: fields.email, // Assuming 'email' is passed in the form data
                            file_name: fileName,
                            file_url: publicURL,
                            uploaded_at: new Date(),
                        },
                    ]);

                if (insertError) {
                    return res.status(500).json({ error: insertError.message });
                }

                // Respond with the public URL of the uploaded file
                return res.status(200).json({ publicURL });
            } catch (error) {
                console.error('File upload failed:', error);
                return res.status(500).json({ error: 'File upload failed' });
            }
        });
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
