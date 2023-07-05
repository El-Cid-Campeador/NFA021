import { useMutation } from "@tanstack/react-query";
import { BookFormData, fetcher } from "../functions";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import BookForm from "../components/BookForm";

export default function EditBook() {
    const { bookId } = useParams();

    const location = useLocation();

    const { state } = location;

    const initialValues: BookFormData = useMemo(() => {
        return state;
    }, []);
    
    const [error, setError] = useState('');

    const navigate = useNavigate();
    
    const { mutate } = useMutation({
        mutationFn: async (payload: BookFormData) => {
            const res = await fetcher.patch(`http://localhost:8080/books/${bookId}`, { ...payload });

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
