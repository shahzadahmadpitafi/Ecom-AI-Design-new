import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import catalogRouter from "./catalog";
import designsRouter from "./designs";
import quotesRouter from "./quotes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(catalogRouter);
router.use(designsRouter);
router.use(quotesRouter);

export default router;
