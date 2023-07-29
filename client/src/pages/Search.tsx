import SearchByText from "../components/SearchByText";
import Container from "../components/Container";

export default function Search() {
    return (
        <Container content={
            <SearchByText
                queryKey="books"
                route="/books"
                placeholder="Title or author name"
            />
        } />
    );
}
