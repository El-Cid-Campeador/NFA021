import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import validator from "validator";
import { fetcher, isAnyOfTheAttributesAnEmptyString } from "../functions";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [payload, setPayload] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [inputError, setInputError] = useState('');

    const navigate = useNavigate();

    const { mutate: signUp } = useMutation({
        mutationFn: async () => {
            return await fetcher.post(`http://localhost:8080/signup`, { ...payload });
        },
        onSuccess: () => {
            navigate('/signin');
        },
        onError: (error: AxiosError<never, never>) => {
            setInputError(error.response!.data);
        }
    });

    function handlesubmit(e: FormEvent) {
        e.preventDefault();

        if (isAnyOfTheAttributesAnEmptyString(payload)) {
            setInputError('No empty fields!');
            
            return;
        }

        const { id, firstName, lastName, email, password } = payload;

        if (isNaN(Number(id)) || id.length !== 12) {
            setInputError('Invalid ID! The ID must be numeric and exactly have 12 characters.');
            
            return;
        }

        if (firstName.length > 50) {
            setInputError('Invalid first name! It must not exceed 50 characters!');

            return;
        }

        if (lastName.length > 50) {
            setInputError('Invalid last name! It must not exceed 50 characters!');

            return;
        }

        if (email.length > 50) {
            setInputError('Invalid email! It must not exceed 50 characters!');

            return;
        }

        if (!validator.isEmail(email)) {
            setInputError('Invalid email!');

            return;
        }

        if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }) 
            || (password).length > 64
        ) {
            setInputError(`Please use a strong password! (Between 8 and 64 characters, and must contain at least: 
                1 uppercase character, 1 lowercase character, 1 digit/number, 1 special character)`
            );
            
            return;
        }

        signUp();
    }

    useEffect(() => {
        setInputError('');
    }, [payload]);

    return (
        <div className="w-[500px] h-[95vh] my-[10px] mx-auto p-[10px] border-[1px]  border-solid border-customBlue rounded-2xl">
            <form onSubmit={(e) => handlesubmit(e)}>
                <div>
                    <label htmlFor="id">ID: </label>
                    <input 
                        type="tel" 
                        id="id" 
                        pattern="\d*"
                        minLength={12}
                        maxLength={12}
                        required 
                        value={payload.id} 
                        onChange={(e) => setPayload({ ...payload, id: e.target.value })} 
                    />
                </div>
                <div>
                    <label htmlFor="firstName">First name: </label>
                    <input 
                        type="text" 
                        id="firstName" 
                        maxLength={50}
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
                        maxLength={50}
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
                        maxLength={50}
                        required 
                        value={payload.email} 
                        onChange={(e) => setPayload({ ...payload, email: e.target.value })} 
                    />
                </div>
                <div className="flex items-center">
                    <label htmlFor="password">New password: </label>
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
                    value="Sign Up" 
                    className="btn" 
                />
            </form>
            <p className="error-msg">{inputError}</p>

            <br />
            <hr />
            <br />
            
            <div className="flex items-center">
                <p className="mr-[10px]">Already have an account?</p>
                <Link to="/signin" className="text-customBlue">Sign In</Link>
            </div>
        </div>
    );
}
