import "dotenv/config";
import express from "express";
import cors from "cors";

import notionRoutes from "./src/routes/notionRoutes.js";
import orderConfirmationRoutes from "./src/routes/orderConfirmationRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running ✅");
});

app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

app.use("/api/notion", notionRoutes);
app.use("/api/order-confirmation", orderConfirmationRoutes);
app.use("/api/contact", contactRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
