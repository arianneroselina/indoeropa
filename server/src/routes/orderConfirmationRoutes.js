import express from "express";
import {
    downloadOrderConfirmationPdfController,
    sendOrderConfirmationEmailController,
} from "../controllers/orderConfirmationController.js";

const router = express.Router();

router.post("/pdf", downloadOrderConfirmationPdfController);
router.post("/email", sendOrderConfirmationEmailController);

export default router;
