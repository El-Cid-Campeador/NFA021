import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
// import validator from "validator";
// import { hasEmptyValues, isAlreadyLoggedIn } from "../functions";
import { fetcher, isAlreadyLoggedIn } from "../functions";

export default function SignIn() {
    // const [showPassword, setShowPassword] = useState(false);
    // const [payload, setPayload] = useState({
    //     email: '',
    //     password: ''
    // }); 

    const [error, setError] = useState('');

    const navigate = useNavigate();

    const { mutate: signIn, isLoading } = useMutation({
        mutationFn: async () => {
            // example@gmail.com  12345678
            return await fetcher.post(`http://localhost:8080/login`, { email: "example@gmail.com", password: "12345678" }); // { ...payload }
        },
        onSuccess: () => {
            navigate('/');
        },
        onError: () => {
            setError('Invalid credentials!');
        }
    });

    function handlesubmit(e: FormEvent) {
        e.preventDefault();

        // if (hasEmptyValues(payload)) {
        //     setError('No empty fields!');
        //     return;
        // }

        // if (!validator.isEmail(payload.email)) {
        //     setError('Invalid email!');
        //     return;
        // }

        signIn();
    }

    useEffect(() => {
        async function verify() { 
            if (await isAlreadyLoggedIn()) {
                navigate('/');
            }
        }

        verify();
    }, []);

    // useEffect(() => {
    //     setError('');
    // }, [payload]);

    if (isLoading) return <h1>Waiting for server...</h1>;

    return (
        <>
            <form onSubmit={(e) => handlesubmit(e)}>
                {/* <div>
                        <label htmlFor="email">Email: </label>
                        <input 
                            type="email" 
                            id="email" 
                            required 
                            value={payload.email} 
                            onChange={(e) => setPayload({ ...payload, email: e.target.value })} 
                        />
                    </div>
                    <div>
                        <label htmlFor="password">New password: </label>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            id="password" 
                            required 
                            value={payload.password} 
                            onChange={(e) => setPayload({ ...payload, password: e.target.value })} 
                        />
                        <span onClick={() => setShowPassword(prev => !prev)}>{showPassword ? 'Hide password' : 'Show password'}</span>
                    </div> */}
                
                <input type="submit" />
            </form>
            <p>{error}</p>
        </>
    );
}

// agkajkda@gmail.com 123ABC_d
