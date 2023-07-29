import express from "express";
import { conn, authMiddleware, librarianMiddleware, getMember, UserSession, registerChanges, getBookBorrowInfo, formatDate } from "../functions.js";

const bookRouter = express.Router();

bookRouter.get('/latest', authMiddleware, async (req, res) => {
    const rows = await conn.query(`SELECT id, title, imgUrl FROM Books WHERE deletedBy IS NULL ORDER BY yearPubl DESC, additionDate DESC LIMIT 3`) as any[][];  

    res.json({ result: rows[0] });
});

bookRouter.route('/')
    .get(authMiddleware, async (req, res) => {
        const { search } = req.query;
        const payload = `%${search}%`;

        const sessionUser = req.session as UserSession;

        let sql = `SELECT id, title FROM Books WHERE deletedBy IS NULL AND (title LIKE ? OR authorName LIKE ?)`;

        if (sessionUser.user?.role) {
            sql = `SELECT * FROM Books WHERE title LIKE ? OR authorName LIKE ?`;
        }

        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([payload, payload]) as any[][];
        conn.unprepare(sql);

        res.json({ result: rows[0] });
    })
    .post(librarianMiddleware, async (req, res) => {
        const { librarianId } = req.query;
        const { title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages } = req.body;

        const sql = `INSERT INTO Books (id, title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages, addedBy) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([title, imgUrl, authorName, category, lang, descr, Number(yearPubl), Number(numEdition), Number(nbrPages), librarianId]);
        conn.unprepare(sql);

        res.send('Successfully added!');
    });

bookRouter.get('/search', authMiddleware, async (req, res) => {
    const { category, year, lang } = req.query;

    const sessionUser = req.session as UserSession;

    let sql = `SELECT id, title, imgUrl FROM Books WHERE 1 = 1`;

    if (!sessionUser.user?.role) {
        sql += ` AND deletedBy IS NULL`;
    }

    const params  = [];

    if (category !== '') {
        sql += ` AND category = ?`;
        params.push(category);
    }

    if (year !== '') {
        sql += ` AND yearPubl = ?`;
        params.push(Number(year));
    }

    if (lang !== '') {
        sql += ` AND lang = ?`;
        params.push(lang);
    }

    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute(params) as any[][];
    conn.unprepare(sql);

    res.json({ result: rows[0] });
});

bookRouter.route('/suggest')
    .get(authMiddleware, async (req, res) => {
        const { bookId } = req.query;
    
        const sql = `SELECT Suggestions.id, descr, Suggestions.additionDate, firstName, lastName 
            FROM Suggestions INNER JOIN Users ON Suggestions.memberId = Users.id INNER JOIN Members ON Users.id = Members.id
            WHERE Members.deletedBy IS NULL AND bookId = ?
        `;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);
        
        res.json({ result: rows[0] });
    })
    .post(authMiddleware, async (req, res) => {
        const { id: bookId } = req.query;
        const { descr, memberId } = req.body;

        const sql = `INSERT INTO Suggestions (id, descr, memberId, bookId) VALUES (UUID(), ?, ?, ?)`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([descr, memberId, bookId]);
        conn.unprepare(sql);

        res.send('Successfully added!');
    });

bookRouter.get('/modifications', async (req, res) => {
    const { bookId } = req.query;

    const sql = `SELECT librarianId, modificationDate, oldValues, newValues 
        FROM Modifications WHERE bookId = ? ORDER BY modificationDate
    `;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([bookId]) as any[][];
    conn.unprepare(sql);

    res.json({ result: rows[0] });
});
    
bookRouter.get('/borrowings', async (req, res) => {
    const { bookId } = req.query;

    const sql = `SELECT memberId, borrowDate, lenderId, returnDate, receiverId 
        FROM Borrowings WHERE bookId = ? AND returnDate ORDER BY borrowDate
    `;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([bookId]) as any[][];
    conn.unprepare(sql);

    res.json({ result: rows[0] });
});

bookRouter.post('/lend', librarianMiddleware, async (req, res) => {
    const { bookId, librarianId } = req.query;
    const { memberId } = req.body;

    if (!(await getMember(memberId)).length) {
        return res.status(404).send('User not found!');
    }

    const sql = `INSERT INTO Borrowings (memberId, bookId, lenderId) VALUES (?, ?, ?)`;
    const stmt = await conn.prepare(sql);
    await stmt.execute([memberId, bookId, librarianId]);
    conn.unprepare(sql);

    res.send('Successfully borrowed!');
});

bookRouter.patch('/return', librarianMiddleware, async (req, res) => {
    const { bookId, librarianId, borrowDate } = req.query;
    const { memberId } = req.body;

    const sql = `UPDATE Borrowings SET returnDate = NOW(), receiverId = ? WHERE memberId = ? AND bookId = ? AND borrowDate = CONVERT_TZ(?, '+00:00', @@session.time_zone)`;
    const stmt = await conn.prepare(sql);
    await stmt.execute([librarianId, memberId, bookId, formatDate(String(borrowDate))]);
    conn.unprepare(sql);

    res.send('Successfully returned back!');
});

bookRouter.route('/:id')
    .get(authMiddleware, async (req, res) => {
        const { id: bookId } = req.params;

        const sessionUser = req.session as UserSession;

        let sql = `SELECT title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages, addedBy, additionDate 
            FROM Books WHERE id = ?
        `;

        if (sessionUser.user?.role) {
            sql = `SELECT title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages, addedBy, additionDate, deletedBy, deletionDate 
                FROM Books WHERE id = ? AND deletedBy IS NULL
            `;
        }

        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);

        const info = await getBookBorrowInfo(bookId) ?? '';

        res.json({ result: rows[0][0], info });
    })
    .patch(librarianMiddleware, async (req, res) => {
        const { librarianId } = req.query;
        const { id: bookId } = req.params;
        const { title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages } = req.body;

        await registerChanges(bookId, String(librarianId), { title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages });

        const sql = `UPDATE Books SET title = ?, imgUrl = ?, authorName = ?, category = ?, lang = ?, descr = ?, yearPubl = ?, numEdition = ?, nbrPages = ? WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([title, imgUrl, authorName, category, lang, descr, Number(yearPubl), Number(numEdition), Number(nbrPages), bookId]);
        conn.unprepare(sql);

        res.send('Successfully patched!');
    })
    .delete(librarianMiddleware, async (req, res) => {
        const { librarianId } = req.query;
        const { id: bookId } = req.params;

        const sql = `UPDATE Books SET deletedBy = ?, deletionDate = NOW() WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([librarianId, bookId]);
        conn.unprepare(sql);
    
        res.send('Successfully deleted!');
    });

export default bookRouter;
