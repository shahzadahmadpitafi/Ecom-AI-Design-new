import { Router } from "express";
import authRouter from "./auth";
import ordersRouter from "./orders";
import customersRouter from "./customers";
import analyticsRouter from "./analytics";
import notificationsRouter from "./notifications";
import productionRouter from "./production";

const adminRouter = Router();

adminRouter.use(authRouter);
adminRouter.use(ordersRouter);
adminRouter.use(customersRouter);
adminRouter.use(analyticsRouter);
adminRouter.use(notificationsRouter);
adminRouter.use(productionRouter);

export default adminRouter;
