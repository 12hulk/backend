import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "https://file-sharing-website-five.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, file-name");

    if (req.method === "GET") {
        const { email } = req.query;

        const { data: files, error } = await supabase
            .from("files")
            .select("*")
            .eq("user_email", email);

        if (error) {
            return res.status(500).json({ error: "Failed to fetch files" });
        }

        res.status(200).json(files);
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
