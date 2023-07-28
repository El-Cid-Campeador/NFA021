import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import "dotenv/config";
import path from 'path';
import router from "./routers/index.js";

function checkIfEnvProduction() {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'production';
}

const PORT = process.env.PORT || 8080;
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
app.use(cors({ 
    origin: 'http://localhost:5173', 
    credentials: true 
}));

app.use(session({
    store: redisStore,
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/api',
        // secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: checkIfEnvProduction() ? 'strict' : 'lax',
    }
}));

app.use('/api', router);

app.use(express.static('../client/dist'));

app.get('*', (req, res) => {
    res.sendFile(path.resolve('..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`At http://localhost:${PORT}`);
});
