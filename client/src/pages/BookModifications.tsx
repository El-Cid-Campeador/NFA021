import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { displayBookProperty, fetcher } from "../functions";
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
                        let { bookId, librarianId, modificationDate, oldValues, newValues } = x;
                        oldValues = JSON.parse(oldValues);
                        newValues = JSON.parse(newValues);

                        return (
                            <li key={`${bookId}-${librarianId}-${modificationDate}`} className="">
                                <p>Modifications by: {librarianId} on {modificationDate}</p>
                                {
                                    Object.keys(oldValues).map((key) => {
                                    const property = key as keyof Book;

                                    if (oldValues[property] !== newValues[property]) {
                                            return (
                                                <div key={key} >
                                                    <strong>{displayBookProperty(key)}: </strong> 
                                                    <div className="ml-5">
                                                        <p className={"bg-[#da3633] mb-3 text-white rounded"}>
                                                            <span className="ml-1 mr-3">-</span>
                                                            {oldValues[property]}
                                                        </p>
                                                        <p className={"bg-[#238636] mb-3 text-white rounded"}>
                                                            <span className="ml-1 mr-3">+</span>
                                                            {newValues[property]}
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
        </div>
    )
}
