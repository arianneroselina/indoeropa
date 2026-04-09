import express from "express";
import { sendContactEmail } from "../services/email/contactEmailService.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                error: "name, email, subject, and message are required",
            });
        }

        await sendContactEmail({
            name: String(name).trim(),
            email: String(email).trim(),
            phone: phone ? String(phone).trim() : "",
            subject: String(subject).trim(),
            message: String(message).trim(),
        });

        return res.json({ ok: true });
    } catch (err) {
        console.error("Contact email error:", err);
        return res.status(500).json({
            error: "Failed to send contact message",
            message: err.message,
        });
    }
});

export default router;
