import express from "express";
import { conn, authMiddleware, adminMiddleware, checkIfMemberExists } from "../functions.js";

const bookRouter = express.Router();

bookRouter.get('/latest', authMiddleware, async (req, res) => {
    const rows = await conn.query(`SELECT * FROM Books WHERE isDeleted = 0 ORDER BY yearPubl DESC, createdAt DESC LIMIT 3`) as any[][];

    res.json({ result: rows[0] });
});

bookRouter.route('/').get(authMiddleware, async (req, res) => {
        const { search } = req.query;
        const payload = `%${search}%`;

        const sql = `SELECT * FROM Books WHERE isDeleted = 0 AND (title LIKE ? OR authorName LIKE ?)`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([payload, payload]) as any[][];
        conn.unprepare(sql);

        res.json({ result: rows[0] });
    })
    .post(adminMiddleware, async (req, res) => {
        const { title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages } = req.body;

        const sql = `INSERT INTO Books (id, title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages, isDeleted) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([title, imgUrl, authorName, category, lang, descr, Number(yearPubl), Number(numEdition), Number(nbrPages)]);
        conn.unprepare(sql);

        res.json({ msg: 'Successfully added!' });
    });

bookRouter.get('/search', authMiddleware, async (req, res) => {
    const { category, year, lang } = req.query;

    let sql = `SELECT * FROM Books WHERE isDeleted = 0`;
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
            FROM Suggestions JOIN Users ON Suggestions.memberId = Users.id 
            WHERE Suggestions.isDeleted = 0 AND Users.isDeleted = 0 AND bookId = ?
        `;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);
        
        res.json({ result: rows[0] });
    })
    .post(authMiddleware, async (req, res) => {
        const { id: bookId } = req.query;
        const { descr, memberId } = req.body;

        const sql = `INSERT INTO Suggestions (id, descr, memberId, bookId, isDeleted) VALUES (UUID(), ?, ?, ?, 0)`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([descr, memberId, bookId]);
        conn.unprepare(sql);

        res.json({ msg: 'Successfully added!' });
    });

bookRouter.patch('/lend', adminMiddleware, async (req, res) => {
    const { id: bookId } = req.query;
    const { memberId } = req.body;

    let sql = '';

    if (memberId) {
        if (await checkIfMemberExists(memberId)) {
            sql = `UPDATE Books SET memberId = ?, borrowedAt = CURRENT_TIMESTAMP WHERE id = ?`;
            const stmt = await conn.prepare(sql);
            await stmt.execute([memberId, bookId]);
        } else {
            return res.status(404).send('User not found!');
        }
    } else {
        sql = `UPDATE Books SET memberId = ?, borrowedAt = ? WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([null, null, bookId]);
    }

    conn.unprepare(sql);

    res.json({ msg: 'Successfully added!' });
});

bookRouter.route('/:id')
    .get(authMiddleware, async (req, res) => {
        const { id: bookId } = req.params;

        const sql = `SELECT * FROM Books WHERE isDeleted = 0 AND id = ?`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);
        
        res.json({ result: rows[0][0] });
    })
    .patch(adminMiddleware, async (req, res) => {
        const { id: bookId } = req.params;
        const { title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages } = req.body;

        const sql = `UPDATE Books SET title = ?, imgUrl = ?, authorName = ?, category = ?, lang = ?, descr = ?, yearPubl = ?, numEdition = ?, nbrPages = ? WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([title, imgUrl, authorName, category, lang, descr, Number(yearPubl), Number(numEdition), Number(nbrPages), bookId]);
        conn.unprepare(sql);

        res.json({ msg: 'Successfully patched!' });
    })
    .delete(adminMiddleware, async (req, res) => {
        const { id: bookId } = req.params;

        const sql = `UPDATE Books SET isDeleted = 1 WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([bookId]);
        conn.unprepare(sql);
    
        res.json({ msg: 'Successfully deleted!' });
    });

export default bookRouter;
