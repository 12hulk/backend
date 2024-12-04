import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);
// pages/api/register.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
        //const { email, password, username } = req.body;

        // Input validation
        //  if (!email || !password || !username) {
        //     return res.status(400).json({ error: 'All fields are required' });
        // }

        try {
            // Hash the password
            //  const hashedPassword = await bcrypt.hash(password, 10);

            // Log to check if hashing is working
            console.log('Hashed password:', hashedPassword);

            // Create user in Supabase
            // const { data, error } = await supabase.auth.signUp({
            //  email,
            //  password: hashedPassword,
            //});

            // if (error) {
            // console.log('Supabase error:', error);  // Log Supabase error
            r//eturn res.status(400).json({ error: error.message });
            //}

            // Optional: Add additional user info like username to a "users" table
            const { error: insertError } = await supabase
                .from('users')
                .insert([{ email: 'dil', username: 'dil', password: "hashedPassword" }]);

            if (insertError) {
                console.log('Insert error:', insertError);  // Log insert error
                return res.status(400).json({ error: insertError.message });
            }

            // Respond with success
            res.status(200).json({ message: 'User registered successfully', data });
        } catch (err) {
            console.error('Error occurred:', err);  // Log unexpected errors
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
