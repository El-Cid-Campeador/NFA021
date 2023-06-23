import { Link } from "react-router-dom";
import SearchByParameter from "./SearchByParameter";
import { bookCategories, bookLanguages, generateYears } from "../functions";

export default function SearchOptions() {
    return (
        <>
            <Link to={`/search`}>Search</Link>
            <SearchByParameter columnName="yearPubl" listOptions={generateYears()} />
            <SearchByParameter columnName="category" listOptions={bookCategories} />
            <SearchByParameter columnName="lang" listOptions={bookLanguages} />
        </>
    );
}
