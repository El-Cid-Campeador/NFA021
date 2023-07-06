import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../components/Modal";
import { Member, fetcher } from "../functions";
import NavBar from "./NavBar";
import useQueryFees from "../components/useQueryFees";

export default function GetMember() {
    const [isModalShowing, setIsModalShowing] = useState(false);
    
    const { memberId } = useParams();

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { data: queryUser, isLoading: isLoadingUser, error: errorUser, isFetching: isFetchingUser } = useQuery({
        queryKey: ['members', memberId],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/users/${memberId}`);
            if (data.result) {
                return data as { result: Member };
            }

            throw new Error();
        }
    });

    const { data: queryFees, isLoading: isLoadingFees, error: errorFees, isFetching: isFetchingFees } = useQueryFees(memberId!);

    const { mutate: deleteUser} = useMutation({
        mutationFn: async () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });

            return await fetcher.delete(`http://localhost:8080/users/${memberId}`);
        },
        onSuccess: () => {
            navigate('/home');
        },
        onError: () => {
           navigate('/signin');
        }
    });
    
    if (isLoadingUser || isFetchingUser || isLoadingFees || isFetchingFees) return <h1>Loading...</h1>;
    if (errorUser || errorFees) return <Navigate to="/signin" />;
    
    return (
        <>
            <NavBar />
            <div>
                <p>{queryUser?.result.id}</p>
                <p>{queryUser?.result.firstName}</p>
                <p>{queryUser?.result.lastName}</p>
                <p>{queryUser?.result.email}</p>
                <p>{queryUser?.result.createdAt}</p>
                <button onClick={() => setIsModalShowing(true)}>Delete</button>
                <button></button>
                {
                    isModalShowing && (
                        isModalShowing && (
                            <Modal 
                                message="Are you sure to delete this member?" 
                                onConfirm={() => deleteUser()} 
                                onCancel={() => setIsModalShowing(false)}
                            />
                        )
                    )
                }
            </div>
        </>
    );
}
