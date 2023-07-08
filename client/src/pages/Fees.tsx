import { Navigate, useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "../functions";
import { FormEvent, useState } from "react";

export default function Fees() {
    const { memberId } = useParams();

    const navigate = useNavigate();

    const [isPayingFormShowing, setIsPayingFormShowing] = useState(false);

    const [amount, setAmount] = useState('');
    const [inputError, setInputError] = useState('');

    const queryClient = useQueryClient();

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['fees', memberId],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/users/fees`, {
                params: {
                    id: memberId
                }
            });
            
            return data as { result: { id: string, year: number, amount: number }[], price: number };
        }
    });

    const { mutate: postAmount } = useMutation({
        mutationFn: async (year: number) => {
            return await fetcher.post(`http://localhost:8080/users/fees`, {
                amount,
                year 
            }, {
                params: {
                    id: memberId
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fees', memberId], exact: true });
        },
        onError: () => {
           navigate('/signin');
        }
    });

    function handlePayment(e: FormEvent) {
        e.preventDefault();

        if (amount === '' || isNaN(Number(amount))) {
            setInputError('Invalid amount!');

            return;
        }

        let year = new Date().getFullYear();

        if (data?.result)

        postAmount(year);
    }
    
    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />;

    return (
        <>
            <NavBar />
            <div>Fees</div>
            <table>
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data?.result.map(fees => {
                            return (
                                <tr key={fees.id}>
                                    <td className="mr-5 ">{fees.year}</td>
                                    <td>{fees.amount}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
            <button onClick={() => setIsPayingFormShowing(prev => !prev)} className="btn">Pay fees</button>
                {
                    isPayingFormShowing && (
                        <>
                            <form onSubmit={(e) => handlePayment(e)}>
                                <label htmlFor="amount">Amount: </label>
                                <input 
                                    type="text" 
                                    id="amount" 
                                    required
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                />
                            </form>
                            <p>{inputError}</p>
                        </>
                    )
                }
        </>
    );
}
