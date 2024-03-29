import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { displayBookProperty, fetcher, formatDate } from "../functions";
import Container from "../components/Container";
import Loading from "../components/Loading";

type BookInfo = {
    librarianId: string, 
    modificationDate: string, 
    oldValues: string, 
    newValues: string 
}

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

            return data as { result: BookInfo[] };
        }
    });

    if (isLoading || isFetching) return <Loading />;
    if (error) return <h1>{(error as Error).message}</h1>;

    return (
        <Container content={
            <>
                {
                    data?.result.length ? (
                        <ul>
                            {
                                data?.result.map(x => {
                                    const { librarianId, modificationDate, oldValues, newValues } = x;
                                    const previous = JSON.parse(oldValues);
                                    const next = JSON.parse(newValues);
            
                                    return (
                                        <li key={`${bookId}-${librarianId}-${modificationDate}`} className="">
                                            <p className="mb-[10px]">By <strong>{librarianId}</strong> on <strong>{formatDate(modificationDate)}</strong></p>
                                            {
                                                Object.keys(previous).map((key) => {
                                                const property = key as keyof BookInfo;
            
                                                if (previous[property] !== next[property]) {
                                                        return (
                                                            <div key={key} >
                                                                <strong>{displayBookProperty(key)}: </strong> 
                                                                <div className="ml-5">
                                                                    <p className={"bg-[#da3633] mb-3 text-white rounded p-2"}>
                                                                        <span className="ml-1 mr-3">-</span>
                                                                        {previous[property]}
                                                                    </p>
                                                                    <p className={"bg-[#238636] mb-3 text-white rounded p-2"}>
                                                                        <span className="ml-1 mr-3">+</span>
                                                                        {next[property]}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                })
                                            }
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    ) : (
                        <h1>No modifications found!</h1>
                    )
                }
            </>
        } />
    )
}
