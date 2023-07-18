import { Navigate, useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher, generateFeesYears } from "../functions";
import { FormEvent, useEffect, useState } from "react";

export default function Fees() {
    const { memberId } = useParams();

    const navigate = useNavigate();

    const [isPayingFormShowing, setIsPayingFormShowing] = useState(false);

    const [payload, setPayload] = useState({
        amount: '',
        year: ''
    });
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
        mutationFn: async () => {
            return await fetcher.post(`http://localhost:8080/users/fees`, { ...payload }, {
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

        const { amount, year } = payload;

        if (year == '') {
            setInputError('Invalid year!');

            return;
        }

        if (amount === '' || isNaN(Number(amount)) || amount.length > 5) {
            setInputError('Invalid amount!');

            return;
        }

        setIsPayingFormShowing(false);

        postAmount();
    }

    useEffect(() => {
        setInputError('');
    }, [payload]);
    
    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />;

    return (
        <>
            <NavBar />
            <div className="m-[10px]">
                <table>
                    <caption>- Fees -</caption>
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
                                <form onSubmit={(e) => handlePayment(e)} className="w-[500px] my-[10px] p-[10px] border-[1px] border-solid border-customBlue rounded-2xl">
                                    <label htmlFor="amount">Amount: </label>
                                    <input 
                                        type="text" 
                                        id="amount" 
                                        maxLength={5}
                                        required
                                        value={payload.amount} 
                                        onChange={(e) => setPayload({ ...payload, amount: e.target.value })} 
                                    />
                                    <select value={payload.year} onChange={(e) => setPayload({ ...payload, year: e.target.value })}>
                                        <option value="">Year</option>
                                        {
                                            generateFeesYears().map(year => {
                                                return <option value={year} key={year}>{year}</option>;
                                            })
                                        }
                                    </select> 
                                    <input type="submit" value="Pay" className="block btn" />
                                </form>
                                <p className="error-msg">{inputError}</p>
                            </>
                        )
                    }
            </div>
        </>
    );
}
