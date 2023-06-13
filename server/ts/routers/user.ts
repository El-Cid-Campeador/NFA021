import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { conn, customReq, Token, findUser, authMiddleware } from "../functions.js";

const userRouter = express.Router();

userRouter.post('/signup', async(req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const sql = `INSERT INTO Users (id, firstName, lastName, email, password, insertionTimestamp, isMember, isDeleted) VALUES (?, ?, ?, ?, ?, ?, 1, 0)`;
    const stmt = await conn.prepare(sql);
    await stmt.execute([crypto.randomUUID(), firstName, lastName, email, hash, Date.now()]);
    conn.unprepare(sql);
    
    res.json({ msg: 'Successfully registred!' });
});

userRouter.post('/login', async(req, res) => {
    const { email, password } = req.body;

    const token = req.headers['x-auth-token'];

    if (token) {
        try {
            const decoded = jwt.verify(String(token), process.env.JWT_SECRET_KEY!) as Token;
            const decodedEmail = decoded.email;
            const decodedPassword = decoded.password;

            if (await findUser(decodedEmail, decodedPassword) !== -1) {
                return res.json({ msg: String(token) });
            }
        } catch (err) {}
    }

    if (email && password) {
        const sql = `SELECT * FROM Users WHERE email = ?`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([email]) as any[][];
        conn.unprepare(sql);
       
        if (rows[0].length) {
           const { firstName, lastName, email, password: hash_db, isMember } = rows[0][0];
           
           if (bcrypt.compareSync(password, hash_db)) {
                return res.json({ msg: jwt.sign({ firstName, lastName, email, password: hash_db, isMember }, process.env.JWT_SECRET_KEY!) });
            }        
        } 
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

userRouter.delete('/users/:id', authMiddleware, async(req, res) => {
    if ((req as unknown as customReq).user.isMember === 0) {
        const { id: idMember } = req.params;

        const sql = `UPDATE Users SET isDeleted = 1 WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([idMember]);
        conn.unprepare(sql);
    
        return res.json({ msg: 'Successfully deleted!' });
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

userRouter.route('/users/:id/fees')
    .get(authMiddleware, async(req, res) => {
        const { id: idMember } = req.params;

        const sql = `SELECT SUM(amount) FROM Fees WHERE idMember = ?`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([idMember]) as any[][];
        conn.unprepare(sql);
        
        res.json({ result: rows[0] });
    })
    .post(authMiddleware, async(req, res) => {
        if ((req as unknown as customReq).user.isMember === 0) {
            const { id: idMember } = req.params;
            const { amount } = req.body;

            const sql = `INSERT INTO Fees (id, amount, paymentTimestamp, idMember) VALUES (?, ?, ?, ?)`;
            const stmt = await conn.prepare(sql);
            await stmt.execute([crypto.randomUUID(), amount, Date.now(), idMember]);
            conn.unprepare(sql);
            
            return res.json({ msg: 'Successfully added!' });
        }

        return res.status(401).json({ msg: 'Unauthorized!' });
    });

export default userRouter;
