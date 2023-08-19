# NFA021

This is a project for my college subject named "NFA021". It's about building a library website for members and librarians to manage book-related operations.

---

**Prerequisites**:

* Docker

To launch the project, open a new terminal and run those commands:

```bash
$ git clone https://github.com/El-Cid-Campeador/NFA021 && cd NFA021
$ cd server && npm i
$ cd ../client && npm i && npm run build
$ cd ../
$ docker compose down && docker compose build --no-cache
$ docker compose up
```

Open `http://localhost:5173` in a browser.

-> Admin's password: <Xu_Q|m9xR^SwCdTJP2b
