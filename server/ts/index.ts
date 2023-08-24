import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import "dotenv/config";
import path from "node:path";
import router from "./routers/index.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkIfEnvProduction() {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'production';
}

const PORT = process.env.SERVER_PORT || 8080;
const app = express();

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:6379`
});

redisClient.connect().catch(err => {
    console.log('Could not establish a connection with redis. ' + err);
});

const redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
});

const allowedDomains = ['http://localhost:5173'];

app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ 
    origin: function (origin, callback) {
        if (!origin || allowedDomains.indexOf(origin) != -1) {
            callback(null, true);

            return;
        } else {
            callback(new Error('Not allowed by CORS'));

            return;
        }
    },
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
    credentials: true 
}));

app.use(session({
    store: redisStore,
    secret: process.env.SECRET_KEY || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        // secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8,
        sameSite: checkIfEnvProduction() ? 'strict' : 'lax',
    }
}));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof Error && err.message === 'Not allowed by CORS') {
        res.status(403).json({ error: 'CORS not allowed' });
    } else {
        next(err);
    }
});

app.use('/api', router);

app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
