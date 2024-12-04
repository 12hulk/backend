import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://file-sharing-website-vuzt.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        // Respond with a status 200 OK for the preflight request
        return res.status(200).end();
    }
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        // Retrieve a list of files from the "uploads" bucket
        const { data, error } = await supabase.storage
            .from("uploads")
            .list("", { limit: 100, offset: 0 });

        if (error) {
            return res.status(500).json({ message: "Error retrieving files from Supabase", error });
        }

        // If files are retrieved, send them back to the client as an array
        const files = data.map((file) => ({
            filename: file.name,
            file_path: `https://ekdoxzpypavhtoklntqv.supabase.co/storage/v1/object/public/uploads/${file.name}`,
        }));

        res.status(200).json(files); // Send the files as an array
    } catch (error) {
        console.error("Error retrieving files:", error);
        res.status(500).json({ message: "Failed to retrieve files", error });
    }
}
