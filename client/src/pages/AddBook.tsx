import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BookForm from "../components/BookForm";
import NavBar from "../components/NavBar";
import { fetcher } from "../functions";
import useLocalStorage from "../components/useLocalStorage";

const initialValues: Book = {
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

    const { userData: { id }} = useLocalStorage();
    
    const { mutate } = useMutation({
        mutationFn: async (payload: Book) => {            
            const res = await fetcher.post(`http://localhost:8080/books`, { ...payload }, {
                params: {
                    librarianId: id
                }
            });

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
