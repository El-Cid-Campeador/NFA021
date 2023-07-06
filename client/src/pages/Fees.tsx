import { Navigate, useParams } from "react-router-dom";
import NavBar from "./NavBar";
import useQueryFees from "../components/useQueryFees";

export default function Fees() {
    const { memberId } = useParams();

    const { data, isLoading, error, isFetching } = useQueryFees(memberId!);

    if (isLoading || isFetching) return <h1>Loading...</h1>;
    if (error) return <Navigate to="/signin" />;

    return (
        <>
            <NavBar />
            <div>Fees</div>
        </>
    );
}
