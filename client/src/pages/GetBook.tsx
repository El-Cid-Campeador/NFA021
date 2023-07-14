import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import useLocalStorage from "../components/useLocalStorage";
import Modal from "../components/Modal";
import { fetcher } from "../functions";
import NavBar from "../components/NavBar";
import Suggestions from "../components/Suggestions";
import { AxiosError } from "axios";

export default function GetBook() {
    const [isModalShowing, setIsModalShowing] = useState(false);

    const [isSuggestionFormShowing, setIsSuggestionFormShowing] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [descrError, setDescrError] = useState('');

    const [areSuggestionsShowing, setAreSuggestionsShowing] = useState(false);

    const [isInputIdFormShowing, setIsInputIdFormShowing] = useState(false);
    const [memberId, setMemberId] = useState('');
    const [inputIdError, setInputIdError] = useState('');
    
    const { bookId } = useParams();

    const navigate = useNavigate();

    const queryClient = useQueryClient();
    
    const { data: queryBook, isLoading, error, isFetching } = useQuery({
        queryKey: ['books', bookId],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/${bookId}`);
            if (data.result) {
                return data as { result: Book };
            }
            
            throw new Error();
        }
    });
    
    const { mutate: deleteBook } = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`http://localhost:8080/books/${bookId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            
            navigate('/home');
        },
        onError: () => {
            navigate('/signin');
        }
    });

    const { data: querySugg, isLoading: isLoadingSugg, error: errorSugg, isFetching: isFetchingSugg } = useQuery({
        queryKey: ['suggestions'],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books/suggest`, {
                params: {
                    id: bookId
                }
            });

            return data as { result: Suggestion[] };
        }
    });

    const { userData: { id }} = useLocalStorage();

    const { mutate: addSuggestion } = useMutation({
        mutationFn: async () => {
            return await fetcher.post(`http://localhost:8080/books/suggest`, {
                    descr: suggestion,
                    memberId: id
                }, {
                    params: {
                        id: bookId
                    }
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suggestions'] });

            setIsSuggestionFormShowing(false);
        },
        onError: () => {
            navigate('/signin');
        }
    });

    const { mutate: lendBook } = useMutation({
        mutationFn: async (memberId: string | null) => {
            return await fetcher.patch(`http://localhost:8080/books/lend`, {
                    memberId
                }, {
                    params: {
                        id: bookId
                    }
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books', bookId], exact: true });

            setIsInputIdFormShowing(false);
        },
        onError: (error: AxiosError<any, any>) => {
            if (error.response!.status === 401) {
                return navigate('/signin');
            }

            if (error.response!.status === 404) {
                setInputIdError(error.response!.data);

                return;
            }
        }
    });

    const { userData: { isMember } } = useLocalStorage();
    
    function displayStatus() {
        const memberId = queryBook?.result.memberId;
        let status = '';
        
        if (memberId) {
            status = `Borrowed on ${queryBook?.result.borrowedAt}`;
            if (isMember === 0) {
                status += ` by ${memberId}`;
            }
        } else {
            status = `In possession`
        }
        
        return status;
    }

    function handleAddSuggestion() {
        if (suggestion === '') {
            setDescrError('Suggestion must not have an empty value!');
            
            return;
        }

        addSuggestion();
    }

    function handleLending(e: FormEvent) {
        e.preventDefault();

        if (isNaN(Number(memberId)) || memberId.length !== 12) {
            setInputIdError('Invalid ID! The ID must be numeric and exactly have 12 characters.');
            
            return;
        }

        lendBook(memberId);
    }

    useEffect(() => {
        setDescrError('');
    }, [suggestion]);

    useEffect(() => {
        setInputIdError('');
    }, [memberId]);
    
    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error || errorSugg) return <Navigate to="/signin" />;

    return (
        <>
            <NavBar />
            <div className="m-[10px]">
                <div className="flex gap-[20px]">
                    <img src={queryBook?.result.imgUrl} alt={queryBook?.result.title} width={250} height={250} />
                    <div className="w-[1000px]">
                        <h1>{queryBook?.result.title}</h1>
                        <p>{queryBook?.result.descr}</p>
                    </div>
                </div>
                <p>Status: {displayStatus()}</p>
                {
                    isMember === 0 && (
                        <div className="flex justify-between w-[150px]">
                            <button onClick={() => setIsModalShowing(true)} className="btn">Delete</button>
                            <button onClick={() => navigate(`/edit-book/${bookId}`, { state: queryBook?.result })} className="btn">Edit</button>

                            {
                                queryBook?.result.memberId ? (
                                    <button onClick={() => lendBook(null)}>Return</button>
                                ) : (
                                    <button onClick={() => setIsInputIdFormShowing(true)}>Lend</button>
                                )
                            }

                            {
                                isInputIdFormShowing && (
                                    <>
                                        <form onSubmit={(e) => handleLending(e)}>
                                            <input 
                                                type="tel" 
                                                id="id" 
                                                pattern="\d*"
                                                minLength={12}
                                                maxLength={12}
                                                required 
                                                value={memberId} 
                                                onChange={(e) => setMemberId(e.target.value)} 
                                            />
                                        </form>
                                        <p>{inputIdError}</p>
                                    </>
                                )
                            }

                            {
                                isModalShowing && (
                                    <Modal 
                                        message="Are you sure to delete this book?" 
                                        onConfirm={() => deleteBook()} 
                                        onCancel={() => setIsModalShowing(false)}
                                    />
                                )
                            }
                        </div>
                    )
                }

                <button 
                    onClick={() => setAreSuggestionsShowing(prev => !prev)}
                    className="btn mr-[20px]"
                >{areSuggestionsShowing ? 'Hide' : 'Show'} suggestions</button>
                {
                    areSuggestionsShowing && (
                        isLoadingSugg || isFetchingSugg ? (
                            <h1>Loading...</h1>
                        ) : (
                            <Suggestions list={querySugg!.result} />
                        )
                    )
                }

                {
                    isMember === 1 && (
                        <>
                            <button onClick={() => setIsSuggestionFormShowing(prev => !prev)} className="btn">Add suggestion</button>
                          
                            { 
                                isSuggestionFormShowing && (
                                    <div className="mt-[20px]">
                                        <textarea cols={30} rows={10} value={suggestion} onChange={(e) => setSuggestion(e.target.value)}></textarea>
                                        <div>
                                            <button onClick={() => handleAddSuggestion()} className="btn">Post suggestion</button>
                                        </div>
                                        <p className="error">{descrError}</p>
                                    </div>
                                )
                            }
                            
                        </>
                    )
                }
            </div>
        </>
    );
}
