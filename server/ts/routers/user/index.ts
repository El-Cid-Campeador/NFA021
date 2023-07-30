import express from "express";
import bcrypt from "bcrypt";
import { conn, authMiddleware, getUserByEmailOrID, UserSession } from "../../functions.js";
import memberRouter from "./member.js";
import librarianRouter from "./librarian.js";

const userRouter = express.Router();

userRouter.post('/signup', async (req, res) => {
    const sessionUser = req.session as UserSession;
    
    try {
        const { librarianId } = req.query;
        const { id, firstName, lastName, email, password } = req.body;
    
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        let sql = `INSERT INTO Users (id, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?)`;
        let stmt = await conn.prepare(sql);
        await stmt.execute([id, firstName, lastName, email, hash]);
        conn.unprepare(sql);
        
        if (sessionUser && sessionUser.user?.role && librarianId) {
            sql = `INSERT INTO Librarians (id, addedBy) VALUES (?, ?)`;
            stmt = await conn.prepare(sql);
            await stmt.execute([id, librarianId]);
        } else {
            sql = `INSERT INTO Members (id) VALUES (?)`;
            stmt = await conn.prepare(sql);
            await stmt.execute([id]);
        }

        conn.unprepare(sql);
    } catch (err) {
        return res.status(403).send('The ID or email already exists!');
    }
    
    res.send('Successfully registred!');
});

userRouter.post('/login', async (req, res) => {
    const sessionUser = req.session as UserSession;

    try {
        if (sessionUser.user) {
            return res.json({ msg: sessionUser.user });
        }
    
        const { emailOrID, password } = req.body;
    
        const result = await getUserByEmailOrID(emailOrID);
        
        if (result && result.length) {
            const { id, firstName, lastName, password: hash_db } = result[0];
            
            if (bcrypt.compareSync(password, hash_db)) {
                const sql = `SELECT addedBy FROM Librarians WHERE id = ?`;
                const stmt = await conn.prepare(sql);
                const rows = await stmt.execute([id]) as any[][];
                conn.unprepare(sql);
    
                if (rows[0].length) {
                    const { addedBy } = rows[0][0];
    
                    sessionUser.user = { id, firstName, lastName, role: addedBy };
                } else {
                    sessionUser.user = { id, firstName, lastName };
                }
    
                return res.json({ msg: sessionUser.user });
            }        
        }
    } catch (error) {}

    res.status(401).json({ msg: 'Unauthorized!' });
});

userRouter.delete('/logout', authMiddleware, async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(401).send('Unauthorized');
        }

        res.clearCookie('connect.sid');
         
        res.send('Successfully logged out!');
    });   
});

userRouter.use('/members', memberRouter);
userRouter.use('/librarians', librarianRouter);

export default userRouter;
