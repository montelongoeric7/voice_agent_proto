import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = 3001;

// Enable CORS for the frontend
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));

app.use(express.json());

// Endpoint to create ephemeral tokens
app.get("/session", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2025-06-03",
        voice: "verse",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Created ephemeral token successfully");
    
    // Send back the JSON we received from the OpenAI REST API
    res.json(data);
  } catch (error) {
    console.error("Error creating ephemeral token:", error);
    res.status(500).json({ 
      error: "Failed to create ephemeral token",
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("Make sure your OPENAI_API_KEY is set in the .env file");
});