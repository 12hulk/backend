import { createClient } from "@supabase/supabase-js";

// Replace these with your Supabase project details
const supabase = createClient(
    "https://ekdoxzpypavhtoklntqv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZG94enB5cGF2aHRva2xudHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzQ3NDAsImV4cCI6MjA0ODY1MDc0MH0.FyHH1ee-dfBThvAUeL4SaqCO6sJZzQ-2Scnnv-bInOA"
);

export default async function handler(req, res) {


    if (req.method === "POST") {

        const { name, email, password } = req.body;

        const { error } = await supabase
            .from('users')
            .insert({ name: "dil", email: "dil", password_hash: "dil" })

        res.send("success");
    }


    // res.send("hi");
}
