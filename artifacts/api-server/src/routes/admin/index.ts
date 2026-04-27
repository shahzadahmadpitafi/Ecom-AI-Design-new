import { Router } from "express";
import authRouter from "./auth";
import ordersRouter from "./orders";
import customersRouter from "./customers";
import analyticsRouter from "./analytics";
import notificationsRouter from "./notifications";
import productionRouter from "./production";
import productsRouter from "./products";
import settingsRouter from "./settings";

const adminRouter = Router();

adminRouter.use(authRouter);
adminRouter.use(ordersRouter);
adminRouter.use(customersRouter);
adminRouter.use(analyticsRouter);
adminRouter.use(notificationsRouter);
adminRouter.use(productionRouter);
adminRouter.use(productsRouter);
adminRouter.use(settingsRouter);

export default adminRouter;
