import SearchByText from "../components/SearchByText";
import Container from "../components/Container";

export default function Search() {
    return (
        <Container content={
            <div className="wrapper">
                <SearchByText
                    queryKey="books"
                    route="/books"
                    placeholder="Title or author name"
                />
            </div>
        } />
    );
}
