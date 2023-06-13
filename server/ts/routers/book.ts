import express from "express";
import crypto from "node:crypto";
import { conn, customReq, authMiddleware } from "../functions.js";

const bookRouter = express.Router();

bookRouter.route('/books')
    .get(authMiddleware, async(req, res) => {
        const rows = await conn.query(`SELECT * FROM Books`) as any[][];

        res.json({ result: rows[0] });
    })
    .post(authMiddleware, async(req, res) => {
        if ((req as unknown as customReq).user.isMember === 0) {
            const { title, imgUrl, authorName, descr, yearPubl, numEdition } = req.body;

            const stmt = await conn.prepare(`INSERT INTO Books (id, title, imgUrl, authorName, descr, yearPubl, numEdition, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`);
            await stmt.execute([crypto.randomUUID(), title, imgUrl, authorName, descr, yearPubl, numEdition]);
            await stmt.close();

            return res.json({ msg: 'Successfully added!' });
        }

        return res.status(401).json({ msg: 'Unauthorized!' });
    });

bookRouter.route('/books/:id')
    .get(authMiddleware, async(req, res) => {
        const { id: idBook } = req.params;

        const stmt = await conn.prepare(`SELECT * FROM Books WHERE id = ?`);
        const rows = await stmt.execute([idBook]) as any[][];
        
        res.json({ result: rows[0] });
    })
    .patch(authMiddleware, async(req, res) => {
        const { id: idBook } = req.params;
        const { title, imgUrl, authorName, descr, yearPubl, numEdition } = req.body;

        const stmt = await conn.prepare(`UPDATE Books SET title = ?, imgUrl = ?, authorName = ?, descr = ?, yearPubl = ?, numEdition = ? WHERE id = ?`);
        await stmt.execute([title, imgUrl, authorName, descr, yearPubl, numEdition, idBook]);
        await stmt.close();

        res.json({ msg: 'Successfully patched!' });
    })
    .delete(authMiddleware, async(req, res) => {
        const { id: idBook } = req.params;

        const stmt = await conn.prepare(`UPDATE Books SET isDeleted = 1 WHERE id = ?`);
        await stmt.execute([idBook]);
        await stmt.close();
    
        res.json({ msg: 'Successfully deleted!' });
    });

bookRouter.patch('/books/:id/borrow', authMiddleware, async(req, res) => {
    if ((req as unknown as customReq).user.isMember === 0) {
        const { id: idBook } = req.params;
        const { idMember } = req.body;

        const stmt = await conn.prepare(`UPDATE Books SET idMember = ?, borrowingTimestamp = ? WHERE id = ?`);
        await stmt.execute([idMember, Date.now(), idBook]);
        await stmt.close();

        res.json({ msg: 'Successfully patched!' });
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

bookRouter.route('/books/:id/suggest')
    .get(authMiddleware, async(req, res) => {
        const { id: idBook } = req.params;

        const stmt = await conn.prepare(`SELECT * FROM Suggestions WHERE idBook = ?`);
        const rows = await stmt.execute([idBook]) as any[][];
        await stmt.close();
    
        return res.json({ result: rows[0] });
    })
    .post(authMiddleware, async(req, res) => {
        if ((req as unknown as customReq).user.isMember === 1) {
            const { id: idBook } = req.params;
            const { descr, idMember } = req.body;

            const stmt = await conn.prepare(`INSERT INTO Suggestions (id, descr, insertionTimestamp, idMember, idBook, isDeleted) VALUES (?, ?, ?, ?, ?, 0)`);
            await stmt.execute([crypto.randomUUID(), descr, Date.now(), idMember, idBook]);
            await stmt.close();

            return res.json({ msg: 'Successfully added!' });
        }

        return res.status(401).json({ msg: 'Unauthorized!' });
    });

export default bookRouter;
