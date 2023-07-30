import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../components/useLocalStorage";
import { useMutation } from "@tanstack/react-query";
import { fetcher, isAnyOfTheAttributesAnEmptyString } from "../functions";
import { AxiosError } from "axios";
import validator from "validator";
import Modal from "../components/Modal";
import Container from "../components/Container";

export default function AddLibrarian() {
    const [showPassword, setShowPassword] = useState(false);
    const [payload, setPayload] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [inputError, setInputError] = useState('');

    const [isModalShowing, setIsModalShowing] = useState(false);

    const navigate = useNavigate();

    const { mutate: addNewLibrarian } = useMutation({
        mutationFn: async () => {
            return await fetcher.post(`/api/signup`, { ...payload }, {
                params: {
                    librarianId: id
                }
            });
        },
        onSuccess: () => {
            navigate('/signin');
        },
        onError: (error: AxiosError<never, never>) => {
            setInputError(error.response!.data);
        }
    });
    
    const { userData: { id } } = useLocalStorage()

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

        setIsModalShowing(true);
    }

    useEffect(() => {
        setInputError('');
    }, [payload]);

    return (
        <Container content={
            <div className="w-[310px] sm:w-[500px] h-auto sm:h-[95vh] mt-[20px] sm:mt-[10px] mx-auto p-[10px] border-[1px] border-solid border-customBlue rounded-2xl">
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
                    <div className="flex flex-wrap items-center">
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
                                showPassword ? (
                                    <img src="/eye-slash.svg" alt="Hide password" width={20} height={20} />
                                ) : (
                                    <img src="/eye.svg" alt="Show password" width={20} height={20} />
                                )
                            }
                        </div>
                    </div>
                    <button type="submit">
                        <img 
                            src="/user-check.svg" 
                            alt="Add The Librarian" 
                            title="Add The Librarian" 
                            width={50} 
                            height={50} 
                            className="cursor-pointer"
                        />
                    </button>
                </form>
                <p className="error-msg">{inputError}</p>
                {
                    isModalShowing ? (
                        <Modal 
                            message={`Are you sure to add ${payload.firstName} ${payload.lastName} as a librarian?`} 
                            onConfirm={() => addNewLibrarian()} 
                            onCancel={() => setIsModalShowing(false)} 
                        />
                    ) : <></>
                }  
            </div>
        } />      
    );
}
