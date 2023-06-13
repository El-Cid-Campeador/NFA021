import { useRef } from "react";

export default function SignIn() {
    const emailRef = useRef<HTMLInputElement>(null!);
    const passwordRef = useRef<HTMLInputElement>(null!);

    return (
        <form onSubmit={() => {}}>
            <div>
                <label htmlFor="email">Email: </label>
                <input type="email" id="email" ref={emailRef} required />
            </div>
            <div>
                <label htmlFor="password">Password: </label>
                <input type="password" id="password" ref={passwordRef} required />
            </div>
            
            <input type="submit" />
        </form>
    );
}
