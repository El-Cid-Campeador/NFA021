import { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import { SessionData } from "express-session";
import "dotenv/config";

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
            password VARCHAR(100) NOT NULL,
            additionDate TIMESTAMP DEFAULT NOW(),
            deletionDate TIMESTAMP
        )`
    ); 

    await conn.execute(`CREATE TABLE IF NOT EXISTS Librarians (
            id VARCHAR(12) PRIMARY KEY,
            addedBy VARCHAR(12) NOT NULL,
            FOREIGN KEY (id) REFERENCES Users(id),
            FOREIGN KEY (addedBy) REFERENCES Librarians(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Members (
            id VARCHAR(12) PRIMARY KEY,
            deletedBy VARCHAR(12),
            FOREIGN KEY (id) REFERENCES Users(id),
            FOREIGN KEY (deletedBy) REFERENCES Librarians(id)
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
            additionDate TIMESTAMP DEFAULT NOW(),
            deletedBy VARCHAR(12) ,
            deletionDate TIMESTAMP,
            FOREIGN KEY (addedBy) REFERENCES Librarians(id),
            FOREIGN KEY (deletedBy) REFERENCES Librarians(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Borrowings (
            memberId VARCHAR(12),
            bookId VARCHAR(36),
            borrowDate TIMESTAMP DEFAULT NOW(),
            lenderId VARCHAR(12) NOT NULL,
            returnDate TIMESTAMP,
            receiverId VARCHAR(12) ,
            PRIMARY KEY (memberId, bookId, borrowDate),
            FOREIGN KEY (memberId) REFERENCES Members(id),
            FOREIGN KEY (bookId) REFERENCES Books(id),
            FOREIGN KEY (lenderId) REFERENCES Librarians(id),
            FOREIGN KEY (receiverId) REFERENCES Librarians(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Modifications (
            librarianId VARCHAR(12),
            bookId VARCHAR(36),
            modificationDate TIMESTAMP DEFAULT NOW(),
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
            paymentDate TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (memberId) REFERENCES Members(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Suggestions (
            id VARCHAR(36) PRIMARY KEY,
            descr LONGTEXT NOT NULL,
            memberId VARCHAR(12) NOT NULL,
            bookId VARCHAR(36) NOT NULL,
            additionDate TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (memberId) REFERENCES Members(id),
            FOREIGN KEY (bookId) REFERENCES Books(id)
        )`
    );

    return conn;
}

async function getMember(memberId: string) {
    const sql = `SELECT Members.id, firstName, lastName, email, additionDate, deletionDate, deletedBy 
        FROM Users JOIN Members ON Users.id = Members.id WHERE Members.id = ?
    `;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([memberId]) as any[][];
    conn.unprepare(sql);

    return rows[0];
}

async function getUserByEmailOrID(emailOrID: string) {
    const sql = `SELECT id, firstName, lastName, password 
        FROM Users WHERE (email = ? OR id = ?) AND deletionDate = '0000-00-00 00:00:00'
    `;
    
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([emailOrID, emailOrID]) as any[][];
    conn.unprepare(sql);

    return rows[0];
}

async function getBookBorrowInfo(bookId: string) {
    const sql = `SELECT memberId, borrowDate, lenderId, returnDate, receiverId 
        FROM Borrowings WHERE bookId = ? ORDER BY borrowDate LIMIT 1
    `;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([bookId]) as any[][];
    conn.unprepare(sql);

    return rows[0][0];
}

async function registerChanges(bookId: string, librarianId: string, newValues: any) {
    let sql = `SELECT title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages 
        FROM Books WHERE id = ?
    `;
    let stmt = await conn.prepare(sql);
    const rows = await stmt.execute([bookId]) as any[][];
    conn.unprepare(sql);

    sql = `INSERT INTO Modifications (librarianId, bookId, oldValues, newValues) VALUES (?, ?, ?, ?)`;
    stmt = await conn.prepare(sql);
    await stmt.execute([librarianId, bookId, JSON.stringify(rows[0][0]), JSON.stringify(newValues)]);
    conn.unprepare(sql);
}

async function getTotalFeesByYear(memberId: string) {
    const sql = `SELECT id, year, SUM(amount) AS amount FROM Fees WHERE memberId = ? GROUP BY year`;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([memberId]) as any[][];
    conn.unprepare(sql);

    return rows[0];
}

function formatDate(date: string) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
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

export { 
    UserSession, 
    conn, 
    getMember, 
    getUserByEmailOrID, 
    getBookBorrowInfo, 
    registerChanges,
    getTotalFeesByYear, 
    formatDate, 
    authMiddleware, 
    librarianMiddleware 
};
