import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import validator from "validator";
import { isAnyOfTheAttributesAnEmptyString, fetcher } from "../functions";

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [payload, setPayload] = useState({
        email: '',
        password: ''
    }); 

    const [inputError, setInputError] = useState('');

    const navigate = useNavigate();

    const { mutate: signIn, isLoading } = useMutation({
        mutationFn: async () => {
            const res = await fetcher.post(`http://localhost:8080/login`, { ...payload }); 
            
            return res;
        },
        onSuccess: (res) => {
            localStorage.setItem('xUr', JSON.stringify(res.data.msg));

            navigate('/home');
        },
        onError: () => {
            if (isFirstLoad) {
                setInputError('');
                setIsFirstLoad(false);
            } else {
                setInputError('Invalid credentials!');
            }
        }
    });

    function handlesubmit(e: FormEvent) {
        e.preventDefault();

        if (isAnyOfTheAttributesAnEmptyString(payload)) {
            setInputError('No empty fields!');

            return;
        }

        if (!validator.isEmail(payload.email)) {
            setInputError('Invalid email!');
            
            return;
        }

        signIn();
    }

    useEffect(() => {
        signIn();
    }, []);

    useEffect(() => {
        setInputError('');
    }, [payload]);

    if (isLoading) return <h1>Waiting for server...</h1>;

    return (
        <div className="w-[500px] h-[95vh] my-[10px] mx-auto p-[10px] border-[1px]  border-solid border-customBlue rounded-2xl">
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
                    <div className="flex items-center">
                        <label htmlFor="password">Password: </label>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            id="password" 
                            required 
                            value={payload.password} 
                            onChange={(e) => setPayload({ ...payload, password: e.target.value })} 
                        />
                        <div onClick={() => setShowPassword(prev => !prev)} className="ml-[10px] cursor-pointer">
                        {
                            showPassword ? <img src="/eye-slash.svg" alt="Hide password" width={20} height={20} /> : <img src="/eye.svg" alt="Show password" width={20} height={20} />
                        }
                    </div>
                    </div>
                
                <input 
                    type="submit" 
                    value="Login" 
                    className="btn" 
                />
            </form>
            <p className="error">{inputError}</p>

            <br />
            <hr />
            <br />

            <div className="flex items-center">
                <p className="mr-[10px]">Don't have an account?</p>
                <Link to="/" className="text-customBlue">Sign Up</Link>
            </div>
        </div>
    );
}
