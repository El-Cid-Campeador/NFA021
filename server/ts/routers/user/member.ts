import express from "express";
import path from "node:path";
import fs from "node:fs";
import { conn, librarianMiddleware } from "../../functions.js";

const memberRouter = express.Router();

memberRouter.use(librarianMiddleware);

memberRouter.get('/', async (req, res) => {
    const sql = `SELECT Members.id, firstName, lastName
        FROM Users JOIN Members ON Users.id = Members.id WHERE (Members.id LIKE ? OR firstName LIKE ? OR lastName LIKE ?)
    `;

    try {
        const { search } = req.query;
        const payload = `%${search}%`;
    
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([payload, payload, payload]) as any[][];
        conn.unprepare(sql);
    
        res.json({ result: rows[0] }); 
    } catch (error) {
        conn.unprepare(sql);

        res.sendStatus(404);
    }
});

memberRouter.route('/fees')
    .get(async (req, res) => {
        const sql = `SELECT id, year, SUM(amount) AS amount FROM Fees WHERE memberId = ? GROUP BY year`;

        try {
            const { memberId } = req.query;
    
            const stmt = await conn.prepare(sql);
            const rows = await stmt.execute([memberId]) as any[][];
            conn.unprepare(sql);
    
            const jsonContent = fs.readFileSync(path.resolve('data.json'), { encoding: 'utf-8' });
            
            res.json({ total: rows[0], price: JSON.parse(jsonContent).price });
        } catch (error) {
            conn.unprepare(sql);

            res.sendStatus(404);
        }
    }).post(async (req, res) => {
        const sql = `INSERT INTO Fees (id, amount, year, memberId, librarianId) VALUES (UUID(), ?, ?, ?, ?)`;

        try {
            const { memberId, librarianId } = req.query;
            const { amount, year } = req.body;
            
            const stmt = await conn.prepare(sql);
            await stmt.execute([Number(amount), Number(year), memberId, librarianId]);
            conn.unprepare(sql);
            
            res.send('Successfully added!');
        } catch (error) {
            conn.unprepare(sql);

            res.sendStatus(404);
        }
    });

memberRouter.get('/fees_details', async (req, res) => {
    const sql = `SELECT id, amount, year, librarianId, paymentDate FROM Fees WHERE memberId = ? ORDER BY paymentDate`;

    try {
        const { memberId } = req.query;
    
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([memberId]) as any[][];
        conn.unprepare(sql);
        
        res.json({ result: rows[0] });
    } catch (error) {
        conn.unprepare(sql);

        res.sendStatus(404);
    }
});

memberRouter.route('/:id')
    .get(async (req, res) => {
        const sql = `SELECT Members.id, firstName, lastName, email, additionDate, deletionDate, deletedBy 
            FROM Users JOIN Members ON Users.id = Members.id WHERE Members.id = ?
        `;

        try {
            const { id: memberId } = req.params;

            const stmt = await conn.prepare(sql);
            const rows = await stmt.execute([memberId]) as any[][];
            conn.unprepare(sql);
    
            res.json({ result: rows[0][0] });
        } catch (error) {
            conn.unprepare(sql);

            res.sendStatus(404);
        }
    })
    .delete(async (req, res) => {
        let sql = `UPDATE Members SET deletedBy = ? WHERE id = ?`;

        try {
            const { librarianId } = req.query;
            const { id: memberId } = req.params;
            
            let stmt = await conn.prepare(sql);
            await stmt.execute([librarianId, memberId]);
            conn.unprepare(sql);

            sql = `UPDATE Users SET deletionDate = NOW() WHERE id = ?`;

            stmt = await conn.prepare(sql);
            await stmt.execute([memberId]);
            conn.unprepare(sql);
        
            res.send('Successfully deleted!');   
        } catch (error) {
            conn.unprepare(sql);

            res.sendStatus(404);
        }
    });

export default memberRouter;
