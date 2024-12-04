import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const pool = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);


export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        try {
            // Check if user already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingUser) {
                return res.status(400).json({ message: "Email is already registered" });
            }

            // Hash the password



            // Insert the new user
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{ name, email, password_hash: password }])
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                },
            });
        } catch (error) {
            console.error("Error during registration:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}
