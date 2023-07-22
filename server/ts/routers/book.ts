import express from "express";
import { conn, authMiddleware, librarianMiddleware, getMember, UserSession, registerChanges, getBookBorrowInfo } from "../functions.js";

const bookRouter = express.Router();

bookRouter.get('/latest', authMiddleware, async (req, res) => {
    const rows = await conn.query(`SELECT * FROM Books WHERE deletedBy = NULL ORDER BY yearPubl DESC, additionDate DESC LIMIT 3`) as any[][];

    res.json({ result: rows[0] });
});

bookRouter.route('/')
    .get(authMiddleware, async (req, res) => {
        const { search } = req.query;
        const payload = `%${search}%`;

        const sessionUser = req.session as UserSession;

        let sql = `SELECT * FROM Books WHERE isDeleted = NULL AND (title LIKE ? OR authorName LIKE ?)`;

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

        res.json({ msg: 'Successfully added!' });
    });

bookRouter.get('/search', authMiddleware, async (req, res) => {
    const { category, year, lang } = req.query;

    const sessionUser = req.session as UserSession;

    let sql = `SELECT * FROM Books WHERE deletedBy = NULL`;

    if (sessionUser.user?.role) {
        sql = `SELECT * FROM Books`;
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
        const { id: bookId } = req.query;
    
        const sql = `SELECT Suggestions.*, Users.firstName, Users.lastName 
            FROM Suggestions JOIN Users ON Suggestions.memberId = Users.id, Members 
            WHERE Users.id IN (SELECT id FROM Members) AND Members.deletedBy = NULL AND bookId = ?
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

        res.json({ msg: 'Successfully added!' });
    });

bookRouter.get('/modifications', async (req, res) => {
    const { id: bookId } = req.query;

    const sql = `SELECT * FROM Modifications WHERE bookId = ? ORDER BY modificationDate`;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([bookId]) as any[][];
    conn.unprepare(sql);

    res.json({ result: rows[0] });
});
    
bookRouter.get('/borrowings', async (req, res) => {
    const { bookId } = req.query;

    const sql = `SELECT * FROM borrowings WHERE bookId = ? ORDER BY borrowDate`;
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

    res.json({ msg: 'Successfully borrowed!' });
});

bookRouter.patch('/return', librarianMiddleware, async (req, res) => {
    const { bookId, librarianId, borrowDate } = req.query;
    const { memberId } = req.body;

    const sql = `UPDATE Borrowings SET returnDate = CURRENT_TIMESTAMP, receiverId = ? WHERE memberId = ? AND bookId = ? AND borrowDate = ?`;
    const stmt = await conn.prepare(sql);
    await stmt.execute([librarianId, memberId, bookId, borrowDate]);
    conn.unprepare(sql);

    res.json({ msg: 'Successfully returned back!' });
});

bookRouter.route('/:id')
    .get(authMiddleware, async (req, res) => {
        const { id: bookId } = req.params;

        const sessionUser = req.session as UserSession;

        let sql = `SELECT * FROM Books WHERE deletedBy = NULL AND id = ?`;

        if (sessionUser.user?.role) {
            sql = `SELECT * FROM Books WHERE id = ?`;
        }

        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);

        const info = await getBookBorrowInfo(bookId);
        
        res.json({ result: rows[0][0], info });
    })
    .patch(librarianMiddleware, async (req, res) => {
        const { librarianId } = req.query;
        const { id: bookId } = req.params;
        const { title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages } = req.body;

        await registerChanges(bookId, String(librarianId), req.body);

        const sql = `UPDATE Books SET title = ?, imgUrl = ?, authorName = ?, category = ?, lang = ?, descr = ?, yearPubl = ?, numEdition = ?, nbrPages = ? WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([title, imgUrl, authorName, category, lang, descr, Number(yearPubl), Number(numEdition), Number(nbrPages), bookId]);
        conn.unprepare(sql);

        res.json({ msg: 'Successfully patched!' });
    })
    .delete(librarianMiddleware, async (req, res) => {
        const { librarianId } = req.query;
        const { id: bookId } = req.params;

        const sql = `UPDATE Books SET deletedBy = ?, deletionDate = CURRENT_TIMESTAMP WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([librarianId, bookId]);
        conn.unprepare(sql);
    
        res.json({ msg: 'Successfully deleted!' });
    });

export default bookRouter;
