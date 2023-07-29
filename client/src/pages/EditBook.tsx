import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import BookForm from "../components/BookForm";
import { fetcher } from "../functions";
import NavBar from "../components/NavBar";
import useLocalStorage from "../components/useLocalStorage";

export default function EditBook() {
    const { bookId } = useParams();
    
    const location = useLocation();
    
    const { state } = location;
    
    const initialValues: Book = useMemo(() => {
        return state;
    }, [state]);
    
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { userData: { id } } = useLocalStorage();
    
    const { mutate } = useMutation({
        mutationFn: async (payload: BookDataInput) => {
            const res = await fetcher.patch(`/api/books/${bookId}`, { ...payload }, {
                params: {
                    librarianId: id
                }
            });

            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            
            navigate(`/books/${bookId}`);
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
                onCancel={() => navigate(`/books/${bookId}`)}
                error={error}
                setError={setError}
            />
        </>
    );
}
