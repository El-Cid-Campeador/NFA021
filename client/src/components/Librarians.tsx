import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { fetcher } from "../functions";

type Props = {
    id: string
}

export default function Librarians({ id }: Props) {
    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['librarians'],
        queryFn: async () => {
            const { data } = await fetcher.get(`/api/librarians`, {
                params: {
                    librarianId: id
                }
            });
            
            return data as { result: { id: string, firstName: string, lastName: string }[] };
        }
    }); 
    
    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />;

    return (
        <ul className="flex gap-[10px] flex-wrap m-[10px]">
            {
                data?.result.map(librarian => {
                    return (
                        <li key={librarian.id} className="flex flex-col justify-center w-[120px]">
                            <Link to={`/librarians/${librarian.id}`} className="text-black">
                                <img src="/user.svg" alt="The image could not be loaded" width={70} height={70} />
                                <h1 className="text-sm mt-[10px]">{librarian.firstName} {librarian.lastName}</h1>
                            </Link>
                        </li>
                    );
                })
            }
        </ul>
    );
}
