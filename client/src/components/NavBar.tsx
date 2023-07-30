import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import useLocalStorage from "./useLocalStorage";
import { fetcher } from "../functions";
import Modal from "./Modal";
import Loading from "./Loading";

export default function NavBar() {
    const navigate = useNavigate();

    const [isModalShowing, setIsModalShowing] = useState(false);
    
    const { mutate: signOut, isLoading } = useMutation({
        mutationFn: async () => {
            localStorage.removeItem('xUr');
            
            return await fetcher.delete(`/api/logout`);
        },
        onSuccess: () => {
            navigate('/');
        },
        onError: () => {
            navigate('/');
        }
    });

    const { userData: { role } } = useLocalStorage();

    if (isLoading) return <Loading />;

    return (
        <div className="mb-[30px] w-auto">
            <nav className="w-auto h-auto sm:h-[60px] px-[10px] flex flex-wrap flex-col sm:flex-row justify-between items-center bg-black text-white z-[1000]">
                <Link to="/home" className="mt-4 mb-4 sm:mt-0 sm:mb-0">
                    <img src="/home.svg" alt="Home" title="Home" width={50} height={50} />
                </Link>
                <Link to="/search" className="mb-4 sm:mb-0">
                    <img src="/book-search.svg" alt="Book Search" title="Book Search" width={50} height={50} />
                </Link>
                <Link to="/advanced_search" className="mb-4 text-white sm:mb-0">Advanced Books Search</Link>
                {
                    role && (
                        <Link to="/dashboard" className="mb-4 text-white sm:mb-0">Dashboard</Link>
                    )
                }
                <img 
                    src="/signout.svg" 
                    alt="Sign Out" 
                    title="Sign Out" 
                    width={50} 
                    height={50} 
                    onClick={() => setIsModalShowing(true)}
                    className="mb-4 cursor-pointer sm:mb-0"
                />
                {
                    isModalShowing && (
                        <Modal 
                            message="Are you sure to log out?" 
                            onConfirm={() => signOut()} 
                            onCancel={() => setIsModalShowing(false)}
                        />
                    )
                }
            </nav>
        </div>
    );
}
