import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import "dotenv/config";
import router from "./routers/index.js";

const PORT = 8080;
const app = express();

const redisClient = createClient();

redisClient.connect().catch(err => {
    console.log('Could not establish a connection with redis. ' + err);
});

const redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(session({
    store: redisStore,
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax'
    }
}));

app.use('/', router);

app.all('/*', (req, res) => {
    res.status(404).send('Page not found!');
});

app.listen(PORT, () => {
    console.log(`At http://localhost:${PORT}`);
});
