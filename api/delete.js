import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "https://file-sharing-website-five.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, file-name");

    if (req.method === "DELETE") {
        const { id } = req.query;

        const { data: file, error: fetchError } = await supabase
            .from("files")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !file) {
            return res.status(404).json({ error: "File not found" });
        }

        const filePath = `files/${file.file_name}`;
        const { error: deleteError } = await supabase.storage.from("public").remove([filePath]);

        if (deleteError) {
            return res.status(500).json({ error: "Failed to delete file from storage" });
        }

        const { error: dbError } = await supabase.from("files").delete().eq("id", id);

        if (dbError) {
            return res.status(500).json({ error: "Failed to delete file from database" });
        }

        res.status(200).json({ message: "File deleted successfully" });
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
