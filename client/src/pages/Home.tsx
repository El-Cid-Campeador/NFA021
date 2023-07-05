import { Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BookInfo, fetcher } from "../functions";
import Books from "../components/Books";
import useLocalStorage from "../components/useLocalStorage";

export default function Home() {
    const navigate = useNavigate();

    const { userData: { firstName, lastName } } = useLocalStorage();

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['latest_books'],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/latest`);

            return data as { result: BookInfo[] };
        }
    });

    const { mutate: signOut } = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`http://localhost:8080/logout`);
        },
        onSuccess: () => {
            navigate('/');
        },
        onError: () => {
            navigate('/');
        }
    });

    // if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />;

    return (
        <>
            <div className="container">
                <h1>Welcome {firstName} {lastName}!</h1>
                <button onClick={() => signOut()} className="btn">
                    Sign out
                </button>
                {
                    isLoading || isFetching ? <h1>Loading...</h1> : (
                        <Books result={data!.result
                        } />
                    )
                }
            </div>
        </>
    );
}
