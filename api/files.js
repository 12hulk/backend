import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export default async function handler(req, res) {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "https://file-sharing-website-five.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, file-name");

    // Handle preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Allow only GET requests
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        // Retrieve a list of files from the "uploads" bucket
        const { data: files, error } = await supabase.storage
            .from("uploads")
            .list("", { limit: 100, offset: 0 }); // Adjust limit and offset as needed

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(500).json({ message: "Error retrieving files from Supabase", error });
        }

        if (!files || files.length === 0) {
            return res.status(404).json({ message: "No files found in the bucket" });
        }

        // Map files to include public URLs
        const fileList = files.map((file) => ({
            filename: file.name,
            url: `https://ekdoxzpypavhtoklntqv.supabase.co/storage/v1/object/public/uploads/${file.name}`,
        }));

        return res.status(200).json(fileList); // Send the files as a JSON response
    } catch (error) {
        console.error("Error retrieving files:", error);
        return res.status(500).json({ message: "Failed to retrieve files", error });
    }
}
