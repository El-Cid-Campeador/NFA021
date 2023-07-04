import { useMutation } from "@tanstack/react-query";
import { BookFormData, fetcher } from "../functions";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BookForm from "../components/BookForm";

const initialValues: BookFormData = {
    title: 'A', 
    imgUrl: 'B', 
    authorName: 'C', 
    category: 'D',
    lang: 'E',
    descr: 'F',  
    yearPubl: 0, 
    numEdition: 0,
    numPages: 0
}

export default function AddBook() {
    const [error, setError] = useState('');

    const navigate = useNavigate();
    
    const { mutate } = useMutation({
        mutationFn: async (payload: BookFormData) => {
            console.log(payload);
            
            const res = await fetcher.post(`http://localhost:8080/books`, { ...payload });

            return res;
        },
        onSuccess: () => {
            navigate('/dashboard');
        },
        onError: () => {
            setError('Invalid credentials!');
        }
    });

    return (
        <>
            <BookForm 
                onSubmit={mutate}
                initialValues={initialValues}
                error={error}
                setError={setError}
            />
        </>
    );
}
