import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import useLocalStorage from "./useLocalStorage";
import { fetcher } from "../functions";
import { useState } from "react";
import Modal from "./Modal";

export default function NavBar() {
    const navigate = useNavigate();

    const [isModalShowing, setIsModalShowing] = useState(false);
    
    const { mutate: signOut } = useMutation({
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

    return (
        <div className="mb-[70px]">
            <nav className="px-[10px]">
                <Link to="/home">
                    <img src="/home.svg" alt="Home" title="Home" width={50} height={50} />
                </Link>
                <Link to="/search">
                    <img src="/book-search.svg" alt="Book Search" title="Book Search" width={50} height={50} />
                </Link>
                <Link to="/advanced_search">Advanced Books Search</Link>
                {
                    role && (
                        <div>
                            <Link to="/dashboard">Dashboard</Link>
                        </div>
                    )
                }
                <img 
                    src="/signout.svg" 
                    alt="Sign Out" 
                    title="Sign Out" 
                    width={50} 
                    height={50} 
                    onClick={() => setIsModalShowing(true)}
                    className="cursor-pointer"
                />
            </nav>
            {
                isModalShowing && (
                    <Modal 
                        message="Are you sure to log out?" 
                        onConfirm={() => signOut()} 
                        onCancel={() => setIsModalShowing(false)}
                    />
                )
            }
        </div>
    );
}
