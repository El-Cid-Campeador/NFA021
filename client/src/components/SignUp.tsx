import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import validator from "validator";
import { fetcher, hasEmptyValues } from "../functions";

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [payload, setPayload] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const { mutate: signUp } = useMutation({
        mutationFn: async () => {
            return await fetcher.post(`http://localhost:8080/signup`, { ...payload });
        }
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

        if (!validator.isStrongPassword(payload.password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, })) {
            setError('Please use a strong password! (Minimum 8 characters & at least: 1 uppercase character, 1 lowercase character, 1 digit/number, 1special character)');
            return;
        }

        signUp();
    }

    useEffect(() => {
        setError('');
    }, [payload]);

    return (
        <>
            <form onSubmit={(e) => handlesubmit(e)}>
                <div>
                    <label htmlFor="firstName">First name: </label>
                    <input 
                        type="text" 
                        id="firstName" 
                        required 
                        value={payload.firstName} 
                        onChange={(e) => setPayload({ ...payload, firstName: e.target.value })} 
                    />
                </div>
                <div>
                    <label htmlFor="lastName">Last name: </label>
                    <input 
                        type="text" 
                        id="lastName" 
                        required 
                        value={payload.lastName} 
                        onChange={(e) => setPayload({ ...payload, lastName: e.target.value })} 
                    />
                </div>
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

                <input type="submit" value="Sign Up" />
            </form>
            <p>{error}</p>
        </>
    );
}
