import express from "express";
import { conn, librarianMiddleware } from "../../functions.js";

const librarianRouter = express.Router();

librarianRouter.use(librarianMiddleware);

librarianRouter.get('/', async (req, res) => {
    const { librarianId } = req.query;
    
    const sql = `SELECT Librarians.id, firstName, lastName
        FROM Users JOIN Librarians ON Users.id = Librarians.id WHERE addedBy = ? AND Librarians.id != ?
    `;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([librarianId, librarianId]) as any[][];
    conn.unprepare(sql);

    res.json({ result: rows[0] }); 
});

librarianRouter.route('/:id')
    .get(async (req, res) => {
        const { id: addedlibrarianId } = req.params;

        const sql = `SELECT Librarians.id, firstName, lastName, email, additionDate, deletionDate
            FROM Users JOIN Librarians ON Users.id = Librarians.id WHERE Librarians.id = ?
        `;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([addedlibrarianId]) as any[][];
        conn.unprepare(sql);

        res.json({ result: rows[0][0] });
    })
    .delete(async (req, res) => {
        const { id: memberId } = req.params;

        const sql = `UPDATE Librarians SET deletionDate = NOW() WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([memberId]);
        conn.unprepare(sql);

        res.send('Successfully deleted!');
    });

export default librarianRouter;
