import SearchByText from "../components/SearchByText";

export default function Search() {
    return (
        <>
            <SearchByText
                queryKey="books"
                route="/books"
                placeholder="Title or author name"
            />
        </>
    );
}
