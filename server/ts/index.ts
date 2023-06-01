import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const PORT = 8080;
const app = express();

async function connectDB() {
    const db = await mysql.createConnection({ /** */
        host: '127.0.0.1',
        user: 'root',
        password: process.env.DB_PASSWORD!,
        database: 'nfa021'
    });

    await db.execute(`CREATE TABLE IF NOT EXISTS User (
            id VARCHAR(255) PRIMARY KEY,
            firstName VARCHAR(255) NOT NULL,
            lastName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            isMember INT NOT NULL
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Book (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            descr VARCHAR(255) NOT NULL,
            yearPubl INT NOT NULL,
            numEdition INT NOT NULL,
            idMember VARCHAR(255),
            FOREIGN KEY(idMember) REFERENCES User(id)
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Fees (
            id VARCHAR(255) PRIMARY KEY,
            amount FLOAT NOT NULL,
            date INT NOT NULL,
            idMember VARCHAR(255) NOT NULL,
            FOREIGN KEY(idMember) REFERENCES User(id)
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Suggestion (
            id VARCHAR(255) PRIMARY KEY,
            descr VARCHAR(255) NOT NULL,
            date INT NOT NULL,
            idMember VARCHAR(255) NOT NULL,
            idBook VARCHAR(255) NOT NULL,
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
    const tokenVerif = req.headers['x-auth-token'];
    const { firstName, lastName, email, password } = req.body;

    async function isMember() {
        if (tokenVerif) {
            const decoded = jwt.verify(String(tokenVerif), process.env.JWT_SECRET_KEY!) as { id: string, email: string, hash: string, isMember: number };

            if (decoded) {
                const { email, hash } = decoded;
                if (email && hash) {
                    const stmt = await conn.prepare(`SELECT * FROM User WHERE email = ?`);
                    const rows = await stmt.execute([email]) as any[][];
            
                    if (rows[0].length) {
                        const { password: hash, isMember } = rows[0][0];
                        
                        if (bcrypt.compareSync(password, hash)) {
                            if (isMember === 0) {
                                return 0;
                            }
                        }        
                    }
                
                    await stmt.close();
                }
            }
        }

        return 1;
    };

    const conn = await connectDB();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const stmt = await conn.prepare(`INSERT INTO User (id, firstName, lastName, email, password, isMember) VALUES (?, ?, ?, ?, ?, ?)`);
    await stmt.execute([crypto.randomUUID(), firstName, lastName, email, hash, isMember()]);
    await stmt.close();

    await conn.end();
    
    res.json({ msg: 'Successfully registred!' });
});

app.post('/login', async(req, res) => {
    let { email, password } = req.body;
    const conn = await connectDB();
    
    let msg = 'Error!';

    const tokenVerif = req.headers['x-auth-token'];

    if (tokenVerif) {
        const decoded = jwt.verify(String(tokenVerif), process.env.JWT_SECRET_KEY!) as { id: string, email: string, hash: string, isMember: number };
        
        if (decoded) {
            email = decoded.email;
            password = decoded.hash;
        }
    }

    if (email && password) {
        const stmt = await conn.prepare(`SELECT * FROM User WHERE email = ?`);
        const rows = await stmt.execute([email]) as any[][];

        if (rows[0].length) {
            const { id, email, password: hash, isMember } = rows[0][0];
            
            if (bcrypt.compareSync(password, hash)) {
                msg = jwt.sign({ id, email, hash, isMember }, process.env.JWT_SECRET_KEY!, { expiresIn: '24h' });
            }        
        }
    
        await stmt.close();
    }

    await conn.end();

    res.json({ msg: msg });
});

// app.route('/books')
//     .get(async(req, res) => {
//         res.json({ result: [] });
//     })
//     .post(async(req, res) => {

//     });

// app.route('/book/:id')
//     .get(async(req, res) => {
//         const { id } = req.params;
//         res.json({ result: '' });
//     })
//     .patch(async(req, res) => {
//         const { id } = req.params;
//         res.json({ msg: '' });
//     })
//     .delete(async(req, res) => {
//         const { id } = req.params;
//         res.json({ msg: '' });
//     });

// app.route('book/:id/suggest')
//     .get(async(req, res) => {
//         const { id } = req.params;
//         res.json({ result: '' });
//     })
//     .post(async(req, res) => {
//         const { id } = req.params;
//         res.json({ msg: '' });
//     });

app.listen(PORT, () => {
    console.log(`At http://127.0.0.1:${PORT}`);
});

// https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_unix-timestamp
