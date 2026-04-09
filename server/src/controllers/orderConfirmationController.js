import { generateOrderConfirmationPdf } from "../services/pdf/orderConfirmationPdfService.js";
import { sendOrderConfirmationEmail } from "../services/email/orderConfirmationEmailService.js";

const validatePayload = (data) => {
    if (!data?.orderId) {
        throw new Error("Missing orderId.");
    }
    if (!data?.fullName) {
        throw new Error("Missing fullName.");
    }
    if (!data?.email) {
        throw new Error("Missing email.");
    }
};

export const downloadOrderConfirmationPdfController = async (req, res) => {
    try {
        const data = req.body;
        validatePayload(data);

        const pdfBuffer = await generateOrderConfirmationPdf(data);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="INDOEROPA-order-confirmation-${data.orderId}.pdf"`,
        );

        return res.send(pdfBuffer);
    } catch (err) {
        console.error("PDF generation failed:", err);
        return res.status(400).send(err.message || "Failed to generate PDF.");
    }
};

export const sendOrderConfirmationEmailController = async (req, res) => {
    try {
        const data = req.body;
        validatePayload(data);

        const pdfBuffer = await generateOrderConfirmationPdf(data);

        await sendOrderConfirmationEmail({
            to: data.email,
            orderId: data.orderId,
            pdfBuffer,
            customerName: data.fullName,
            itemsCount: data.itemsCount,
            totalAmountEUR: data.totalAmountEUR,
            totalAmountIDR: data.totalAmountIDR
        });

        return res.json({
            success: true,
            message: "Confirmation email sent successfully.",
        });
    } catch (err) {
        console.error("Confirmation email failed:", err);
        return res.status(400).send(err.message || "Failed to send confirmation email.");
    }
};
