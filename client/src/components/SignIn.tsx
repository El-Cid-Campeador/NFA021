import { FormEvent, useEffect, useState } from "react";
import { isInvalid } from "../functions";

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [payload, setPayload] = useState({
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
            <h1>{error}</h1>
        </>
    );
}
