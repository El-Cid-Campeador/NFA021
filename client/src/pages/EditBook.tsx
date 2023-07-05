import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import BookForm from "../components/BookForm";
import { BookFormData, fetcher } from "../functions";
import NavBar from "./NavBar";

export default function EditBook() {
    const { bookId } = useParams();
    
    const location = useLocation();
    
    const { state } = location;
    
    const initialValues: BookFormData = useMemo(() => {
        return state;
    }, []);
    
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    
    const { mutate } = useMutation({
        mutationFn: async (payload: BookFormData) => {
            const res = await fetcher.patch(`http://localhost:8080/books/${bookId}`, { ...payload });

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
                onSubmit={mutate}
                initialValues={initialValues}
                error={error}
                setError={setError}
            />
        </>
    );
}
