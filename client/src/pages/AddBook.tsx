import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BookForm from "../components/BookForm";
import NavBar from "../components/NavBar";
import { fetcher } from "../functions";

const initialValues: BookFormData = {
    title: '', 
    imgUrl: '', 
    authorName: '', 
    category: '',
    lang: '',
    descr: '',  
    yearPubl: new Date().getFullYear(), 
    numEdition: 1,
    nbrPages: 100
}

export default function AddBook() {
    const [error, setError] = useState('');

    const navigate = useNavigate();
    
    const queryClient = useQueryClient();
    
    const { mutate } = useMutation({
        mutationFn: async (payload: BookFormData) => {            
            const res = await fetcher.post(`http://localhost:8080/books`, { ...payload });

            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            
            navigate('/dashboard');
        },
        onError: () => {
            setError('Invalid credentials!');
        }
    });

    return (
        <>
            <NavBar />
            <BookForm 
                initialValues={initialValues}
                onSubmit={mutate}
                onCancel={() => navigate('/dashboard')}
                error={error}
                setError={setError}
            />
        </>
    );
}
