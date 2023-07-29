import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { isAnyOfTheAttributesAnEmptyString, fetcher } from "../functions";

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [payload, setPayload] = useState({
        emailOrID: '',
        password: ''
    }); 

    const [inputError, setInputError] = useState('');

    const navigate = useNavigate();

    const { mutate: signIn, isLoading } = useMutation({
        mutationFn: async () => {
            const res = await fetcher.post(`/api/login`, { ...payload }); 
            
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

        const { emailOrID, password } = payload;

        if (emailOrID.length > 50) {
            setInputError('Invalid email! It must not exceed 50 characters!');

            return;
        }

        if (password.length > 64) {
            setInputError('Invalid email! It must not exceed 64 characters!');

            return;
        }

        signIn();
    }

    useEffect(() => {
        setIsFirstLoad(true);
    }, []);

    useEffect(() => {
        signIn();
    }, [signIn]);

    useEffect(() => {
        setInputError('');
    }, [payload]);

    if (isLoading) return <h1>Waiting for server...</h1>;

    return (
        <div className="w-[310px] sm:w-[500px] h-auto sm:h-[95vh] mt-[6.25rem] sm:mt-[10px] mx-auto p-[10px] border-[1px] border-solid border-customBlue rounded-2xl">
            <form onSubmit={(e) => handlesubmit(e)}>
                <div>
                        <label htmlFor="emailOrID">Email or ID: </label>
                        <input 
                            type="text" 
                            id="emailOrID"
                            maxLength={50} 
                            required 
                            value={payload.emailOrID} 
                            onChange={(e) => setPayload({ ...payload, emailOrID: e.target.value })} 
                        />
                    </div>
                    <div className="flex flex-wrap items-center">
                        <label htmlFor="password">Password: </label>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            id="password" 
                            maxLength={64}
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
            <p className="error-msg">{inputError}</p>

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
