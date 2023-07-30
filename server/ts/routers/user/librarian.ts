import express from "express";
import { conn, librarianMiddleware } from "../../functions.js";

const librarianRouter = express.Router();

librarianRouter.use(librarianMiddleware);

librarianRouter.get('/', async (req, res) => {
    const sql = `SELECT Librarians.id, firstName, lastName
        FROM Users JOIN Librarians ON Users.id = Librarians.id WHERE addedBy = ? AND Librarians.id != ?
    `;

    try {
        const { librarianId } = req.query;
        
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([librarianId, librarianId]) as any[][];
        conn.unprepare(sql);
    
        res.json({ result: rows[0] }); 
    } catch (error) {
        conn.unprepare(sql);

        res.sendStatus(404);
    }
});

librarianRouter.route('/:id')
    .get(async (req, res) => {
        const sql = `SELECT Librarians.id, firstName, lastName, email, additionDate, deletionDate
            FROM Users JOIN Librarians ON Users.id = Librarians.id WHERE Librarians.id = ? AND addedBy = ?
        `;

        try {
            const { id: addedlibrarianId } = req.params;
            const { librarianId } = req.query;
            
            const stmt = await conn.prepare(sql);
            const rows = await stmt.execute([addedlibrarianId, librarianId]) as any[][];
            conn.unprepare(sql);
    
            res.json({ result: rows[0][0] });
        } catch (error) {
            conn.unprepare(sql);

            res.sendStatus(404);
        }
    })
    .delete(async (req, res) => {
        const sql = `UPDATE Librarians SET deletionDate = NOW() WHERE id = ?`;

        try {
            const { id: memberId } = req.params;
    
            const stmt = await conn.prepare(sql);
            await stmt.execute([memberId]);
            conn.unprepare(sql);
    
            res.send('Successfully deleted!');
        } catch (error) {
            conn.unprepare(sql);
            
            res.sendStatus(404);
        }
    });

export default librarianRouter;
