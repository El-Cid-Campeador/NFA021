import express from "express";
import crypto from "node:crypto";
import { conn, authMiddleware, adminMiddleware } from "../functions.js";

const bookRouter = express.Router();

bookRouter.use(authMiddleware);

bookRouter.get('/latest', async (req, res) => {
    const rows = await conn.query(`SELECT id, title, imgUrl, authorName, category, lang, yearPubl, memberId 
        FROM Books WHERE isDeleted = 0 ORDER BY yearPubl DESC, createdAt DESC LIMIT 3`
    ) as any[][];

    res.json({ result: rows[0] });
});

bookRouter.get('/search/:payload', async (req, res) => {
    const { payload } = req.params;
    const val = `%${payload}%`;

    const sql = `SELECT id, title, imgUrl, authorName, category, lang, yearPubl, nbrPages, memberId FROM Books WHERE title LIKE ? OR authorName LIKE ?`;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([val, val]) as any[][];
    conn.unprepare(sql);

    res.json({ result: rows[0] });
});

bookRouter.get('/search', async (req, res) => {
    const { category, year, lang } = req.query;

    let sql = `SELECT id, title, imgUrl, authorName, category, lang, yearPubl, nbrPages, memberId FROM Books WHERE 1 = 1`;
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

bookRouter.post('/', adminMiddleware, async (req, res) => {
    const { title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages } = req.body;

    const sql = `INSERT INTO Books (id, title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;
    const stmt = await conn.prepare(sql);
    await stmt.execute([crypto.randomUUID(), title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages]);
    conn.unprepare(sql);

    return res.status(401).json({ msg: 'Unauthorized!' });
});

bookRouter.route('/:id')
    .get(async (req, res) => {
        const { id: bookId } = req.params;

        const sql = `SELECT title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages, memberId FROM Books WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);
        
        res.json({ result: rows[0][0] });
    })
    .patch(adminMiddleware, async (req, res) => {
        const { id: bookId } = req.params;
        const { title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages } = req.body;

        const sql = `UPDATE Books SET title = ?, imgUrl = ?, authorName = ?, category = ?, lang ?, descr = ?, yearPubl = ?, numEdition = ?, nbrPages = ? WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages, bookId]);
        conn.unprepare(sql);

        return res.json({ msg: 'Successfully patched!' });
    })
    .delete(adminMiddleware, async (req, res) => {
        const { id: bookId } = req.params;

        const sql = `UPDATE Books SET isDeleted = 1 WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([bookId]);
        conn.unprepare(sql);
    
        return res.json({ msg: 'Successfully deleted!' });
    });

bookRouter.patch('/:id/borrow', adminMiddleware, async (req, res) => {
    const { id: bookId } = req.params;
    const { memberId } = req.body;

    const sql = `UPDATE Books SET memberId = ?, borrowedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    const stmt = await conn.prepare(sql);
    await stmt.execute([memberId, Date.now(), bookId]);
    conn.unprepare(sql);

    res.json({ msg: 'Successfully patched!' });

    return res.status(401).json({ msg: 'Unauthorized!' });
});

bookRouter.route('/:id/suggest')
    .get(async (req, res) => {
        const { id: bookId } = req.params;

        const sql = `SELECT * FROM Suggestions WHERE bookId = ?`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);
    
        return res.json({ result: rows[0] });
    })
    .post(async (req, res) => {
        // @ts-ignore
        if (req.user.isMember === 1) {
            const { id: bookId } = req.params;
            const { descr, memberId } = req.body;

            const sql = `INSERT INTO Suggestions (id, descr, memberId, bookId, isDeleted) VALUES (?, ?, ?, ?, 0)`;
            const stmt = await conn.prepare(sql);
            await stmt.execute([crypto.randomUUID(), descr, memberId, bookId]);
            conn.unprepare(sql);

            return res.json({ msg: 'Successfully added!' });
        }

        return res.status(401).json({ msg: 'Unauthorized!' });
    });

export default bookRouter;
