import Footer from "./Footer";
import NavBar from "./NavBar";

type Props = {
    content: JSX.Element
}

export default function Container({ content }: Props) {
    return (
        <div className="wrapper">
            <NavBar />
                {content}
            <Footer />
        </div>
    );
}
