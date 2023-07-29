import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher, generateFeesYears } from "../functions";
import { FormEvent, useEffect, useState } from "react";
import useLocalStorage from "../components/useLocalStorage";
import Container from "../components/Container";

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
            const { data } = await fetcher.get(`/api/members/fees`, {
                params: {
                    memberId
                }
            });
            
            return data as { total: { id: string, year: number, amount: number }[], price: number };
        }
    });

    const { userData: { id } } = useLocalStorage();

    const { mutate: postAmount } = useMutation({
        mutationFn: async () => {
            return await fetcher.post(`/api/members/fees`, { ...payload }, {
                params: {
                    memberId,
                    librarianId: id
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
       <Container content={
            <div className="mx-[10px]">
                <img 
                    src="/money-receive.svg" 
                    alt="Pay Fees" 
                    title="Pay Fees" 
                    width={50} 
                    height={50} 
                    onClick={() => setIsPayingFormShowing(prev => !prev)} 
                    className="cursor-pointer"
                />
                {
                    isPayingFormShowing && (
                        <>
                            <form 
                                onSubmit={(e) => handlePayment(e)} 
                                className="w-[306px] sm:w-[500px] h-auto sm:h-[130px] mt-[6.25rem] sm:mt-[10px] mx-auto p-[10px] pb-[55px] border-[1px] border-solid border-customBlue rounded-2xl"
                            >
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
                                <input type="submit" value="Pay" className="ml-[20px] btn" />
                            </form>
                            <p className="error-msg">{inputError}</p>
                        </>
                    )
                }

                {
                    data?.total.length ? (
                        <div>
                            <Link to={`/fees/${memberId}/details`}>View Fees Details</Link>
                            <table className="max-[640px]:mt-[100px]">
                                <caption>- <u>Fees</u> -</caption>
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        data?.total.map(fees => {
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
                        </div>
                    ) : <></>
                }
            </div>
       } />
    );
}
