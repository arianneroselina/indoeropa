import { generateOrderConfirmationPdf } from "../services/pdf/orderConfirmationPdfService.js";
import { sendOrderConfirmationEmail } from "../services/email/orderConfirmationEmailService.js";

const validatePayload = (data) => {
    if (!data || typeof data !== "object") {
        throw new Error("Missing order confirmation payload.");
    }

    if (!data.orderId) {
        throw new Error("Missing orderId.");
    }

    if (!data.buyerFullName) {
        throw new Error("Missing buyerFullName.");
    }

    if (!data.buyerEmail) {
        throw new Error("Missing buyerEmail.");
    }
};

const getSafeFileNamePart = (value) => {
    return String(value || "order").replace(/[^a-zA-Z0-9-_]/g, "-");
};

export const downloadOrderConfirmationPdfController = async (req, res) => {
    try {
        const successPayload = req.body;
        validatePayload(successPayload);

        const pdfBuffer = await generateOrderConfirmationPdf(successPayload);
        const safeOrderId = getSafeFileNamePart(successPayload.orderId);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="INDOEROPA-order-confirmation-${safeOrderId}.pdf"`,
        );

        return res.send(pdfBuffer);
    } catch (err) {
        console.error("PDF generation failed:", err);
        return res.status(400).send(err.message || "Failed to generate PDF.");
    }
};

export const sendOrderConfirmationEmailController = async (req, res) => {
    try {
        const successPayload = req.body;
        validatePayload(successPayload);

        const pdfBuffer = await generateOrderConfirmationPdf(successPayload);

        await sendOrderConfirmationEmail({
            to: successPayload.buyerEmail,
            pdfBuffer,
            successPayload,
        });

        return res.json({
            success: true,
            message: "Confirmation email sent successfully.",
        });
    } catch (err) {
        console.error("Confirmation email failed:", err);
        return res
            .status(400)
            .send(err.message || "Failed to send confirmation email.");
    }
};
