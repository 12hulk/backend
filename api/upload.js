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
    if (req.method === "POST") {
        const busboy = require("busboy");
        const bb = busboy({ headers: req.headers });
        let email, fileBuffer, fileName;

        bb.on("field", (fieldname, val) => {
            if (fieldname === "email") email = val;
        });

        bb.on("file", (fieldname, file, info) => {
            fileName = info.filename;
            file.on("data", (data) => {
                fileBuffer = data;
            });
        });

        bb.on("finish", async () => {
            if (!email || !fileBuffer) {
                return res.status(400).json({ error: "Invalid request" });
            }

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("public")
                .upload(`files/${fileName}`, fileBuffer, {
                    contentType: "application/octet-stream",
                });

            if (uploadError) {
                return res.status(500).json({ error: "Failed to upload file" });
            }

            const fileUrl = supabase.storage.from("public").getPublicUrl(uploadData.path).publicUrl;

            const { data: dbData, error: dbError } = await supabase
                .from("files")
                .insert({ user_email: email, file_name: fileName, file_url: fileUrl });

            if (dbError) {
                return res.status(500).json({ error: "Failed to save file in database" });
            }

            res.status(201).json({ message: "File uploaded successfully", file: dbData });
        });

        req.pipe(bb);
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}