import { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import "dotenv/config";

const conn = await connectDB();

async function connectDB() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD!,
        database: 'nfa021'
    });

    await db.execute(`CREATE TABLE IF NOT EXISTS Users (
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

    await db.execute(`CREATE TABLE IF NOT EXISTS Books (
            id VARCHAR(255) PRIMARY KEY,
            title LONGTEXT NOT NULL,
            imgUrl LONGTEXT NOT NULL,
            authorName LONGTEXT NOT NULL,
            category LONGTEXT NOT NULL,
            lang VARCHAR(255) NOT NULL,
            descr LONGTEXT NOT NULL,
            yearPubl SMALLINT UNSIGNED NOT NULL,
            numEdition TINYINT UNSIGNED NOT NULL,
            memberId VARCHAR(255),
            borrowedAt TIMESTAMP DEFAULT 0,
            isDeleted TINYINT UNSIGNED NOT NUll,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY(memberId) REFERENCES Users(id)
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Fees (
            id VARCHAR(255) PRIMARY KEY,
            amount FLOAT NOT NULL,
            memberId VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY(memberId) REFERENCES Users(id)
        )`
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS Suggestions (
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

    return db;
}

export function deserializeUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);
        
        // @ts-ignore
        req.user = decoded;
    } catch (err) {}

    return next();
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // @ts-ignore
    if (!req.user) {
        return res.status(401).json({ msg: 'Access denied!' });
    }
        
    return next();
}

export { conn, authMiddleware };
