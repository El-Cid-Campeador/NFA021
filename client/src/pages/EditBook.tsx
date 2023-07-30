import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import BookForm from "../components/BookForm";
import { fetcher } from "../functions";
import useLocalStorage from "../components/useLocalStorage";
import Container from "../components/Container";
import Loading from "../components/Loading";

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
    
    const { mutate, isLoading } = useMutation({
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

    if (isLoading) return <Loading />;

    return (
        <Container content={
            <BookForm 
                initialValues={initialValues}
                onSubmit={mutate}
                onCancel={() => navigate(`/books/${bookId}`)}
                error={error}
                setError={setError}
            />
        } />
    );
}
