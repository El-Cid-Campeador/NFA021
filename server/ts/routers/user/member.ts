import express from "express";
import path from "node:path";
import fs from "node:fs";
import { conn, getMember, getTotalFeesByYear, librarianMiddleware } from "../../functions";

const memberRouter = express.Router();

memberRouter.get('/', librarianMiddleware, async (req, res) => {
    const { search } = req.query;
    const payload = `%${search}%`;

    const sql = `SELECT Users.* FROM Users JOIN Members ON Users.id = Members.id WHERE (id LIKE ? OR firstName LIKE ? OR lastName LIKE ?)`;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([payload, payload, payload]) as any[][];
    conn.unprepare(sql);

    res.json({ result: rows[0] }); 
});

memberRouter.route('/fees')
    .get(librarianMiddleware, async (req, res) => {
        const { id: memberId } = req.query;

        const sql = `SELECT * FROM Fees WHERE memberId = ? ORDER BY paymentDate`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([memberId]) as any[][];
        conn.unprepare(sql);

        const total = await getTotalFeesByYear(String(memberId));

        const jsonContent = fs.readFileSync(path.resolve('data.json'), { encoding: 'utf-8' });
        
        res.json({ result: rows[0], total, price: JSON.parse(jsonContent).price });
    }).post(librarianMiddleware, async (req, res) => {
        const { memberId, librarianId } = req.query;
        const { amount, year } = req.body;
        
        const sql = `INSERT INTO Fees (id, amount, year, memberId, librarianId) VALUES (UUID(), ?, ?, ?)`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([Number(amount), Number(year), memberId, librarianId]);
        conn.unprepare(sql);
        
        res.json({ msg: 'Successfully added!' });
    });

memberRouter.route('/:id')
    .get(librarianMiddleware, async (req, res) => {
        const { id: memberId } = req.params;

        res.json({ result: (await getMember(memberId))[0] });
    })
    .delete(librarianMiddleware, async (req, res) => {
        const { librarianId } = req.query;
        const { id: memberId } = req.params;

        const sql = `UPDATE Members SET deletedBy = ?, deletionDate = CURRENT_TIMESTAMP WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([librarianId, memberId]);
        conn.unprepare(sql);
    
        res.json({ msg: 'Successfully deleted!' });
    });

export default memberRouter;
