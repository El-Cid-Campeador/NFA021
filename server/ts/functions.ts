import { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import { SessionData } from "express-session";
import bcrypt from "bcrypt";
import "dotenv/config";

type User = { 
    id: string,
    firstName: string, 
    lastName: string, 
    role?: string 
}

interface UserSession extends SessionData {
    user?: User
}

const conn = await connectDB();

async function connectDB() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'nfa021'
    });

    await conn.execute(`CREATE TABLE IF NOT EXISTS Users (
            id VARCHAR(12) PRIMARY KEY,
            firstName VARCHAR(50) NOT NULL,
            lastName VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL,
            additionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deletionDate TIMESTAMP
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Members (
            id VARCHAR(12) PRIMARY KEY,
            deletedBy VARCHAR(12),
            FOREIGN KEY (id) REFERENCES Users(id),
            FOREIGN KEY (deletedBy) REFERENCES Librarians(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Librarians (
            id VARCHAR(12) PRIMARY KEY,
            addedBy VARCHAR(12),
            FOREIGN KEY (id) REFERENCES Users(id),
            FOREIGN KEY (addedBy) REFERENCES Librarians(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Books (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            imgUrl VARCHAR(255) NOT NULL,
            authorName VARCHAR(50) NOT NULL,
            category VARCHAR(50) NOT NULL,
            lang VARCHAR(50) NOT NULL,
            descr LONGTEXT NOT NULL,
            yearPubl SMALLINT UNSIGNED NOT NULL,
            numEdition SMALLINT UNSIGNED NOT NULL,
            nbrPages MEDIUMINT UNSIGNED NOT NULL,
            addedBy VARCHAR(12) NOT NULL,
            additionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deletedBy VARCHAR(12),
            deletionDate TIMESTAMP,
            FOREIGN KEY (addedBy) REFERENCES Librarians(id),
            FOREIGN KEY (deletedBy) REFERENCES Librarians(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Borrowings (
            memberId VARCHAR(12),
            bookId VARCHAR(36),
            lendingDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            librarianId VARCHAR(12) NOT NULL,
            PRIMARY KEY (memberId, bookId, lendingDate),
            FOREIGN KEY (memberId) REFERENCES Members(id),
            FOREIGN KEY (bookId) REFERENCES Books(id),
            FOREIGN KEY (librarianId) REFERENCES Books(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Returns (
            memberId VARCHAR(12),
            bookId VARCHAR(36),
            returnDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            librarianId VARCHAR(12) NOT NULL,
            PRIMARY KEY (memberId, bookId, returnDate),
            FOREIGN KEY (memberId) REFERENCES Use Members(id),
            FOREIGN KEY (bookId) REFERENCES Books(id),
            FOREIGN KEY (librarianId) REFERENCES Books(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Modifications (
            librarianId VARCHAR(12),
            bookId VARCHAR(36),
            modificationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            oldValues JSON NOT NULL,
            newValues JSON NOT NULL,
            PRIMARY KEY (librarianId, bookId, modificationDate),
            FOREIGN KEY (librarianId) REFERENCES Librarians(id),
            FOREIGN KEY (bookId) REFERENCES Books(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Fees (
            id VARCHAR(36) PRIMARY KEY,
            amount FLOAT NOT NULL,
            year SMALLINT UNSIGNED NOT NULL,
            memberId VARCHAR(12) NOT NULL,
            librarianId VARCHAR(12) NOT NULL,
            paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (memberId) REFERENCES Members(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Suggestions (
            id VARCHAR(36) PRIMARY KEY,
            descr LONGTEXT NOT NULL,
            memberId VARCHAR(12) NOT NULL,
            bookId VARCHAR(36) NOT NULL,
            additionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (memberId) REFERENCES Members(id),
            FOREIGN KEY (bookId) REFERENCES Books(id)
        )`
    );

    return conn;
}

async function checkIfMemberExists(memberId: string) {
    const sql = `SELECT id FROM Users WHERE id IN (SELECT id FROM Members) AND id = ?`;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([memberId]) as any[][];
    conn.unprepare(sql);

    return rows[0].length ? true : false;
}

async function getTotalFeesByYear(memberId: string) {
    const sql = `SELECT id, year, SUM(amount) AS amount FROM Fees WHERE memberId = ? GROUP BY year`;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([memberId]) as any[][];
    conn.unprepare(sql);

    return rows[0];
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const sessionUser = req.session as UserSession;
    
    if (sessionUser.user) {
        return next();
    } 
    
    res.status(401).send('Unauthorized!');
}

function librarianMiddleware(req: Request, res: Response, next: NextFunction) {
    const sessionUser = req.session as UserSession;

    if (sessionUser.user && sessionUser.user.role) {
        return next();
    }

    res.status(403).send('Access denied!');
}

export { conn, UserSession, checkIfMemberExists, getTotalFeesByYear, authMiddleware, librarianMiddleware };
