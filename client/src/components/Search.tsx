import { useQuery } from "@tanstack/react-query";
import { FullBookInfo, fetcher } from "../functions";
import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function Search() {
    const [] = useState();

    const { data: books, isLoading, error } = useQuery({
		queryKey: ['books'],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/`) ;
            return data as { result: FullBookInfo[] };
        }
	});

	if (isLoading) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />;
    
    return (
        <>
            {/* <input type="radio" name="" id="" />
            {
                <input type="text" id="" placeholder="" />
            }
            {
                <input type="text" id="" placeholder="" />
            } */}
            <div>
                <label htmlFor=""></label>
                <input type="checkbox" id="" />
            </div>
            <div>
                <label htmlFor="category">Category: </label>
                <select id="category">
                    <option value={"all"}>All</option>
                    <option value={"all"}>Programming</option>
                </select> 
            </div>
            <div>
                <label htmlFor="years">Years: </label>
                <select id="years">
                    <option value="">{new Date().getFullYear()}</option>
                </select> 
            </div>
            <div>
                <label htmlFor="language">Language: </label>
                <select id="language">
                    <option value=""></option>
                </select> 
            </div>
        </>
    );
}

/*
    Title Author 
*/
