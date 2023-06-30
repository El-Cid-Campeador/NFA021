import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { FullBookInfo, fetcher } from "../functions";
import Books from "../components/Books";

export default function Home() {
    const navigate = useNavigate();

    const { firstName, lastName } = useSelector((state: RootState) => state.user.value);

    const { data: querylatestBooks, isLoading, error, isFetching } = useQuery({
        queryKey: ['latest_books'],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/latest`);

            return data as { result: FullBookInfo[] };
        }
    });

    const { mutate: signOut } = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`http://localhost:8080/logout`);
        },
        onSuccess: () => {
            navigate('/signin');
        },
        onError: () => {
            navigate('/signin');
        }
    });

    // if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />

    return (
        <div>
            <h1>Welcome {firstName} {lastName}!</h1>
            <button onClick={() => signOut()}>Sign out</button>
            {
                isLoading || isFetching ? <h1>Loading...</h1> : (
                    <Books queryResult={querylatestBooks!} />
                )
            }
            <div>
                <Link to="/search">Search</Link>
            </div>
            <div>
                <Link to="/advanced_search">Advanced Search</Link>
            </div>
        </div>
    );
}
