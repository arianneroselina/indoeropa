import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { renderOrderConfirmationHtml } from "./orderConfirmationTemplate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getLogoDataUrl = async () => {
    try {
        const logoPath = path.resolve(__dirname, "../../assets/logo.png");
        const logoBuffer = await fs.readFile(logoPath);
        return `data:image/png;base64,${logoBuffer.toString("base64")}`;
    } catch (err) {
        console.warn("Logo could not be loaded:", err.message);
        return "";
    }
};

export const generateOrderConfirmationPdf = async (data) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage();

        const logoDataUrl = await getLogoDataUrl();

        await page.setContent(
            renderOrderConfirmationHtml({
                ...data,
                logoDataUrl,
            }),
            {
                waitUntil: "networkidle0",
            },
        );

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
};
