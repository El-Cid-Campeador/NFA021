import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BookInfo, fetcher } from "../functions";
import Modal from "../components/Modal";
import useLocalStorage from "../components/useLocalStorage";

export default function BookItem() {
    const [isModalShowing, setIsModalShowing] = useState(false);
    
    const { bookId } = useParams();

    const navigate = useNavigate();

    const { userData: { isMember } } = useLocalStorage();

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['books', bookId],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/${bookId}`);
            if (data.result) {
                return data as { result: BookInfo };
            }

            throw new Error();
        }
    });

    const { mutate: deleteBook } = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`http://localhost:8080/books/${bookId}`);
        },
        onSuccess: () => {
            navigate('/home');
        },
        onError: () => {
           navigate('/signin');
        }
    });
    
    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />;

    return (
        <div>
            <h1>{data?.result.title}</h1>
            <img src={data?.result.imgUrl} alt={data?.result.title} />
            <p>{data?.result.descr}</p>
            {
                isMember === 0 && (
                    <div>
                        <button onClick={() => setIsModalShowing(true)}>Delete</button>
                        <button onClick={() => navigate(`/edit-book/${bookId}`, { state: data?.result })}>Edit</button>
                        {
                            isModalShowing && (
                                <Modal 
                                    message="Are you sure to delete this book?" 
                                    onConfirm={() => deleteBook()} 
                                    onCancel={() => setIsModalShowing(false)}
                                />
                            )
                        }
                    </div>
                )
            }
        </div>
    );
}
