import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Books from "../components/Books";
import { fetcher } from "../functions";
import { useEffect } from "react";
import Container from "../components/Container";
import useLocalStorage from "../components/useLocalStorage";

export default function Home() {
    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['books', 'latest'],
        queryFn: async () => {
            const { data } = await fetcher.get(`/api/books/latest`);
            
            return data as { result: { id: string, title: string, imgUrl: string }[] };
        }
    });

    useEffect(() => {
        console.clear();
    }, []);

    const { userData: { firstName, lastName } } = useLocalStorage();

    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />;

    return (
        <Container content={
            <>
                <h1>Welcome {firstName} {lastName}!</h1>
                <h2 className="font-extrabold ">The 3 latest books: </h2>
                <Books result={data!.result} />
            </>
        } />
    );
}
