import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "your-anon-key"
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
    if (req.method === "POST") {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        try {


            res.status(200).json({
                message: "Login successful",
                token: "yes", // Replace this with actual token generation if needed
            });
        } catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}