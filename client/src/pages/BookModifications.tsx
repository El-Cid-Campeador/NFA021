import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetcher } from "../functions";
import BookModificationsInfo from "../components/BookModificationsInfo";
import NavBar from "../components/NavBar";

export default function BookModifications() {
    const { bookId } = useParams();
    
    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['books', bookId],
        queryFn: async () => {
            const { data } = await fetcher.get(`/api/books/modifications`, {
                params: {
                    bookId
                }
            });

            return data as { result: any[] };
        }
    });

    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <h1>{(error as Error).message}</h1>;

    return (
        <div>
            <NavBar />
            <ul>
                {
                    data?.result.map(x => {
                        return (
                            <li key={`${x.bookId}-${x.librarianId}-${x.modificationDate}`} className="">
                                 <p>Modifications by: {x.librarianId} on {x.modificationDate}</p>
                                <BookModificationsInfo 
                                    oldValues={JSON.parse(x.oldValues)} 
                                    newValues={JSON.parse(x.newValues)} 
                                />
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}
