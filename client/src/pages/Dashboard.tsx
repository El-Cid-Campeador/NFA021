import { Link } from "react-router-dom";
import SearchByText from "../components/SearchByText";
import NavBar from "../components/NavBar";

export default function Dashboard() {
    return (
        <>
            <NavBar />
            <div className="m-[10px]">
                <div className="flex gap-[20px]">
                    <Link to="/" className="text-customBlue">
                        <img src="/user-plus.svg" alt="Add New Librarian" title="Add New Librarian" width={50} height={50} />
                    </Link>
                    <Link to="/books/add" className="text-customBlue">
                        <img src="/book-add.svg" alt="Add New Book" title="Add New Book" width={50} height={50} />
                    </Link>
                </div>
                <SearchByText
                    queryKey="members"
                    route="/members"
                    placeholder="Member first name or last name or ID"
                />
            </div>
        </>
    );
}
