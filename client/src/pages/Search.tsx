import SearchByText from "../components/SearchByText";
import NavBar from "../components/NavBar";

export default function Search() {
    return (
        <>
            <NavBar />
            <SearchByText
                queryKey="books"
                route="/books"
                placeholder="Title or author name"
            />
        </>
    );
}
