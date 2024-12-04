import { createClient } from "@supabase/supabase-js";
import { IncomingForm } from "formidable";

// Initialize Supabase Client
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",  // Your Supabase URL
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"  // Your Supabase Anon Key
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
        return res.status(200).end();
    }

    if (req.method === "POST") {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Error parsing form data:", err);
                return res.status(500).json({ message: "Error parsing form data", error: err });
            }

            const file = files.file ? files.file[0] : null;
            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            try {
                // Upload file to Supabase Storage
                const { data, error } = await supabase.storage
                    .from("uploads") // Assuming your bucket is named 'uploads'
                    .upload(`public/${Date.now()}_${file.originalFilename}`, file.file, {
                        contentType: file.mimetype,
                    });

                if (error) {
                    console.error("Error uploading to Supabase:", error);
                    return res.status(500).json({ message: "Error uploading to Supabase", error });
                }

                // Save file metadata in Supabase database (PostgreSQL)
                const { data: metadata, error: metadataError } = await supabase
                    .from("files")  // Assuming you have a 'files' table
                    .insert([
                        {
                            filename: file.originalFilename,
                            file_path: data.Key,  // The Supabase storage path
                            mime_type: file.mimetype,
                            size: file.size,
                        }
                    ])
                    .single(); // Ensures we get a single row back

                if (metadataError) {
                    console.error("Error saving metadata:", metadataError);
                    return res.status(500).json({ message: "Error saving file metadata", error: metadataError });
                }

                // Respond with success message and file metadata
                res.status(200).json({
                    message: "File uploaded successfully!",
                    file: metadata, // Return file metadata
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
