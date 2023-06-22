import { useQuery } from "@tanstack/react-query";
import { PartialBookInfo, fetcher } from "../functions";
import { Navigate, useParams } from "react-router-dom";

export default function BookItem() {
    const { bookId } = useParams();

    const { data: book, isLoading, error, isFetching } = useQuery({
        queryKey: ['latest_books'],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/${bookId}`) ;
            return data as { result: PartialBookInfo };
        }
    });
    
    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />

    return (
        <div>
            <h1>{book?.result.title}</h1>
            <img src={book?.result.imgUrl} alt={book?.result.title} />
            <p>{book?.result.descr}</p>
        </div>
    );
}
