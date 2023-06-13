import { FormEvent, useEffect, useState } from "react";
import { isInvalid } from "../functions";

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [payload, setPayload] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    }); 
    const [error, setError] = useState('');

    function handlesubmit(e: FormEvent) {
        e.preventDefault();

        if (isInvalid(payload)) {
            setError('Invalid fields!');
            return
        }

        console.log(payload);
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

                <input type="submit" value="Sign In" />
            </form>
            <h1>{error}</h1>
        </>
    );
}

// afasgas@gmail.com
