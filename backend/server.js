
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// MongoDB Schema
const surveySchema = new mongoose.Schema(
    {
        answers: [
            {
                question: {
                    type: String,
                    required: true
                },
                answer: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    { timestamps: true }
);

const Survey = mongoose.model("Survey", surveySchema);

// Backend health check
app.get("/", (req, res) => {
    res.status(200).send("Online Survey Backend is Working!");
});

// Save survey answers
app.post("/api/surveys", async (req, res) => {
    try {
        const { answers } = req.body;

        if (
            !Array.isArray(answers) ||
            answers.length !== 5 ||
            answers.some(
                item =>
                    !item ||
                    typeof item.question !== "string" ||
                    typeof item.answer !== "string" ||
                    !item.question.trim() ||
                    !item.answer.trim()
            )
        ) {
            return res.status(400).json({
                message: "Please answer all 5 questions."
            });
        }

        const survey = await Survey.create({
            answers: answers.map(item => ({
                question: item.question.trim(),
                answer: item.answer.trim()
            }))
        });

        res.status(201).json({
            message: "Survey submitted and saved successfully!",
            survey
        });

    } catch (error) {
        console.error("Survey submission error:", error);

        res.status(500).json({
            message: "Unable to save survey."
        });
    }
});

// View saved survey responses
app.get("/api/surveys", async (req, res) => {
    try {
        const surveys = await Survey.find()
            .sort({ createdAt: -1 });

        res.status(200).json(surveys);

    } catch (error) {
        console.error("Fetch surveys error:", error);

        res.status(500).json({
            message: "Unable to fetch survey responses."
        });
    }
});

// Start server and connect MongoDB
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in environment variables");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
