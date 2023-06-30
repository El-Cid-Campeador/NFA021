import express from "express";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { conn, UserSession, authMiddleware, adminMiddleware } from "../functions.js";

const userRouter = express.Router();

userRouter.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const sql = `INSERT INTO Users (id, firstName, lastName, email, password, isMember, isDeleted) VALUES (?, ?, ?, ?, ?, 1, 0)`;
    const stmt = await conn.prepare(sql);

    await stmt.execute([crypto.randomUUID(), firstName, lastName, email, hash]);
    conn.unprepare(sql);
    
    res.json({ msg: 'Successfully registred!' });
});

userRouter.post('/login', async (req, res) => {
    const sessionUser = req.session as UserSession;

    if (sessionUser.user) {
        return res.json({ msg: sessionUser.user });
    }

    const { email, password } = req.body;

    const sql = `SELECT * FROM Users WHERE email = ? AND isDeleted = 0`;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([email]) as any[][];

    conn.unprepare(sql);
    
    if (rows[0].length) {
        const { firstName, lastName, password: hash_db, isMember } = rows[0][0];
        
        if (bcrypt.compareSync(password, hash_db)) {
            // @ts-ignore
            sessionUser.user = { firstName, lastName, isMember };

            // @ts-ignore
            return res.json({ msg: sessionUser.user });
        }        
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

userRouter.delete('/logout', authMiddleware, async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(401).send('Unauthorized');
        }

        res.clearCookie('connect.sid');
         
        return res.json({ msg: 'Successfully logged out!' });
    });   
});

userRouter.get('/users', adminMiddleware, async (req, res) => {
    const rows = await conn.query(`SELECT * FROM Users WHERE isDeleted = 0`) as any[][];

    res.json({ result: rows[0] }); 
});

userRouter.route('/users/:id')
    .patch(adminMiddleware, async (req, res) => {

    })
    .delete(adminMiddleware, async (req, res) => {
        const { id: memberId } = req.params;

        const sql = `UPDATE Users SET isDeleted = 1 WHERE id = ?`;
        const stmt = await conn.prepare(sql);

        await stmt.execute([memberId]);
        conn.unprepare(sql);
    
        return res.json({ msg: 'Successfully deleted!' });
    });

userRouter.route('/users/:id/fees')
    .get(async (req, res) => {
        const { id: memberId } = req.params;

        const sql = `SELECT SUM(amount) FROM Fees WHERE memberId = ?`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([memberId]) as any[][];

        conn.unprepare(sql);
        
        res.json({ result: rows[0] });
    })
    .post(adminMiddleware, async (req, res) => {
        const { id: memberId } = req.params;
        const { amount } = req.body;

        const sql = `INSERT INTO Fees (id, amount, memberId) VALUES (?, ?, ?)`;
        const stmt = await conn.prepare(sql);

        await stmt.execute([crypto.randomUUID(), amount, memberId]);
        conn.unprepare(sql);
        
        return res.json({ msg: 'Successfully added!' });
    });

export default userRouter;
