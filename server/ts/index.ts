import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routers/index.js";

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(router);
app.all('/*', (req, res) => {
    res.status(404).send('Page not found!');
});

app.listen(PORT, () => {
    console.log(`At http://localhost:${PORT}`);
});

// ['./ts/**/*'] -> ['./ts']
