import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAlreadyLoggedIn } from "../functions";
import axios from "axios";

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        async function verify() { 
            if (!await isAlreadyLoggedIn()) {
                navigate('/signin');
            } else {
                console.clear();
            }
        }

        verify();
    }, []);

    async function click() {
        const { data } = await axios.get(`http://localhost:8080/user`, {
            withCredentials: true
        });

        console.log(data);
    }

    return (
        <div>
            <h1>Welcome!</h1>
            <button onClick={click}>User</button>
        </div>
    );
}
