import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../components/Modal";
import { displayMemberProperty, fetcher } from "../functions";
import NavBar from "../components/NavBar";

export default function GetMember() {
    const [isModalShowing, setIsModalShowing] = useState(false);
    
    const { memberId } = useParams();

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { data: queryUser, isLoading: isLoadingUser, error: errorUser, isFetching: isFetchingUser } = useQuery({
        queryKey: ['members', memberId],
        queryFn: async () => {
            const { data } = await fetcher.get(`/api/members/${memberId}`);
            
            if (data.result) {
                return data as { result: Member };
            }

            throw new Error();
        }
    });

    const { mutate: deleteUser} = useMutation({
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
    
    if (isLoadingUser || isFetchingUser) return <h1>Loading...</h1>;
    if (errorUser) return <Navigate to="/signin" />;
    
    return (
        <>
            <NavBar />
            <div className="ml-[10px]">
                {
                    Object.keys(queryUser!.result).map(key => {
                        const property = key as keyof Member;
                        const memberProperty = displayMemberProperty(String(property));

                        if (memberProperty && queryUser!.result[property]) {
                            return (
                                <div key={key} className="flex items-center mb-3">
                                    <strong className="mr-2">{memberProperty}: </strong>
                                    <p>{queryUser!.result[property]}</p>
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
                        alt="Delete User" 
                        title="Delete User" 
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
                            onConfirm={() => deleteUser()} 
                            onCancel={() => setIsModalShowing(false)}
                        />
                    )
                }
            </div>
        </>
    );
}
