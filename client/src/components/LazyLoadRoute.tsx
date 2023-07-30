import { Suspense } from "react";
import Loading from "./Loading";

type Props = {
    component: JSX.Element
}

export default function LazyLoadRoute({ component }: Props) {
    return (
        <Suspense fallback={<Loading />}>
            {component}
        </Suspense>
    );
}
