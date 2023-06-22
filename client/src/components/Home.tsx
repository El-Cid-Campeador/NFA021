import { Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FullBookInfo, fetcher  } from "../functions";

export default function Home() {
    const navigate = useNavigate();

    const { data: latestBooks, isLoading, error, isFetching } = useQuery({
        queryKey: ['latest_books'],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/latest`) ;
            return data as { result: FullBookInfo[] };
        }
    });

    const { mutate: signOut } = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`http://localhost:8080/logout`);
        },
        onSuccess: () => {
            navigate('/signin');
        }
    });

    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />

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
