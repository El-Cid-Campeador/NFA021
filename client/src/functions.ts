import axios from "axios";

export function hasEmptyValues(obj: any) {
    for (let key in obj) {
        if (obj[key] === '') {
            return true;
        }
    }

    return false;
}

export async function isAlreadyLoggedIn() {
    try {
        const res = await axios.post(`http://localhost:8080/login`, { email: '', password: ''}, {
            withCredentials: true
        });

        if (res.status === 200) {
            return true;
        }
    } catch(err) {}

    return false;
}
