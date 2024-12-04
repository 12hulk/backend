import { createClient } from "@supabase/supabase-js";
import { IncomingForm } from "formidable";

// Initialize Supabase Client
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export const config = {
    api: {
        bodyParser: false, // Disabling default body parser to handle file uploads
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://file-sharing-website-vuzt.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        // Respond with a status 200 OK for the preflight request
        return res.status(200).end();
    }
    if (req.method === "POST") {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ message: "Error parsing form data", error: err });
            }

            const file = files.file[0];
            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            try {
                // Upload to Supabase Storage
                const { data, error } = await supabase.storage
                    .from("uploads")
                    .upload(`public/${Date.now()}_${file.originalFilename}`, file.file, {
                        contentType: file.mimetype,
                    });

                if (error) {
                    return res.status(500).json({ message: "Error uploading to Supabase", error });
                }

                // Insert file metadata into PostgreSQL database
                const result = await pool.query(
                    "INSERT INTO files (filename, file_path, mime_type, size) VALUES ($1, $2, $3, $4) RETURNING *",
                    [file.originalFilename, data.Key, file.mimetype, file.size]
                );

                // Respond with success message and file metadata
                res.status(200).json({
                    message: "File uploaded successfully!",
                    file: result.rows[0],
                });
            } catch (error) {
                console.error("Error during file upload:", error);
                res.status(500).json({ message: "File upload failed", error });
            }
        });
    } else {
        // Return method not allowed for non-POST requests
        res.status(405).json({ message: "Method not allowed" });
    }
}
