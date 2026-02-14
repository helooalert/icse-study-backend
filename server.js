import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

// ====== MONGODB CONNECTION ======
mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
    name: String,
    classLevel: String,
    date: String,
    count: Number
});

const User = mongoose.model("User", userSchema);

// ====== CHAT ROUTE ======
app.post("/chat", async (req, res) => {

    const { message, name, classLevel } = req.body;
    const today = new Date().toDateString();

    let user = await User.findOne({ name });

    if(!user || user.date !== today) {
        user = new User({
            name,
            classLevel,
            date: today,
            count: 0
        });
    }

    if(user.count >= 25) {
        return res.json({ reply: "❗ Daily limit reached." });
    }

    try {

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert ICSE tutor for Class ${classLevel}.
First ask psychological questions.
Then generate:
- 1 day study plan
- Important formulas
- Practice questions`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        const data = await response.json();

        user.count += 1;
        await user.save();

        res.json({
            reply: data.choices[0].message.content
        });

    } catch (error) {
        res.status(500).json({ error: "AI Error" });
    }
});

// ====== ADMIN ROUTE ======
app.get("/admin", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
