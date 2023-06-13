import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { conn, customReq, Token, findUser, authMiddleware } from '../functions.js';

const userRouter = express.Router();

userRouter.post('/signup', async(req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const stmt = await conn.prepare(`INSERT INTO Users (id, firstName, lastName, email, password, insertionTimestamp, isMember, isDeleted) VALUES (?, ?, ?, ?, ?, ?, 1, 0)`);
    await stmt.execute([crypto.randomUUID(), firstName, lastName, email, hash, Date.now()]);
    await stmt.close();
    
    res.json({ msg: 'Successfully registred!' });
});

userRouter.post('/login', async(req, res) => {
    let { email, password } = req.body;
    
    let msg = '';

    const token = req.headers['x-auth-token'];

    if (token) {
        try {
            const decoded = jwt.verify(String(token), process.env.JWT_SECRET_KEY!) as Token;
            const { email, password } = decoded;

            if (await findUser(email, password) !== -1) {
                return res.json({ msg: String(token) });
            }
        } catch (err) {}
    }

    if (email && password) {
       const stmt = await conn.prepare(`SELECT * FROM Users WHERE email = ?`);
       const rows = await stmt.execute([email]) as any[][];
       
       if (rows[0].length) {
           const { email, password: hash_db, isMember } = rows[0][0];
           
           if (bcrypt.compareSync(password, hash_db)) {
                msg = jwt.sign({ email, password: hash_db, isMember }, process.env.JWT_SECRET_KEY!);
            }        
        }
    
        await stmt.close();
    }

    if (msg !== '') {
        return res.json({ msg });
    } 

    return res.status(401).json({ msg: 'Unauthorized!' });
});

userRouter.delete('/users/:id', authMiddleware, async(req, res) => {
    if ((req as unknown as customReq).user.isMember === 0) {
        const { id: idMember } = req.params;

        const stmt = await conn.prepare(`UPDATE Users SET isDeleted = 1 WHERE id = ?`);
        await stmt.execute([idMember]);
        await stmt.close();
    
        return res.json({ msg: 'Successfully deleted!' });
    }

    return res.status(401).json({ msg: 'Unauthorized!' });
});

userRouter.route('/users/:id/fees')
    .get(authMiddleware, async(req, res) => {
        const { id: idMember } = req.params;

        const stmt = await conn.prepare(`SELECT SUM(amount) FROM Fees WHERE idMember = ?`);
        const rows = await stmt.execute([idMember]) as any[][];
        
        res.json({ result: rows[0] });
    })
    .post(authMiddleware, async(req, res) => {
        if ((req as unknown as customReq).user.isMember === 0) {
            const { id: idMember } = req.params;
            const { amount } = req.body;

            const stmt = await conn.prepare(`INSERT INTO Fees (id, amount, paymentTimestamp, idMember) VALUES (?, ?, ?, ?)`);
            await stmt.execute([crypto.randomUUID(), amount, Date.now(), idMember]);
            await stmt.close();
            
            return res.json({ msg: 'Successfully added!' });
        }

        return res.status(401).json({ msg: 'Unauthorized!' });
    });

export default userRouter;
