import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useLocalStorage from "../components/useLocalStorage";
import Books from "../components/Books";
import { fetcher } from "../functions";
import { useEffect } from "react";
import NavBar from "../components/NavBar";

export default function Home() {
    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['books'],
        queryFn: async () => {
            const { data } = await fetcher.get(`/api/books/latest`);
            
            return data as { result: Book[] };
        }
    });
    
    const { userData: { firstName, lastName } } = useLocalStorage();

    useEffect(() => {
        console.clear();
    }, []);

    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />;

    return (
        <>
            <NavBar />
            <div className="m-[10px]">
                <h1>Welcome {firstName} {lastName}!</h1>
                <h2 className="font-extrabold ">The 3 latest books: </h2>
                <Books result={data!.result} />
            </div>
        </>
    );
}
