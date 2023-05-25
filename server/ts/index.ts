import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const PORT = 8080;
const app = express();

async function connectDB() {
    const db = await mysql.createConnection({ /** */
        host: '127.0.0.1',
        user: 'root',
        password: 'Ur@nium235',
        database: 'nfa021'
    });

    await db.execute(`CREATE TABLE IF NOT EXISTS User (
            id TEXT PRIMARY KEY,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            isMember INT NOT NULL
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Book (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            descr TEXT NOT NULL,
            yearPubl INT NOT NULL,
            numEdition INT NOT NULL,
            idMember TEXT,
            FOREIGN KEY(idMember) REFERENCES User(id)
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Fees (
            id TEXT PRIMARY KEY,
            amount FLOAT NOT NULL,
            date INT NOT NULL,
            idMember TEXT NOT NULL,
            FOREIGN KEY(idMember) REFERENCES User(id)
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Suggestion (
            id TEXT PRIMARY KEY,
            descr TEXT NOT NULL,
            date INT NOT NULL,
            idMember TEXT NOT NULL,
            idBook TEXT NOT NULL,
            FOREIGN KEY(idMember) REFERENCES User(id),
            FOREIGN KEY(idBook) REFERENCES Book(id)
        )`
    );

    return db;
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/signup', async(req, res) => {
    const id = crypto.randomUUID();
    const { firstName, lastName, email, password } = req.body;
    const conn = await connectDB();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    await conn.execute(`INSERT INTO User (id, firstName, lastName, email, password, isMember) VALUES (?, ?, ?, ?, ?, 1)`, (err: Error, stmt: mysql.PrepareStatementInfo) => {
        stmt.execute([crypto.randomUUID(), firstName, lastName, email, hash]);
        stmt.close();
    });

    await conn.end();
    
    res.json({ });
});

app.post('/login', async(req, res) => {
    const { email, password } = req.body;
    const conn = await connectDB();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    await conn.execute(`SELECT * FROM User WHERE email = ? AND password = ?`, (err: Error, stmt: mysql.PrepareStatementInfo) => {
        stmt.execute([email, hash], (err, rows) => {
            if (rows) {

            } else {
                // j
            }
        });
        stmt.close();
    });

    await conn.end();

    res.json({ msg: '' });
});

app.route('/books')
    .get(async(req, res) => {
        res.json({ result: [] });
    })
    .post(async(req, res) => {

    });

app.route('/book/:id')
    .get(async(req, res) => {
        const { id } = req.params;
        res.json({ result: '' });
    })
    .patch(async(req, res) => {
        const { id } = req.params;
        res.json({ msg: '' });
    })
    .delete(async(req, res) => {
        const { id } = req.params;
        res.json({ msg: '' });
    });

app.route('book/:id/suggest')
    .get(async(req, res) => {
        const { id } = req.params;
        res.json({ result: '' });
    })
    .post(async(req, res) => {
        const { id } = req.params;
        res.json({ msg: '' });
    });

app.listen(PORT, () => {
    console.log(`At http://127.0.0.1:${PORT}`);
});

// https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_unix-timestamp
