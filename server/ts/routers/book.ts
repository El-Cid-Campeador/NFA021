import express from "express";
import crypto from "node:crypto";
import { authMiddleware, conn} from "../functions.js";

const bookRouter = express.Router();

bookRouter.use(authMiddleware);

bookRouter.get('/:column/:value', async (req, res) => {
    const { column,  value } = req.params;
    const val = typeof value === "number" ? value : `\"${value}\"`;
    
    const rows = await conn.query(`SELECT id, title, imgUrl, authorName, category, lang, yearPubl, memberId FROM Books 
        WHERE isDeleted = 0 AND ${column} = ${val}`
    ) as any[][];

    res.json({ result: rows[0] });
});

bookRouter.post('/', async (req, res) => {
    // @ts-ignore
    if (req.user.isMember === 0) {
        const { title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition } = req.body;

        const sql = `INSERT INTO Books (id, title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([crypto.randomUUID(), title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition]);
        conn.unprepare(sql);
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

bookRouter.get('/latest', async (req, res) => {
    const rows = await conn.query(`SELECT id, title, imgUrl, authorName, category, lang, yearPubl, memberId 
        FROM Books WHERE isDeleted = 0 ORDER BY createdAt DESC LIMIT 3`
    ) as any[][];

    res.json({ result: rows[0] });
});

bookRouter.route('/:id')
    .get(async (req, res) => {
        const { id: bookId } = req.params;

        const sql = `SELECT title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, memberId FROM Books WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([bookId]) as any[][];
        conn.unprepare(sql);
        
        res.json({ result: rows[0][0] });
    })
    .patch(async (req, res) => {
        // @ts-ignore
        if (req.user.isMember === 0) {
            const { id: bookId } = req.params;
            const { title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition } = req.body;
    
            const sql = `UPDATE Books SET title = ?, imgUrl = ?, authorName = ?, category = ?, lang ?, descr = ?, yearPubl = ?, numEdition = ? WHERE id = ?`;
            const stmt = await conn.prepare(sql);
            await stmt.execute([title, imgUrl, authorName, descr, yearPubl, numEdition, bookId]);
            conn.unprepare(sql);
    
            return res.json({ msg: 'Successfully patched!' });
        }

        return res.status(401).json({ msg: 'Unauthorized!' });
    })
    .delete(async (req, res) => {
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

bookRouter.patch('/:id/borrow', async (req, res) => {
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
