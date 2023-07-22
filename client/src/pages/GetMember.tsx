import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../components/Modal";
import { fetcher } from "../functions";
import NavBar from "../components/NavBar";

export default function GetMember() {
    const [isModalShowing, setIsModalShowing] = useState(false);
    
    const { memberId } = useParams();

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { data: queryUser, isLoading: isLoadingUser, error: errorUser, isFetching: isFetchingUser } = useQuery({
        queryKey: ['members', memberId],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/members/${memberId}`);
            if (data.result) {
                return data as { result: Member };
            }

            throw new Error();
        }
    });

    const { mutate: deleteUser} = useMutation({
        mutationFn: async () => {
            return await fetcher.delete(`http://localhost:8080/members/${memberId}`);
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
            <div>
                <p>{queryUser?.result.id}</p>
                <p>{queryUser?.result.firstName}</p>
                <p>{queryUser?.result.lastName}</p>
                <p>{queryUser?.result.email}</p>
                <p>{queryUser?.result.additionDate}</p>
                <Link to={`/fees/${memberId}`}>
                    <button className="btn">View {queryUser?.result.firstName} {queryUser?.result.lastName}'s fees</button>
                </Link>
                <button onClick={() => setIsModalShowing(true)} className="btn">Delete</button>

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
