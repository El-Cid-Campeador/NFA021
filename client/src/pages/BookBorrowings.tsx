import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetcher, formatDate } from "../functions";
import Container from "../components/Container";

export default function BookBorrowings() {
    const { bookId } = useParams();
    
    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['books', bookId],
        queryFn: async () => {
            const { data } = await fetcher.get(`/api/books/borrowings`, {
                params: {
                    bookId
                }
            });

            return data as { result: { memberId: string, borrowDate: string, lenderId: string, returnDate: string, receiverId: string }[] };
        }
    });

    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <h1>{(error as Error).message}</h1>;

    return (
        <Container content={
            <>
                {
                    data?.result.length ? (
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
                                            <tr key={`${x.memberId}-${bookId}-${x.borrowDate}`}>
                                                <td>{x.memberId}</td>
                                                <td className="mr-5 ">{formatDate(x.borrowDate)}</td>
                                                <td>{x.lenderId}</td>
                                                <td>{formatDate(x.returnDate)}</td>
                                                <td>{x.receiverId}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    ) : <h1>No borrowings found!</h1>
                }
            </>
        } />
    )
}
