import { Link, useLocation } from "react-router-dom";
import useLocalStorage from "../components/useLocalStorage";

export default function NavBar() {
    const { userData: { isMember } } = useLocalStorage();

    const location = useLocation();
    
    if (location.pathname === '/' || location.pathname === '/signin') {
        return null;
    }

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
                <Link to="/">Sign Up</Link>
            </nav>
        </div>
    );
}
