// api/get-data.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project details
const supabase = createClient('https://ekdoxzpypavhtoklntqv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA');
import bcrypt from "bcryptjs";


export default async function handler(req, res) {
    if (req.method === "POST") {
        const { name, email, password } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        try {
            // Check if the email is already registered
            const { data: existingUser, error: existingUserError } = await supabase
                .from("users")
                .select("*")
                .eq("email", email);

            if (existingUserError) throw existingUserError;

            if (existingUser.length > 0) {
                return res.status(400).json({ message: "Email is already registered" });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert the new user into the database
            const { data: newUser, error: insertError } = await supabase
                .from("users")
                .insert([
                    {
                        name,
                        email,
                        password_hash: hashedPassword,
                    },
                ])
                .select("id, name, email");

            if (insertError) throw insertError;

            res.status(201).json({
                message: "User registered successfully",
                user: newUser[0],
            });
        } catch (error) {
            console.error("Error during registration:", error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
