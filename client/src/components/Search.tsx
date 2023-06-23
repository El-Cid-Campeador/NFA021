import { useQuery } from "@tanstack/react-query";
import { FullBookInfo, fetcher, generateYears } from "../functions";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

export default function Search() {
    const [search, setSearch] = useState('');

    const { data: books, error } = useQuery({
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

    if (error) return <Navigate to="/signin" />;
    
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
            <ul>
                {
                    books?.result.map(book => {
                        return (
                            <li key={book.id}>
                                <Link to={`/books/${book.id}`} >
                                    {book.title}
                                </Link>
                            </li>
                        );
                    })
                }
            </ul>
            {/* <div>
                <label htmlFor=""></label>
                <input type="checkbox" id="" />
            </div>
            <div>
                <label htmlFor="category">Category: </label>
                <select id="category">
                    <option value={"all"}>All</option>
                    <option value={"all"}>Programming</option>
                </select> 
            </div> */}
            <div>
                <label htmlFor="years">Years: </label>
                <select id="years">
                    {
                        generateYears().map(year => {
                            return <option value={year} key={year}>{year}</option>;
                        })
                    }
                </select> 
            </div>
            {/* <div>
                <label htmlFor="language">Language: </label>
                <select id="language">
                    <option value=""></option>
                </select> 
            </div> */}
        </>
    );
}
