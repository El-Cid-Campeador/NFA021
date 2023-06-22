import express from "express";
import userRouter from "./user.js";
import bookRouter from "./book.js";
import { deserializeUser } from "../functions.js";

const router = express.Router();

router.use(deserializeUser);

router.use(userRouter);
router.use('/books', bookRouter);

export default router;
