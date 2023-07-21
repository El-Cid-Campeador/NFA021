import express from "express";
import userRouter from "./user/index.js";
import bookRouter from "./book.js";

const router = express.Router();

router.use('/', userRouter);
router.use('/books', bookRouter);

export default router;
