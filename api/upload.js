import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable';  // Correctly import IncomingForm
import fs from 'fs';

const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export const config = {
    api: {
        bodyParser: false,  // Disables Next.js default body parser for file upload
    },
};

export default async function handler(req, res) {
    // Set CORS headers to allow your frontend domain
    res.setHeader('Access-Control-Allow-Origin', 'https://file-sharing-website-five.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, file-name');

    // Handle preflight request (for CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle file upload (only POST method)
    if (req.method === 'POST') {
        const form = new IncomingForm();  // Use IncomingForm constructor correctly

        // Parse the incoming request to get the file data
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing the file upload:', err);
                return res.status(500).json({ error: 'Error parsing the file upload' });
            }

            // Log the fields and files to debug if necessary
            console.log('Fields:', fields);
            console.log('Files:', files);

            // Retrieve file information
            const file = files.file[0]; // Assuming the key is 'file'
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            try {
                // Read the file into a buffer
                const fileBuffer = await fs.promises.readFile(file.filepath);
                const fileName = file.originalFilename;
                const contentType = file.mimetype;

                // Upload the file to Supabase storage
                const { data, error: uploadError } = await supabase.storage
                    .from('uploads')  // Ensure your Supabase bucket is named 'uploads'
                    .upload(fileName, fileBuffer, {
                        contentType: contentType,
                        upsert: true, // Overwrite file if it exists
                    });

                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    return res.status(500).json({ error: uploadError.message });
                }

                // Get the public URL of the uploaded file
                const { publicURL, error: urlError } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(fileName);

                if (urlError) {
                    console.error('Error getting public URL:', urlError);
                    return res.status(500).json({ error: urlError.message });
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
