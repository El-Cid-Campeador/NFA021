import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom"
import { FullBookInfo, fetcher } from "../functions";
import Books from "./Books";
import SearchOptions from "./SearchOptions";

export default function ExploreByParameter() {
    const { column, value } = useParams();

     const { data: queryBooks, isLoading, error } = useQuery({
		queryKey: ['books', column, value],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/explore/${column}/${value}`) ;

            return data as { result: FullBookInfo[] };
        }
	});

    if (isLoading) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />

    return (
        <>
            <SearchOptions />
            {
                queryBooks!.result.length > 0 ? (
                    <Books queryResult={queryBooks!} />
                ) : <p>No books found!</p>
            }
        </>
    );
}
