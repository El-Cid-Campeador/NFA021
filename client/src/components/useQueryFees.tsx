import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../functions";

export default function useQueryFees(memberId: string) {
    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['fees', memberId],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/users/fees`, {
                params: {
                    id: memberId
                }
            });

            console.log(data);
            
            return data as { result: any[] };
        }
    });

    return { data, isLoading, error, isFetching };
}
