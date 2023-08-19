import { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import { SessionData } from "express-session";
import "dotenv/config";
import waitPort from "wait-port";

interface UserSession extends SessionData {
    user?: User
}

const conn = await connectDB();

async function connectDB() {
    await waitPort({ host: process.env.MYSQL_HOST || 'localhost', port: 3306 });
    
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || 'nfa021',
        charset: 'utf8mb4'
    });

    await conn.execute(`CREATE TABLE IF NOT EXISTS Users (
            id VARCHAR(12) PRIMARY KEY,
            firstName VARCHAR(50) NOT NULL,
            lastName VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL,
            additionDate DATETIME DEFAULT NOW(),
            deletionDate DATETIME 
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
            additionDate DATETIME DEFAULT NOW(),
            deletedBy VARCHAR(12),
            deletionDate DATETIME,
            FOREIGN KEY (addedBy) REFERENCES Librarians(id),
            FOREIGN KEY (deletedBy) REFERENCES Librarians(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Borrowings (
            memberId VARCHAR(12),
            bookId VARCHAR(36),
            borrowDate DATETIME DEFAULT NOW(),
            lenderId VARCHAR(12) NOT NULL,
            returnDate DATETIME,
            receiverId VARCHAR(12),
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
            modificationDate DATETIME DEFAULT NOW(),
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
            paymentDate DATETIME DEFAULT NOW(),
            FOREIGN KEY (memberId) REFERENCES Members(id)
        )`
    );

    await conn.execute(`CREATE TABLE IF NOT EXISTS Suggestions (
            id VARCHAR(36) PRIMARY KEY,
            descr LONGTEXT NOT NULL,
            memberId VARCHAR(12) NOT NULL,
            bookId VARCHAR(36) NOT NULL,
            additionDate DATETIME DEFAULT NOW(),
            FOREIGN KEY (memberId) REFERENCES Members(id),
            FOREIGN KEY (bookId) REFERENCES Books(id)
        )`
    );

    return conn;
}

async function getUserByEmailOrID(emailOrID: string) {
    const sql = `SELECT id, firstName, lastName, password 
        FROM Users WHERE (email = ? OR id = ?) AND deletionDate IS NULL
    `;

    try {
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([emailOrID, emailOrID]) as any[][];
        conn.unprepare(sql);
    
        return rows[0];
    } catch (error) {
        conn.unprepare(sql);
    }
}

async function getBookBorrowInfo(bookId: string) {
    const sql = `SELECT memberId, borrowDate, lenderId, returnDate, receiverId 
        FROM Borrowings WHERE bookId = ? ORDER BY borrowDate LIMIT 1
    `;

    try {
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);
    
        return rows[0][0];
    } catch (error) {
        conn.unprepare(sql);
    }
}

async function registerChanges(bookId: string, librarianId: string, newValues: any) {
    let sql = `SELECT title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages 
        FROM Books WHERE id = ?
    `;
    
    try {
        let stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);
    
        sql = `INSERT INTO Modifications (librarianId, bookId, oldValues, newValues) VALUES (?, ?, ?, ?)`;
        stmt = await conn.prepare(sql);
        await stmt.execute([librarianId, bookId, JSON.stringify(rows[0][0]), JSON.stringify(newValues)]);
        conn.unprepare(sql);
    } catch (error) {
        conn.unprepare(sql);
    }
}

function formatDate(date: string) {
    const inputDate = new Date(date);
    const utc3Offset = 3 * 60;
    const utc3Timestamp = inputDate.getTime() + utc3Offset * 60 * 1000;

    const utc3Date = new Date(utc3Timestamp);

    return utc3Date.toISOString().slice(0, 19).replace('T', ' ');
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
    getUserByEmailOrID, 
    getBookBorrowInfo, 
    registerChanges, 
    formatDate, 
    authMiddleware, 
    librarianMiddleware 
};
