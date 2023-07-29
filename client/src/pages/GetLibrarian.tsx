import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../components/Modal";
import { displayLibrarianProperty, fetcher, formatProperty } from "../functions";
import Container from "../components/Container";

export default function GetLibrarian() {
    const [isModalShowing, setIsModalShowing] = useState(false);
    
    const { addedlibrarianId } = useParams();

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { data: queryLibrarian, isLoading: isLoadingLibrarian, error: errorLibrarian, isFetching: isFetchingLibrarian } = useQuery({
        queryKey: ['librarians', addedlibrarianId],
        queryFn: async () => {
            const { data } = await fetcher.get(`/api/librarians/${addedlibrarianId}`);
            
            if (data.result) {
                return data as { result: Librarian };
            }

            throw new Error();
        }
    });

    const { mutate: deleteLibrarian} = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`/api/librarians/${addedlibrarianId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['librarians'] });

            navigate('/dashboard');
        },
        onError: () => {
           navigate('/signin');
        }
    });
    
    if (isLoadingLibrarian || isFetchingLibrarian) return <h1>Loading...</h1>;
    if (errorLibrarian) return <Navigate to="/signin" />;
    
    return (
        <Container content={
            <div className="wrapper ml-[10px]">
                {
                    Object.keys(queryLibrarian!.result).map(key => {
                        const originalProperty = key as keyof Librarian;
                        const displayedProperty = displayLibrarianProperty(String(originalProperty));

                        if (displayedProperty && queryLibrarian!.result[originalProperty]) {
                            return (
                                <div key={key} className="flex items-center mb-3">
                                    <strong className="mr-2">{displayedProperty}: </strong>
                                    <p>{formatProperty(queryLibrarian!.result, displayedProperty, originalProperty)}</p>
                                </div>
                            );
                        }
                    })
                }
                <div className="flex gap-2.5">
                    <img 
                        src="/check-fees.svg" 
                        alt="Check fees" 
                        title="Check fees" 
                        width={50} 
                        height={50} 
                        onClick={() => navigate(`/fees/${addedlibrarianId}`)} 
                        className="cursor-pointer"
                    />
                    <img 
                        src="/user-delete.svg" 
                        alt="Delete Librarian" 
                        title="Delete Librarian" 
                        width={50} 
                        height={50} 
                        onClick={() => setIsModalShowing(true)}
                        className="cursor-pointer"
                    />
                </div>
                {
                    isModalShowing && (
                        <Modal 
                            message="Are you sure to delete this member?" 
                            onConfirm={() => deleteLibrarian()} 
                            onCancel={() => setIsModalShowing(false)}
                        />
                    )
                }
            </div>
        } />
    );
}
