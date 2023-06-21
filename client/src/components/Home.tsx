import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Book, fetcher  } from "../functions";

export default function Home() {
    const navigate = useNavigate();

    const { mutate: signOut } = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`http://localhost:8080/logout`);
        },
        onSuccess: () => {
            navigate('/signin');
        }
    });

    const { data: latestBooks, isLoading } = useQuery({
        queryKey: ['latest_books'],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/latest`) ;
            return data as { result: Book[] };
        },
        retryOnMount: false
    });

    if (isLoading) return <h1>Loading...</h1>;

    return (
        <div>
            <h1>Welcome!</h1>
            <button onClick={() => signOut()}>Sign out</button>
            <ul>
                {
                    latestBooks?.result.map(book => {
                        return (
                            <li onClick={() => navigate(`${book.id}`)} key={book.id}>
                                {book.title}
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
}
