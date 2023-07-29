import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BookForm from "../components/BookForm";
import { fetcher } from "../functions";
import useLocalStorage from "../components/useLocalStorage";
import Container from "../components/Container";

const initialValues: BookDataInput = {
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
        mutationFn: async (payload: BookDataInput) => {            
            const res = await fetcher.post(`/api/books`, { ...payload }, {
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
        <Container content={
            <div className="wrapper">
                <BookForm 
                    initialValues={initialValues}
                    onSubmit={mutate}
                    onCancel={() => navigate('/dashboard')}
                    error={error}
                    setError={setError}
                />
            </div>
        } />
        
    );
}
