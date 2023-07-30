# NFA021

This is a project for my college subject named "NFA021". It's about building a website for a library.

---

**Prerequisites**:

* Any Linux distribution or MAC OS
* NodeJS v18.16.0

  Check:

```bash
$ node -v
$ npm -v
```

* MariaDB v10.5.20

  Check:

```bash
$ mariadb --version
```

* Redis v7.0.12

  Check:

```$bash
$ redis-cli --version
```

Create a database named `nfa021` in MySQL.

To launch the project, open a new terminal:

```bash
$ npm i -g typescript
$ git clone https://github.com/El-Cid-Campeador/NFA021
$ cd NFA021/server && mysql -u root -p nfa021 < ./script.sql
$ npm i && tsc -w
```

* Create a .env in *server* folder, and add **attentively** those lines:

```.env
DB_PASSWORD=YourMySQLPassword
SECRET_KEY=YourSecretkey
PORT=8080
NODE_ENV=development
```

* Open another terminal, then run:

```bash
$ cd NFA021/server && npm run dev
```

* Open another new terminal, then execute:

```bash
$ cd NFA021/client && npm i && npm run dev
```

* Open `http://localhost:5173` in your favourite browser, and enjoy!
