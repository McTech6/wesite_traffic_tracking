import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;
const TELEX_WEBHOOK_URL = process.env.TELEX_WEBHOOK_URL;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve integration.json file
app.get("/integration", (req, res) => {
    res.sendFile(path.join(__dirname, "../integration.json"));
});

// Main route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Website Traffic Monitor API!" });
});

// Tick route - handles webhook action
app.post("/tick", async (req, res) => {
    try {
        const { ip, userAgent } = req.body;

        if (!ip || !userAgent) {
            return res.status(400).json({ success: false, error: "Missing required fields: ip and userAgent" });
        }

        const webhookMessage = {
            event_name: "New Website Visit",
            username: "WebsiteTracker",
            status: "success",
            message: `New Visit Detected!\nIP: ${ip}\nUser Agent: ${userAgent}`
        };

        const response = await axios.post(TELEX_WEBHOOK_URL, webhookMessage);

        res.status(200).json({ success: true, message: "Visit tracked successfully." });
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error sending to Telex:", error.response?.data || error.message);
        res.status(500).json({ success: false, error: "Failed to send message to Telex.im." });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
