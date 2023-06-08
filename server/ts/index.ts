import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const PORT = 8080;
const app = express();
const conn = await connectDB();

type Token = {
    email: string, 
    password: string, 
    isMember: number
}

interface customReq extends express.Request {
    user: Token
}

async function connectDB() {
    const db = await mysql.createConnection({ /** */
        host: '127.0.0.1',
        user: 'root',
        password: process.env.DB_PASSWORD!,
        database: 'nfa021'
    });

    await db.execute(`CREATE TABLE IF NOT EXISTS Users (
            id VARCHAR(255) PRIMARY KEY,
            firstName VARCHAR(255) NOT NULL,
            lastName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            isMember INT NOT NULL,
            isDeleted INT NOT NUll
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Books (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            descr VARCHAR(255) NOT NULL,
            yearPubl INT NOT NULL,
            numEdition INT NOT NULL,
            idMember VARCHAR(255),
            isDeleted INT NOT NUll,
            FOREIGN KEY(idMember) REFERENCES Users(id)
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Fees (
            id VARCHAR(255) PRIMARY KEY,
            amount FLOAT NOT NULL,
            date INT NOT NULL,
            idMember VARCHAR(255) NOT NULL,
            FOREIGN KEY(idMember) REFERENCES Users(id)
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Suggestions (
            id VARCHAR(255) PRIMARY KEY,
            descr VARCHAR(255) NOT NULL,
            date INT NOT NULL,
            idMember VARCHAR(255) NOT NULL,
            idBook VARCHAR(255) NOT NULL,
            FOREIGN KEY(idMember) REFERENCES Users(id),
            FOREIGN KEY(idBook) REFERENCES Books(id)
        )`
    );

    return db;
}

async function findUser(email: string, password: string) {
    if (email && password) {
        const stmt = await conn.prepare(`SELECT * FROM Users WHERE email = ?`);
        const rows = await stmt.execute([email]) as any[][];

        if (rows[0].length) {
            const { password: hash_db, isMember } = rows[0][0];
            
            await stmt.close();

            if (password === hash_db) {
                return isMember;
            }
        }
    }

    return -1;
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-auth-token'];

    if (!token) {
        return res.status(401).json({ msg: 'Access denied. Token missing.' });
    }

    try {
        const decoded = jwt.verify(String(token), process.env.JWT_SECRET_KEY!) as Token;
        
        if (await findUser(decoded.email, decoded.password) === -1) {
            return res.status(401).json({ msg: 'Access denied. User not found.' });
        }

        (req as customReq).user = decoded; //

        next();
    } catch (e) {
        return res.status(401).json({ msg: 'Access denied. Invalid token.' });
    }
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/signup', async(req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const stmt = await conn.prepare(`INSERT INTO Users (id, firstName, lastName, email, password, isMember, isDeleted) VALUES (?, ?, ?, ?, ?, 1, 0)`);
    await stmt.execute([crypto.randomUUID(), firstName, lastName, email, hash]);
    await stmt.close();
    
    res.json({ msg: 'Successfully registred!' });
});

app.post('/login', async(req, res) => {
    let { email, password } = req.body;
    
    let msg = '';

    const token = req.headers['x-auth-token'];

    if (token) {
        try {
            const decoded = jwt.verify(String(token), process.env.JWT_SECRET_KEY!) as Token;
            const { email, password } = decoded;

            if (await findUser(email, password) !== -1) {
                return res.json({ msg: String(token) });
            }
        } catch (err) {}
    }

    if (email && password) {
       const stmt = await conn.prepare(`SELECT * FROM Users WHERE email = ?`);
       const rows = await stmt.execute([email]) as any[][];
       
       if (rows[0].length) {
           const { email, password: hash_db, isMember } = rows[0][0];
           
           if (bcrypt.compareSync(password, hash_db)) {
                msg = jwt.sign({ email, password: hash_db, isMember }, process.env.JWT_SECRET_KEY!);
            }        
        }
    
        await stmt.close();
    }

    if (msg !== '') {
        return res.json({ msg });
    } 

    return res.status(401).json({ msg: 'Unauthorized!' });
});

app.delete('/users/:id', authMiddleware, async(req, res) => {
    const { id } = req.params;

    if ((req as customReq).user.isMember === 0) {
        const stmt = await conn.prepare(`UPDATE Users SET isDeleted = 1 WHERE id = ?`);
        await stmt.execute([id]);
        await stmt.close();
    
        return res.json({ msg: 'Successfully deleted!' });
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

app.route('/books')
    .get(authMiddleware, async(req, res) => {
        const rows = await conn.query(`SELECT * FROM Books`) as any[][];
        res.json({ result: rows[0] });
    })
    .post(authMiddleware, async(req, res) => {

    });

app.route('/book/:id')
    .get(authMiddleware, async(req, res) => {
        const { id } = req.params;
        res.json({ result: '' });
    })
    .patch(authMiddleware, async(req, res) => {
        const { id } = req.params;
        res.json({ msg: '' });
    })
    .delete(authMiddleware, async(req, res) => {
        const { id } = req.params;
        res.json({ msg: '' });
    });

app.route('book/:id/suggest')
    .get(authMiddleware, async(req, res) => {
        const { id } = req.params;
        res.json({ result: '' });
    })
    .post(authMiddleware, async(req, res) => {
        const { id } = req.params;
        res.json({ msg: '' });
    });

app.listen(PORT, () => {
    console.log(`At http://127.0.0.1:${PORT}`);
});

// https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_unix-timestamp

// https://medium.com/geekculture/backend-design-software-pattern-for-authentication-authorization-ed86bbd17c9

// https://openclassrooms.com/en/courses/5614116-go-full-stack-with-node-js-express-and-mongodb/5656301-set-up-authentication-middleware

// https://github.com/1nevil/auth-in-mern
