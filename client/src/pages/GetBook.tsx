import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import useLocalStorage from "../components/useLocalStorage";
import Modal from "../components/Modal";
import { displayBookProperty, fetcher, formatDate, formatProperty } from "../functions";
import Suggestions from "../components/Suggestions";
import Container from "../components/Container";
import Loading from "../components/Loading";

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
            const { data } = await fetcher.get(`/api/books/${bookId}`);
            
            if (data.result) {
                return data as { result: Book, info: any | string };
            }
            
            throw new Error();
        }
    });
    
    const { mutate: deleteBook, isLoading: isDeleteBookLoading } = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`/api/books/${bookId}`, {
                params: {
                    librarianId: id
                }
            });
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
            const { data } = await fetcher.get(`/api/books/suggest`, {
                params: {
                    bookId
                }
            });

            return data as { result: Suggestion[] };
        }
    });

    const { mutate: addSuggestion, isLoading: isAddSuggestionLoading } = useMutation({
        mutationFn: async () => {
            return await fetcher.post(`/api/books/suggest`, {
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

            setAreSuggestionsShowing(true);

            setSuggestion('');
        },
        onError: () => {
            navigate('/signin');
        }
    });

    const { mutate: lendBook, isLoading: isLendBookLoading } = useMutation({
        mutationFn: async () => {
            return await fetcher.post(`/api/books/lend`, {
                    memberId
                }, {
                    params: {
                        bookId,
                        librarianId: id
                    }
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books', bookId], exact: true });

            setIsInputIdFormShowing(false);
        },
        onError: (error: AxiosError<never, never>) => {
            if (error.response!.status === 401) {
                return navigate('/signin');
            }

            if (error.response!.status === 404) {
                setInputIdError(error.response!.data);

                return;
            }
        }
    });

    const { mutate: returnBook, isLoading: isReturnBookLoading } = useMutation({
        mutationFn: async () => {
            return await fetcher.patch(`/api/books/return`, {
                    memberId: queryBook?.info.memberId
                }, {
                    params: {
                        bookId,
                        librarianId: id,
                        borrowDate: queryBook?.info.borrowDate
                    }
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books', bookId], exact: true });

            setIsInputIdFormShowing(false);
        },
        onError: () => {
            navigate('/signin');
        }
    });
    
    function DisplayStatus() {
        if (queryBook?.info !== '') {
            const { memberId, borrowDate, returnDate } = queryBook?.info;
            
            if (borrowDate && !returnDate) { 
                return (
                    <span className="ml-2 text-red-600">
                        Borrowed on <strong>{formatDate(borrowDate)}</strong> { role && <span>by <strong>{memberId}</strong></span>}
                    </span>
                );
            } 
        }
        
        return (
            <p className="ml-2 text-green-600">In possession</p>
        );
    }

    function handleAddSuggestion() {
        if (suggestion === '') {
            setDescrError('Suggestion must not have an empty value!');
            
            return;
        }

        setIsSuggestionFormShowing(false);

        addSuggestion();
    }

    function handleLending(e: FormEvent) {
        e.preventDefault();

        if (isNaN(Number(memberId)) || memberId.length !== 12) {
            setInputIdError('Invalid ID! The ID must be numeric and exactly have 12 characters.');
            
            return;
        }

        lendBook();
    }

    useEffect(() => {
        setDescrError('');
    }, [suggestion]);

    useEffect(() => {
        setInputIdError('');
    }, [memberId]);

    const { userData: { id, role } } = useLocalStorage();
    
    if (isLoading || isFetching || isDeleteBookLoading || isAddSuggestionLoading || isLendBookLoading || isReturnBookLoading) return <Loading />;
    if (error || errorSugg) return <Navigate to="/signin" />;

    return (
        <Container content={
            <>
                <div className="flex gap-[20px] flex-wrap">
                    <img 
                        src={queryBook?.result.imgUrl} 
                        alt="The image could not be loaded"
                        width={250}
                        height={250}
                    />
                    <div className="w-[1000px]">
                        {
                            Object.keys(queryBook!.result).map(key => {
                                const originalProperty = key as keyof Book;
                                const displayedProperty = displayBookProperty(String(originalProperty));

                                if (displayedProperty && queryBook!.result[originalProperty] && key !== 'imgUrl') {
                                    return (
                                        <div key={key} className="flex items-center mb-3">
                                            <strong className="mr-2">{displayedProperty}: </strong> 
                                            <span>{formatProperty(queryBook!.result, displayedProperty, originalProperty)}</span>   
                                        </div>
                                    );
                                }
                            })
                        }
                    </div>
                </div>

                <br />
                <hr />
                <br />

                {!queryBook?.result.deletedBy && <h1 className="my-[10px] s:my-[25px] flex items-center">Status: <DisplayStatus /></h1>}
                
                {    
                    role && (
                        <>
                            {
                                queryBook?.result.deletedBy ? (
                                    <div className="error-msg">Deleted by <strong>{queryBook?.result.deletedBy}</strong> on <strong>{formatDate(queryBook?.result.deletionDate!)}</strong></div>
                                ) : ( 
                                    <div className="flex flex-wrap items-center gap-[10px] w-[300px]">
                                        <img 
                                            src="/book-edit.svg" 
                                            alt="Edit The Book" 
                                            title="Edit The Book" 
                                            width={50} 
                                            height={50} 
                                            onClick={() => navigate(`/books/edit/${bookId}`, { state: queryBook?.result })} 
                                            className="cursor-pointer"
                                        />
                                        <img 
                                            src="/book-delete.svg" 
                                            alt="Delete The Book" 
                                            title="Delete The Book" 
                                            width={50} 
                                            height={50} 
                                            onClick={() => setIsModalShowing(true)}
                                            className="cursor-pointer"
                                        />
                                        <Link to={`/books/${bookId}/modifications`}>View modifications</Link>
                                        <Link to={`/books/${bookId}/borrowings`}>View borrowings history</Link>
                                        {
                                            queryBook?.info.borrowDate && !queryBook?.info.returnDate ? (
                                                <button onClick={() => returnBook()} className="btn">Return</button>
                                            ) : (
                                                <button onClick={() => setIsInputIdFormShowing((prev) => !prev)} className="btn">Lend</button>
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
                        </>
                    )
                }

                {
                    isInputIdFormShowing && (
                        <div>
                            <form onSubmit={(e) => handleLending(e)}>
                                <label htmlFor="id">Member ID: </label>
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
                                {
                                    memberId ? (
                                        <input type="submit" value={`Lend to ${memberId}`} className="btn" />
                                    ) : <></>
                                }
                            </form>
                            <p className="error-msg my-[20px]">{inputIdError}</p>
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
                            <Loading />
                        ) : (
                            <Suggestions list={querySugg!.result} />
                        )
                    )
                }

                {
                    !role && (
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
            </>
        } />
    );
}
