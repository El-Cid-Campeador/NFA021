import Container from "../components/Container";

export default function PageNotFound() {
    return (
        <Container content={
            <div className="flex items-center justify-center wrapper">
                <h1>Page not found!</h1>
            </div>
        } />
    );
}
