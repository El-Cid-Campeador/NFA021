import express from "express";
import bcrypt from "bcrypt";
import { conn, UserSession, authMiddleware, adminMiddleware, createUser } from "../functions.js";

const userRouter = express.Router();

userRouter.post('/signup', async (req, res) => {
    const sessionUser = req.session as UserSession;

    if (sessionUser.user && sessionUser.user.isMember === 0) {
        await createUser(req, 0);
    } else {
        await createUser(req, 1);
    }
    
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
        const { id, firstName, lastName, password: hash_db, isMember } = rows[0][0];
        
        if (bcrypt.compareSync(password, hash_db)) {
            sessionUser.user = { id, firstName, lastName, isMember };

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

userRouter.route('/users/fees')
    .get(authMiddleware, async (req, res) => {
        const { id: memberId } = req.query;

        const sql = `SELECT SUM(amount) AS amount FROM Fees WHERE memberId = ? GROUP BY year`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([memberId]) as any[][];
        conn.unprepare(sql);
        
        res.json({ result: rows[0] });
    })
    .post(adminMiddleware, async (req, res) => {
        const { id: memberId } = req.query;
        const { amount, year } = req.body;

        const sql = `INSERT INTO Fees (id, amount, memberId, year) VALUES (UUID(), ?, ?, ?)`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([amount, memberId, year]);
        conn.unprepare(sql);
        
        return res.json({ msg: 'Successfully added!' });
    });

userRouter.get('/members', adminMiddleware, async (req, res) => {
    const { search } = req.query;
    const payload = `%${search}%`;

    const sql = `SELECT * FROM Users WHERE isDeleted = 0 AND isMember = 1 AND (id LIKE ? OR firstName LIKE ? OR lastName LIKE ?)`;
    const stmt = await conn.prepare(sql);
    const rows = await stmt.execute([payload, payload, payload]) as any[][];
    conn.unprepare(sql);

    res.json({ result: rows[0] }); 
});

userRouter.route('/users/:id')
    .get(adminMiddleware, async (req, res) => {
        const { id: memberId } = req.params;

        const sql = `SELECT * FROM Users WHERE isDeleted = 0 AND id = ?`;
        const stmt = await conn.prepare(sql);
        const rows = await stmt.execute([memberId]) as any[][];
        conn.unprepare(sql);
        
        res.json({ result: rows[0][0] });
    })
    .delete(adminMiddleware, async (req, res) => {
        const { id: memberId } = req.params;

        const sql = `UPDATE Users SET isDeleted = 1 WHERE id = ?`;
        const stmt = await conn.prepare(sql);
        await stmt.execute([memberId]);
        conn.unprepare(sql);
    
        return res.json({ msg: 'Successfully deleted!' });
    });

export default userRouter;
