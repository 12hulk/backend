import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const pool = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);
// pages/api/register.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        try {
            const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

            if (existingUser.rows.length > 0) {
                return res.status(400).json({ message: "Email is already registered" });
            }

            //const salt = await bcrypt.genSalt(10);
            //const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await pool.query(
                "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
                [name, email, password]
            );

            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: newUser.rows[0].id,
                    name: newUser.rows[0].name,
                    email: newUser.rows[0].email,
                },
            });
        } catch (error) {
            console.error("Error during registration:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

