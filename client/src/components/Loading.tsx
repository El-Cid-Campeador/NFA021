import { useEffect } from "react";

export default function Loading() { 
    useEffect(() => {
        document.querySelector('body')!.classList.add('show-modal');
        document.querySelector('html')!.classList.add('show-modal');

        return (() => {
            document.querySelector('body')!.classList.remove('show-modal');
            document.querySelector('html')!.classList.remove('show-modal');
        });
    }, []);
    
    return (
        <div className="absolute w-[100vw] h-[100vh] top-0 right-0 bottom-0 left-0 flex justify-center items-center bg-[#fcfcfccb] z-[9000]" >
            <h1>Loading...</h1>
        </div>
    );
}
