import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { fetcher } from "../functions";
import Books from "./Books";
import Members from "./Members";

type Props = {
    queryKey: string,
    route: string,
    placeholder: string
}

function RenderResultByQueryType(queryKey: string, data: never[]) {
    let payload;

    switch (queryKey) {
        case "books":
            payload = data as { id: string, title: string, imgUrl: string }[];

            return <Books result={payload} />
        case "members":
            payload = data as { id: string, firstName: string, lastName: string }[];
            
            return <Members result={data} />
        default:
            return <></>
    }
}

export default function SearchByText({ queryKey, route, placeholder }: Props) {
    const [search, setSearch] = useState('');

    const { data, isLoading, error } = useQuery({
		queryKey: [queryKey, search],
        queryFn: async () => {
            if (search === '' || search.length > 100) {
                return { result: [] };
            }

            const payload = search.toLowerCase();
            const { data } = await fetcher.get(`http://localhost:8080/api${route}`, {
                params: { search: payload }
            });
          
            return data as { result: never[] };
          
        }
	});

    if (error) return <Navigate to="/signin" />;
    
    return (
        <div className="wrapper">
            <div className=" w-[308px] sm:w-[500px] h-[50px] mt-[6.25rem] sm:mt-[10px] mx-auto p-[10px] pb-[55px] border-[1px] border-solid border-customBlue rounded-2xl">
                <input 
                    type="text" 
                    className="w-[288px] sm:w-[480px]"
                    placeholder={placeholder} 
                    maxLength={100}
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
            </div>
            {
                isLoading ? <h1>Loading...</h1> : (
                    RenderResultByQueryType(queryKey, data!.result)
                )
            }
        </div>
    );
}
