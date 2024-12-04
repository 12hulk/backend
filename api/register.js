import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { name } = req.body;

        // Validate inputs
        if (!name || !email || !password_hash) {
            return res.status(400).json({ message: "All fields (name, email, password_hash) are required" });
        }

        try {
            // Insert new user into the 'users' table
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        name

                    }
                ]);

            // Check for any error during the insert operation
            if (error) {
                console.error("Error inserting user:", error.message);
                return res.status(500).json({ message: "Error inserting user", error: error.message });
            }

            // If insertion was successful, respond with success
            res.status(201).json({
                message: "User created successfully",
                user: data[0], // Return the created user data
            });

        } catch (err) {
            // Handle any unexpected errors
            console.error("Unexpected error:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    } else {
        // Handle non-POST requests
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
