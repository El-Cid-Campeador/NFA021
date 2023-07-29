import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../components/Modal";
import { displayMemberProperty, fetcher } from "../functions";
import Container from "../components/Container";

export default function GetMember() {
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

    const { mutate: deleteMember} = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`/api/members/${memberId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });

            navigate('/dashboard');
        },
        onError: () => {
           navigate('/signin');
        }
    });
    
    if (isLoadingMember || isFetchingMember) return <h1>Loading...</h1>;
    if (errorMember) return <Navigate to="/signin" />;
    
    return (
        <Container content={
            <div className="ml-[10px]">
                {
                    Object.keys(queryMember!.result).map(key => {
                        const property = key as keyof Member;
                        const memberProperty = displayMemberProperty(String(property));

                        if (memberProperty && queryMember!.result[property]) {
                            return (
                                <div key={key} className="flex items-center mb-3">
                                    <strong className="mr-2">{memberProperty}: </strong>
                                    <p>{queryMember!.result[property]}</p>
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
                    <img 
                        src="/user-delete.svg" 
                        alt="Delete Member" 
                        title="Delete Member" 
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
                            onConfirm={() => deleteMember()} 
                            onCancel={() => setIsModalShowing(false)}
                        />
                    )
                }
            </div>
        } />
    );
}
