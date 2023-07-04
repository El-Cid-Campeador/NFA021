import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { BookInfo, fetcher } from "../functions";
import Modal from "../components/Modal";

export default function BookItem() {
    const [isModalShowing, setIsModalShowing] = useState(false);
    
    const { bookId } = useParams();

    const navigate = useNavigate();

    const { isMember } = useSelector((state: RootState) => state.user.value);

    const { data: queryBook, isLoading, error, isFetching } = useQuery({
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
            <h1>{queryBook?.result.title}</h1>
            <img src={queryBook?.result.imgUrl} alt={queryBook?.result.title} />
            <p>{queryBook?.result.descr}</p>
            {
                isMember === 0 && (
                    <div>
                        <button onClick={() => setIsModalShowing(true)}>Delete</button>
                        <button>Edit</button>
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
