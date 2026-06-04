import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { renderOrderConfirmationHtml } from "./orderConfirmationTemplate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

const launchBrowser = async () => {
    if (isProduction) {
        const puppeteer = (await import("puppeteer-core")).default;
        const chromium = (await import("@sparticuz/chromium")).default;

        return puppeteer.launch({
            args: [
                ...chromium.args,
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
            ],
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport,
        });
    }

    const puppeteer = (await import("puppeteer")).default;

    return puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
        ],
    });
};

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

/**
 * @param {SuccessPayload} successPayload
 * @returns {Promise<Buffer>}
 */
export const generateOrderConfirmationPdf = async (successPayload) => {
    let browser;

    try {
        browser = await launchBrowser();

        const page = await browser.newPage();

        page.setDefaultTimeout(30000);
        page.setDefaultNavigationTimeout(30000);

        const logoDataUrl = await getLogoDataUrl();

        const html = renderOrderConfirmationHtml({
            ...successPayload,
            logoDataUrl,
        });

        await page.setContent(html, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        await page.emulateMediaType("screen");

        await page.waitForSelector(".page", {
            timeout: 10000,
        });

        try {
            await page.evaluateHandle("document.fonts.ready");
        } catch {
            // Do not fail PDF generation if font loading is unavailable/blocked.
        }

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
        });

        await page.close();

        return pdfBuffer;
    } catch (err) {
        console.error("generateOrderConfirmationPdf failed:", err);
        throw err;
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeErr) {
                console.warn("Browser close failed:", closeErr.message);
            }
        }
    }
};
