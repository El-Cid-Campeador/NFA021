import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchByText from "../components/SearchByText";
import Librarians from "../components/Librarians";
import useLocalStorage from "../components/useLocalStorage";
import Container from "../components/Container";

export default function Dashboard() {
    const [showLibrarians, setShowLibrarians] = useState(false);

    const navigate = useNavigate();

    const { userData: { id } } = useLocalStorage(); 

    return (
        <Container content={
            <>
                <div className="flex gap-[20px]">
                    <img 
                        src="/user-plus.svg" 
                        alt="Add New Librarian" 
                        title="Add New Librarian" 
                        width={50} height={50}
                        onClick={() => navigate("/new_librarian")}
                        className="cursor-pointer"
                    />
                    <img 
                        src="/book-add.svg" 
                        alt="Add New Book" 
                        title="Add New Book" 
                        width={50} 
                        height={50} 
                        onClick={() => navigate("/books/add")}
                        className="cursor-pointer"
                    />
                    <button className="btn" onClick={() => setShowLibrarians(prev => !prev)}>
                        {showLibrarians ? 'Hide' : 'Show'} all added librarians
                    </button>
                </div>
                {
                    showLibrarians ? (
                        <Librarians id={id} />
                    ) : (
                        <SearchByText
                            queryKey="members"
                            route="/members"
                            placeholder="Member first name or last name or ID"
                        />
                    )
                }
            </>
        } />
    );
}
