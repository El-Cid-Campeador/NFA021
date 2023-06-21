import express from "express";
import crypto from "node:crypto";
import { conn, authMiddleware, deserializeUser } from "../functions.js";

const bookRouter = express.Router();

bookRouter.use(deserializeUser);
bookRouter.use(authMiddleware.unless({ path: [''], method: [''] }));

bookRouter.get('/books', async(req, res) => {
    const rows = await conn.query(`SELECT id, title, imgUrl, authorName, category, descr, yearPubl, numEdition, memberId FROM Books WHERE isDeleted = 0`) as any[][];

    res.json({ result: rows[0] });
 });



bookRouter.get('/books/latest', async(req, res) => {
    const rows = await conn.query(`SELECT id, title, imgUrl, authorName, category, descr, yearPubl, numEdition, memberId 
        FROM Books WHERE isDeleted = 0 ORDER BY createdAt DESC LIMIT 3`
    ) as any[][];

    res.json({ result: rows[0] });
});

bookRouter.post('/books', async(req, res) => {
    // @ts-ignore
    if (req.user.isMember === 0) {
        const { title, imgUrl, authorName, category, descr, yearPubl, numEdition } = req.body;

        const sql = `INSERT INTO Books (id, title, imgUrl, authorName, category, descr, yearPubl, numEdition, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([crypto.randomUUID(), title, imgUrl, authorName, category, descr, yearPubl, numEdition]);
        conn.unprepare(sql);

        return res.json({ msg: 'Successfully added!' });
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

bookRouter.route('/books/:id')
    .get(async(req, res) => {
        const { id: bookId } = req.params;

        const stmt = await conn.prepare(`SELECT title, imgUrl, authorName, category, descr, yearPubl, numEdition, isDeleted FROM Books WHERE id = ?`);
        const rows = await stmt.execute([bookId]) as any[][];
        
        res.json({ result: rows[0][0] });
    })
    .patch(async(req, res) => {
        // @ts-ignore
        if (req.user.isMember === 0) {
            const { id: bookId } = req.params;
            const { title, imgUrl, authorName, descr, yearPubl, numEdition } = req.body;
    
            const sql = `UPDATE Books SET title = ?, imgUrl = ?, authorName = ?, descr = ?, yearPubl = ?, numEdition = ? WHERE id = ?`;
            const stmt = await conn.prepare(sql);
            await stmt.execute([title, imgUrl, authorName, descr, yearPubl, numEdition, bookId]);
            conn.unprepare(sql);
    
            return res.json({ msg: 'Successfully patched!' });
        }

        return res.status(401).json({ msg: 'Unauthorized!' });
    })
    .delete(async(req, res) => {
        // @ts-ignore
        if (req.user.isMember === 0) {
            const { id: bookId } = req.params;
    
            const sql = `UPDATE Books SET isDeleted = 1 WHERE id = ?`;
            const stmt = await conn.prepare(sql);
            await stmt.execute([bookId]);
            conn.unprepare(sql);
        
            return res.json({ msg: 'Successfully deleted!' });
        }

        return res.status(401).json({ msg: 'Unauthorized!' });
    });

bookRouter.patch('/books/:id/borrow', async(req, res) => {
    // @ts-ignore
    if (req.user.isMember === 0) {
        const { id: bookId } = req.params;
        const { memberId } = req.body;

        const sql = `UPDATE Books SET memberId = ?, borrowedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([memberId, Date.now(), bookId]);
        conn.unprepare(sql);

        res.json({ msg: 'Successfully patched!' });
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

bookRouter.route('/books/:id/suggest')
    .get(async(req, res) => {
        const { id: bookId } = req.params;

        const sql = `SELECT * FROM Suggestions WHERE bookId = ?`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);
    
        return res.json({ result: rows[0] });
    })
    .post(async(req, res) => {
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
