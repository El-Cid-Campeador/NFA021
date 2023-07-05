import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import useLocalStorage from "../components/useLocalStorage";
import Modal from "../components/Modal";
import { Book, Suggestion, fetcher } from "../functions";
import NavBar from "./NavBar";
import Suggestions from "../components/Suggestions";

export default function GetBook() {
    const [isModalShowing, setIsModalShowing] = useState(false);
    const [isSuggestionFormShowing, setIsSuggestionFormShowing] = useState(false);
    const [areSuggestionsShowing, setAreSuggestionsShowing] = useState(false);

    const [suggestion, setSuggestion] = useState('');
    const [errorDescr, setErrorDescr] = useState('');
    
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
            status = 'In possession'
        }
        
        return status;
    }

    function handleAddSuggestion() {
        if (suggestion === '') {
            setErrorDescr('Suggestion must not be null!');
            return;
        }

        addSuggestion();
    }

    useEffect(() => {
        setErrorDescr('');
    }, []);
    
    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error || errorSugg) return <Navigate to="/signin" />;

    return (
        <>
            <NavBar />
            <div className="container">
                <h1>{queryBook?.result.title}</h1>
                <img src={queryBook?.result.imgUrl} alt={queryBook?.result.title} />
                <p>{queryBook?.result.descr}</p>
                <p>Status: {displayStatus()}</p>
                {
                    isMember === 0 && (
                        <div className="flex justify-between w-[150px]">
                            <button onClick={() => setIsModalShowing(true)} className="btn">Delete</button>
                            <button onClick={() => navigate(`/edit-book/${bookId}`, { state: queryBook?.result })} className="btn">Edit</button>
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

                {
                    isMember === 1 && (
                        <>
                            <button onClick={() => setIsSuggestionFormShowing(prev => !prev)} className="btn">Add suggestion</button>
                            <button 
                                onClick={() => setAreSuggestionsShowing(prev => !prev)}
                                className="btn"
                            >{areSuggestionsShowing ? 'Hide' : 'Show'} suggestions</button>
                            { 
                                isSuggestionFormShowing && (
                                    <div>
                                        <textarea
                                            cols={30} 
                                            rows={10}
                                            value={suggestion}
                                            onChange={(e) => setSuggestion(e.target.value)}
                                        ></textarea>
                                        <button onClick={() => handleAddSuggestion()}>Post suggestion</button>
                                        <p>{errorDescr}</p>
                                    </div>
                                )
                            }
                            {
                                areSuggestionsShowing && (
                                    isLoadingSugg || isFetchingSugg ? (
                                        <h1>Loading...</h1>
                                    ) : (
                                        <Suggestions list={querySugg!.result} />
                                    )
                                )
                            }
                        </>
                    )
                }
            </div>
        </>
    );
}
