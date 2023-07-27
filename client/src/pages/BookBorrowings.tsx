import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetcher } from "../functions";
import NavBar from "../components/NavBar";

export default function BookBorrowings() {
    const { bookId } = useParams();
    
    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['books', bookId],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/borrowings`, {
                params: {
                    bookId
                }
            });

            console.log(data);

            return data as { result: any[] };
        }
    });

    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <h1>{(error as Error).message}</h1>;

    return (
        <div>
            <NavBar />
            <table>
                <thead>
                    <tr>
                        <th>Member ID</th>
                        <th>Borrowing date</th>
                        <th>Lender ID</th>
                        <th>Return date</th>
                        <th>Receiver ID</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data?.result.map(x => {
                            return (
                                <tr key={`${x.memberId}-${x.bookId}-${x.borrowDate}`}>
                                    <td>{x.memberId}</td>
                                    <td className="mr-5 ">{x.borrowDate}</td>
                                    <td>{x.lenderId}</td>
                                    <td>{x.returnDate}</td>
                                    <td>{x.receiverId}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}
