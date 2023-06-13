import { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import "dotenv/config";

type Token = {
    firstName: string,
    lastName: string,
    email: string, 
    password: string, 
    isMember: number
}

interface customReq extends Request {
    user: Token
}

const conn = await connectDB();

async function connectDB() {
    const db = await mysql.createConnection({
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
            insertionTimestamp BIGINT NOT NULL,
            isMember TINYINT NOT NULL,
            isDeleted TINYINT NOT NUll
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Books (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            imgUrl VARCHAR(255) NOT NULL,
            authorName VARCHAR(255) NOT NULL,
            descr VARCHAR(255) NOT NULL,
            yearPubl SMALLINT NOT NULL,
            numEdition TINYINT NOT NULL,
            insertionTimestamp BIGINT NOT NULL,
            idMember VARCHAR(255),
            borrowingTimestamp BIGINT,
            isDeleted TINYINT NOT NUll,
            FOREIGN KEY(idMember) REFERENCES Users(id)
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Fees (
            id VARCHAR(255) PRIMARY KEY,
            amount FLOAT NOT NULL,
            paymentTimestamp BIGINT NOT NULL,
            idMember VARCHAR(255) NOT NULL,
            FOREIGN KEY(idMember) REFERENCES Users(id)
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Suggestions (
            id VARCHAR(255) PRIMARY KEY,
            descr VARCHAR(255) NOT NULL,
            insertionTimestamp BIGINT NOT NULL,
            idMember VARCHAR(255) NOT NULL,
            idBook VARCHAR(255) NOT NULL,
            isDeleted TINYINT NOT NUll,
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

        (req as customReq).user = decoded;

        next();
    } catch (e) {
        return res.status(401).json({ msg: 'Access denied. Invalid token.' });
    }
}

export { conn, customReq, Token, findUser, authMiddleware };
