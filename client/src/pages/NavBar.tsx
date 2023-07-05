import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import useLocalStorage from "../components/useLocalStorage";
import { fetcher } from "../functions";

export default function NavBar() {
    const navigate = useNavigate();
    
    const { mutate: signOut } = useMutation({
        mutationFn: async () => {
            localStorage.removeItem('xUr');
            
            return await fetcher.delete(`http://localhost:8080/logout`);
        },
        onSuccess: () => {
            navigate('/');
        },
        onError: () => {
            navigate('/');
        }
    });

    const { userData: { isMember } } = useLocalStorage();

    return (
        <div className="mb-[70px]">
            <nav>
                <Link to="/home">Home</Link>
                <Link to="/search">Search</Link>
                <Link to="/advanced_search">Advanced Search</Link>
                {
                    isMember === 0 && (
                        <div>
                            <Link to="/dashboard">Dashboard</Link>
                        </div>
                    )
                }
                <span onClick={() => signOut()} className="text-white cursor-pointer ">Sign out</span>
            </nav>
        </div>
    );
}
