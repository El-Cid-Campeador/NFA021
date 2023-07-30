import mysql from "mysql2/promise";

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

const conn = await connectDB();

async function array() {
    const rows = await conn.query(`SELECT * FROM Books`);
    return rows[0];
}

async function generate() {
    const arr = await array();

    for (let i = 0; i < 14; i += 1) {
        const index = Math.floor(Math.random() * arr.length);
        const sql = `INSERT INTO Books (id, title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages, addedBy) VALUES (
            UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, '111101246123'
        )`;

        const stmt = await conn.prepare(sql);
        await stmt.execute([
            arr[index].title, 
            arr[index].imgUrl, 
            arr[index].authorName, 
            arr[index].category, 
            arr[index].lang, 
            arr[index].descr, 
            arr[index].yearPubl, 
            arr[index].numEdition, 
            arr[index].nbrPages
        ]);
        conn.unprepare(sql);
    }

    await conn.end();
}

await generate();

// cd server && node ./script.js
