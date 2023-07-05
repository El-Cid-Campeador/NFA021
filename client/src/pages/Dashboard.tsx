import { Link } from "react-router-dom";
import SearchByText from "../components/SearchByText";
import useLocalStorage from "../components/useLocalStorage";
import NavBar from "./NavBar";

export default function Dashboard() {
    const { userData: _userData } = useLocalStorage();
    
    return (
        <>
            <NavBar />
            <div>
                <SearchByText
                    queryKey="members"
                    route="/members"
                    placeholder="Member first name or last name"
                />
                <Link to="/add-book">Add book</Link>
            </div>
        </>
    );
}
