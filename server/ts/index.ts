import express from 'express';
import cors from 'cors';
import router from './routers/index.js';

const PORT = 8080;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.all('/*', (req, res) => {
    res.status(404).send('Page not found!');
});

app.listen(PORT, () => {
    console.log(`At http://127.0.0.1:${PORT}`);
});

// ['./ts/**/*'] -> ['./ts']
