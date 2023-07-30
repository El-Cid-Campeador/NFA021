import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../components/Modal";
import { displayMemberProperty, fetcher, formatProperty } from "../functions";
import Container from "../components/Container";
import useLocalStorage from "../components/useLocalStorage";
import Loading from "../components/Loading";

export default function GetMember() {
    const { userData: { id } } = useLocalStorage();

    const [isModalShowing, setIsModalShowing] = useState(false);
    
    const { memberId } = useParams();

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { data: queryMember, isLoading: isLoadingMember, error: errorMember, isFetching: isFetchingMember } = useQuery({
        queryKey: ['members', memberId],
        queryFn: async () => {
            const { data } = await fetcher.get(`/api/members/${memberId}`);
            
            if (data.result) {
                return data as { result: Member };
            }

            throw new Error();
        }
    });

    const { mutate: deleteMember, isLoading: isDeleteMemberLoading } = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`/api/members/${memberId}`, {
                params: {
                    librarianId: id
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });

            navigate('/dashboard');
        },
        onError: () => {
           navigate('/signin');
        }
    });
    
    if (isLoadingMember || isFetchingMember || isDeleteMemberLoading) return <Loading />;
    if (errorMember) return <Navigate to="/signin" />;
    
    return (
        <Container content={
            <div className="wrapper ml-[10px]">
                {
                    Object.keys(queryMember!.result).map(key => {
                        const originalProperty = key as keyof Member;
                        const displayedProperty = displayMemberProperty(String(originalProperty));

                        if (displayedProperty && queryMember!.result[originalProperty]) {
                            return (
                                <div key={key} className="flex items-center mb-3">
                                    <strong className="mr-2">{displayedProperty}: </strong>
                                    <p>{formatProperty(queryMember!.result, displayedProperty, originalProperty)}</p>
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
                            onClick={() => navigate(`/fees/${memberId}`)} 
                            className="cursor-pointer"
                        />
                        {
                            !queryMember!.result.deletedBy && (
                                <img 
                                    src="/user-delete.svg" 
                                    alt="Delete Member" 
                                    title="Delete Member" 
                                    width={50} 
                                    height={50} 
                                    onClick={() => setIsModalShowing(true)}
                                    className="cursor-pointer"
                                />
                            )
                        }
                        
                        {
                            isModalShowing && (
                                <Modal 
                                    message="Are you sure to delete this member?" 
                                    onConfirm={() => deleteMember()} 
                                    onCancel={() => setIsModalShowing(false)}
                                />
                            )
                        }
                    </div>
            </div>
        } />
    );
}
