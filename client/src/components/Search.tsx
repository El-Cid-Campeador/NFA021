// import { useQuery } from "@tanstack/react-query";
// import { FullBookInfo, fetcher } from "./functions";

export default function Search() {
    	// const { data: books, isLoading } = useQuery({
	// 	queryKey: ['books'],
    //     queryFn: async () => {
    //         const { data } = await fetcher.get(`http://localhost:8080/books`) ;
    //         return data as { result: FullBookInfo[] };
    //     }
	// });

	// if (isLoading) return <h1>Loading...</h1>;
    
    return (
        <>
            <input type="text" id="" placeholder="" />
            <div>
                <label htmlFor=""></label>
                <select id="">
                    <option value=""></option>
                </select> 
            </div>
            
        </>
    );
}
