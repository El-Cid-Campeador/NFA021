import Footer from "./Footer";
import NavBar from "./NavBar";

type Props = {
    content: JSX.Element
}

export default function Container({ content }: Props) {
    return (
        <>
            <NavBar />
                <div className="wrapper">
                    {content}
                </div>
            <Footer />
        </>
    );
}
