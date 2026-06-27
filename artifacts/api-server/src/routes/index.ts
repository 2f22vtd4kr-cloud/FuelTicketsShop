import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import stationsRouter from "./stations";
import pricesRouter from "./prices";
import vouchersRouter from "./vouchers";
import analyticsRouter from "./analytics";
import adminRouter from "./admin";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/stations", stationsRouter);
router.use("/prices", pricesRouter);
router.use("/vouchers", vouchersRouter);
router.use("/analytics", analyticsRouter);
router.use("/admin", adminRouter);
router.use("/payments", paymentsRouter);

export default router;
