import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { PartialMemberInfo, fetcher } from "../functions";

export default function Dashboard() {
    const { data: queryMembers, isLoading, error, isFetching } = useQuery({
        queryKey: ['latest_books'],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/users`);
            return data as { result: PartialMemberInfo[] };
        }
    });

     if (isLoading || isFetching) return <h1>Loading...</h1>;
     if (error) return <Navigate to="/signin" />
    
    return (
        <div>
            <ul>
                {
                    queryMembers?.result.map(user => {
                        return (
                            <li key={user.id}>
                                <Link to={`/members/${user.id}`}>{user.firstName} {user.lastName}</Link>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    );
}
