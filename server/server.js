import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

app.post("/api/checkout", async (req, res) => {
    try {
        const {
            fullName,
            address,
            email,
            phone,
            paymentMethod,
            cartItems,
            totalEUR,
            totalIDR,
            customsFeeEUR,
        } = req.body;

        // Create order summary string
        const itemsText = cartItems
            .map(
                (item, i) =>
                    `${i + 1}. ${item.packageTypeLabel} | ${item.fromCountry}→${item.toCountry} | €${item.priceEur} x ${item.quantity}`
            )
            .join("\n");

        const response = await notion.pages.create({
            parent: { database_id: process.env.NOTION_DATABASE_ID },
            properties: {
                Name: {
                    title: [{ text: { content: `Order - ${fullName}` } }],
                },
                "Full Name": {
                    rich_text: [{ text: { content: fullName } }],
                },
                Address: {
                    rich_text: [{ text: { content: address } }],
                },
                Email: { email },
                Phone: { phone_number: phone },
                "Payment Method": {
                    rich_text: [{ text: { content: paymentMethod } }],
                },
                "Total EUR": { number: Number(totalEUR) },
                "Total IDR": { number: Number(totalIDR) },
                "Customs Fee EUR": { number: Number(customsFeeEUR) },
                Items: {
                    rich_text: [{ text: { content: itemsText } }],
                },
                "Paid At": {
                    date: { start: new Date().toISOString() },
                },
            },
        });

        res.json({ success: true, notionId: response.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to write to Notion" });
    }
});

app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);
