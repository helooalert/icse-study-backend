import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
    const { message, classLevel } = req.body;

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
- Basic practice questions
- Quick revision strategy`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        const data = await response.json();

        res.json({
            reply: data.choices[0].message.content
        });

    } catch (error) {
        res.status(500).json({
            error: "AI Error"
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
