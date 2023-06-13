import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import validator from "validator";
import { hasEmptyValues } from "../functions";

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [payload, setPayload] = useState({
        email: '',
        password: ''
    }); 
    const [error, setError] = useState('');

    const { mutate } = useMutation({
        mutationFn: async () => {
            const res = await axios.post(`http://127.0.0.1:8080/login`, { ...payload });
            if (res.status !== 401) {
                console.log(res.data);
            }
            return res;
        },
        networkMode: 'always'
    });

    function handlesubmit(e: FormEvent) {
        e.preventDefault();

        if (hasEmptyValues(payload)) {
            setError('No empty fields!');
            return;
        }

        if (!validator.isEmail(payload.email)) {
            setError('Invalid email!');
            return;
        }

        mutate();
    }

    useEffect(() => {
        setError('');
    }, [payload]);

    return (
        <>
            <form onSubmit={(e) => handlesubmit(e)}>
                <div>
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
                    </div>
                
                <input type="submit" />
            </form>
            <p>{error}</p>
        </>
    );
}

// agkajkda@gmail.com 123ABC_d
