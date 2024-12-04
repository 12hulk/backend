import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, password, username } = req.body;

        // Input validation
        if (!email || !password || !username) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);



            // Optional: Add additional user info like username to a "users" table
            const { error: insertError } = await supabase
                .from('users')
                .insert([{ email: email, username: username, password: hashedPassword }]);  // Store the hashed password

            if (insertError) {
                return res.status(400).json({ error: insertError.message });
            }

            // Respond with success
            res.status(200).json({ message: 'User registered successfully', data });
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
