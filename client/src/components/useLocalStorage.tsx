import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useLocalStorage() {
    const [userData, setUserData] = useState<User>({
        id: '',
        firstName: '',
        lastName: '',
        role: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const store = localStorage.getItem('xUr');

        if (store) {
            setUserData(JSON.parse(store));
        } else {
            navigate('/signin');
        }
    }, []);

    return { userData };
}
