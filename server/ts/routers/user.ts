import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import "dotenv/config";
import { authMiddleware, conn } from "../functions.js";

const userRouter = express.Router();

userRouter.get('/users', async (req, res) => {
    const rows = await conn.query(`SELECT * FROM Users WHERE isDeleted = 0`) as any[][];

    res.json({ result: rows[0] }); 
});

userRouter.post('/signup', async(req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const sql = `INSERT INTO Users (id, firstName, lastName, email, password, isMember, isDeleted) VALUES (?, ?, ?, ?, ?, 1, 0)`;
    const stmt = await conn.prepare(sql);

    await stmt.execute([crypto.randomUUID(), firstName, lastName, email, hash]);
    conn.unprepare(sql);
    
    res.json({ msg: 'Successfully registred!' });
});

userRouter.post('/login', async(req, res) => {
    // @ts-ignore
    if (req.user) {
        // @ts-ignore
        const { firstName, lastName } = req.user;
        
        return res.json({ firstName, lastName });
    }

    const { email, password } = req.body;

    const sql = `SELECT * FROM Users WHERE email = ? AND isDeleted = 0`;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([email]) as any[][];

    conn.unprepare(sql);
    
    if (rows[0].length) {
        const { firstName, lastName, password: hash_db, isMember } = rows[0][0];
        
        if (bcrypt.compareSync(password, hash_db)) {
            const sessionId = crypto.randomUUID();

            res.cookie('token', jwt.sign({ sessionId, firstName, lastName, isMember }, process.env.JWT_SECRET_KEY!), {
                expires: new Date(Date.now() + 5 * 60 * 1000),
                httpOnly: true,
                sameSite: 'none',
                secure: true
            });

            // @ts-ignore
            req.user = { sessionId, firstName, lastName, isMember };

            return res.json({ firstName, lastName });
        }        
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

userRouter.delete('/logout', authMiddleware, async(req, res) => {
    // const sql = `UPDATE Sessions SET isValid = 0 WHERE id = ?`;null
    // const stmt = await conn.prepare(sql);

    // // @ts-ignore
    // await stmt.execute([req.user.sessionId]);
    // conn.unprepare(sql);

    res.clearCookie('token');

    // @ts-ignore
    req.user = undefined;

    res.json({ msg: 'Successfully logged out!' });
});

userRouter.delete('/users/:id', authMiddleware, async(req, res) => {
    // @ts-ignore
    if (req.user.isMember === 0) {
        const { id: memberId } = req.params;

        const sql = `UPDATE Users SET isDeleted = 1 WHERE id = ?`;
        const stmt = await conn.prepare(sql);

        await stmt.execute([memberId]);
        conn.unprepare(sql);
    
        return res.json({ msg: 'Successfully deleted!' });
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

userRouter.route('/users/:id/fees')
    .get(authMiddleware, async(req, res) => {
        const { id: memberId } = req.params;

        const sql = `SELECT SUM(amount) FROM Fees WHERE memberId = ?`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([memberId]) as any[][];

        conn.unprepare(sql);
        
        res.json({ result: rows[0] });
    })
    .post(authMiddleware, async(req, res) => {
        // @ts-ignore
        if (req.user.isMember === 0) {
            const { id: memberId } = req.params;
            const { amount } = req.body;

            const sql = `INSERT INTO Fees (id, amount, memberId) VALUES (?, ?, ?)`;
            const stmt = await conn.prepare(sql);

            await stmt.execute([crypto.randomUUID(), amount, memberId]);
            conn.unprepare(sql);
            
            return res.json({ msg: 'Successfully added!' });
        }

        return res.status(401).json({ msg: 'Unauthorized!' });
    });

export default userRouter;
