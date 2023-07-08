import { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import { SessionData } from "express-session";
import bcrypt from "bcrypt";
import "dotenv/config";

type User = { 
    id: string,
    firstName: string, 
    lastName: string, 
    isMember: number 
}

interface UserSession extends SessionData {
    user?: User
}

const conn = await connectDB();

async function connectDB() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD!,
        database: 'nfa021'
    });

    await conn.execute(`CREATE TABLE IF NOT EXISTS Users (
            id VARCHAR(12) PRIMARY KEY,
            firstName VARCHAR(50) NOT NULL,
            lastName VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            isMember TINYINT UNSIGNED NOT NULL,
            isDeleted TINYINT UNSIGNED NOT NUll,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Books (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            imgUrl VARCHAR(255) NOT NULL,
            authorName VARCHAR(50) NOT NULL,
            category VARCHAR(50) NOT NULL,
            lang VARCHAR(255) NOT NULL,
            descr LONGTEXT NOT NULL,
            yearPubl SMALLINT UNSIGNED NOT NULL,
            numEdition TINYINT UNSIGNED NOT NULL,
            nbrPages SMALLINT UNSIGNED NOT NULL,
            memberId VARCHAR(12),
            borrowedAt TIMESTAMP DEFAULT 0,
            isDeleted TINYINT UNSIGNED NOT NUll,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY(memberId) REFERENCES Users(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Fees (
            id VARCHAR(255) PRIMARY KEY,
            amount FLOAT NOT NULL,
            year SMALLINT UNSIGNED NOT NULL,
            memberId VARCHAR(12) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY(memberId) REFERENCES Users(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Suggestions (
            id VARCHAR(255) PRIMARY KEY,
            descr LONGTEXT NOT NULL,
            memberId VARCHAR(12) NOT NULL,
            bookId VARCHAR(36) NOT NULL,
            isDeleted TINYINT UNSIGNED NOT NUll,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY(memberId) REFERENCES Users(id),
            FOREIGN KEY(bookId) REFERENCES Books(id)
        )`
    );

    return conn;
}

async function createUser(req: Request, isMember: number) {
    const { id, firstName, lastName, email, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    
    const sql = `INSERT INTO Users (id, firstName, lastName, email, password, isMember, isDeleted) VALUES (?, ?, ?, ?, ?, ?, 0)`;
    const stmt = await conn.prepare(sql);
    await stmt.execute([id, firstName, lastName, email, hash, isMember]);
    conn.unprepare(sql);
}

async function checkIfMemberExists(id: string) {
    const sql = `SELECT id FROM Users WHERE isMember = 1 AND id = ?`;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([id]) as any[][];
    conn.unprepare(sql);

    return rows[0][0] ? true : false;
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const sessionUser = req.session as UserSession;
    
    if (sessionUser.user && (sessionUser.user.isMember === 0 || sessionUser.user.isMember === 1)) {
        return next();
    } 
    
    res.status(401).send('Unauthorized!');
}

function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    const sessionUser = req.session as UserSession;

    if (sessionUser.user && sessionUser.user.isMember === 0) {
        return next();
    }

    res.status(403).send('Access denied!');
}

export { conn, UserSession, createUser, checkIfMemberExists, authMiddleware, adminMiddleware };
