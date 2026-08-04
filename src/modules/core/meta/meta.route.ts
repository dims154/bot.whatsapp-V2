import { Router } from "express";
import { MetaController } from "./controllers/meta.controller";

const router = Router();

router.get("/webhook", MetaController.verifyWebhook);

router.post("/webhook", MetaController.receiveWebhook);

export default router;