import { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import { SessionData } from "express-session";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
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
            id VARCHAR(255) PRIMARY KEY,
            firstName LONGTEXT NOT NULL,
            lastName LONGTEXT NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password LONGTEXT NOT NULL,
            isMember TINYINT UNSIGNED NOT NULL,
            isDeleted TINYINT UNSIGNED NOT NUll,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Books (
            id VARCHAR(255) PRIMARY KEY,
            title LONGTEXT NOT NULL,
            imgUrl LONGTEXT NOT NULL,
            authorName LONGTEXT NOT NULL,
            category LONGTEXT NOT NULL,
            lang VARCHAR(255) NOT NULL,
            descr LONGTEXT NOT NULL,
            yearPubl SMALLINT UNSIGNED NOT NULL,
            numEdition TINYINT UNSIGNED NOT NULL,
            nbrPages SMALLINT UNSIGNED NOT NULL,
            memberId VARCHAR(255),
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
            memberId VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY(memberId) REFERENCES Users(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Suggestions (
            id VARCHAR(255) PRIMARY KEY,
            descr LONGTEXT NOT NULL,
            memberId VARCHAR(255) NOT NULL,
            bookId VARCHAR(255) NOT NULL,
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
    const { firstName, lastName, email, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    
    const sql = `INSERT INTO Users (id, firstName, lastName, email, password, isMember, isDeleted) VALUES (?, ?, ?, ?, ?, ?, 0)`;
    const stmt = await conn.prepare(sql);
    await stmt.execute([crypto.randomUUID(), firstName, lastName, email, hash, isMember]);
    conn.unprepare(sql);
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const sessionUser = req.session as UserSession;
    if (!sessionUser.user) {
        return res.status(401).send('Unauthorized');
    } 

    next();
}

function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    const sessionUser = req.session as UserSession;

    if (sessionUser.user!.isMember === 0) {
        return next();
    }

    res.status(403).json({ msg: 'Access denied!' });
}

export { conn, UserSession, createUser, authMiddleware, adminMiddleware };
