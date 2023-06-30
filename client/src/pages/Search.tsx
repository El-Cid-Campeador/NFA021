import { useQuery } from "@tanstack/react-query";
import { FullBookInfo, fetcher } from "../functions";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Books from "../components/Books";

export default function Search() {
    const [search, setSearch] = useState('');

    const { data: queryByText, isLoading: isLoadingByText, error: errorByText } = useQuery({
		queryKey: ['books', search],
        queryFn: async () => {
            if (search === '') {
                return { result: [] };
            }

            const payload = search.toLowerCase();
            const { data } = await fetcher.get(`http://localhost:8080/books/search/${payload}`) ;

            return data as { result: FullBookInfo[] };
        }
	});

    if (errorByText) return <Navigate to="/signin" />;
    
    return (
        <>
            <div>
                <input 
                    type="text" 
                    placeholder={"Title or author key-words"} 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
            </div>
            {
                isLoadingByText ? <h1>Loading...</h1> : (
                   <Books queryResult={queryByText!} />
                )
            }
        </>
    );
}
