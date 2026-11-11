
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Schema
const surveySchema = new mongoose.Schema(
    {
        answers: [
            {
                question: String,
                answer: String
            }
        ]
    },
    { timestamps: true }
);

const Survey = mongoose.model("Survey", surveySchema);

// Check backend
app.get("/", (req, res) => {
    res.send("Online Survey Backend is Working!");
});

// Save survey answers
app.post("/api/surveys", async (req, res) => {
    try {
        if (!Array.isArray(req.body.answers) ||
            req.body.answers.length !== 5 ||
            req.body.answers.some(
                item => !item.question || !item.answer
            )) {
            return res.status(400).json({
                message: "Please answer all 5 questions."
            });
        }

        const survey = await Survey.create({
            answers: req.body.answers
        });

        res.status(201).json({
            message: "Survey submitted and saved successfully!",
            survey
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to save survey.",
            error: error.message
        });
    }
});

// View saved survey responses
app.get("/api/surveys", async (req, res) => {
    try {
        const surveys = await Survey.find().sort({ createdAt: -1 });
        res.json(surveys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Connect MongoDB and start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");

        app.listen(process.env.PORT || 5000, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
    });
