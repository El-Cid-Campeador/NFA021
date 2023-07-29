import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { fetcher, formatDate } from "../functions";
import Container from "../components/Container";

export default function FeesDetails() {
    const { memberId } = useParams();

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['fees', 'details', memberId],
        queryFn: async () => {
            const { data } = await fetcher.get(`/api/members/fees_details`, {
                params: {
                    memberId
                }
            });
            
            return data as { result: Fees[] };
        }
    });

    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />;
    
    return (
        <Container content={
            <div className="wrapper mx-[10px]">
                {
                    data?.result.length ? (
                        <table className="mt-[100px]">
                            <caption>- <u>Fees Details</u> -</caption>
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Amount</th>
                                    <th>Librarian ID</th>
                                    <th>Payment date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data?.result.map(fees => {
                                        return (
                                            <tr key={fees.id}>
                                                <td className="mr-5 ">{fees.year}</td>
                                                <td>{fees.amount}</td>
                                                <td>{fees.librarianId}</td>
                                                <td>{formatDate(fees.paymentDate)}</td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    ) : <></>
                }
            </div>
        } />
    );
}
