import SearchByText from "../components/SearchByText";

export default function Dashboard() {
    return (
        <div>
            <SearchByText
                queryKey="members"
                route="/members"
                placeholder="Member first name or last name"
            />
        </div>
    );
}
