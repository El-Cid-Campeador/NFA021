import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Home from "./components/Home";
import { useQuery } from "@tanstack/react-query";
import { Book, fetcher, isAlreadyLoggedIn } from "./functions";
import BookItem from "./components/BookItem";
import { useEffect, useState } from "react";


function Protected() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		async function checkAuthentication() {
			const auth = await isAlreadyLoggedIn();
			setIsLoggedIn(auth);
		};

		checkAuthentication();
	}, []);

	return isLoggedIn ? <Outlet /> : <Navigate to={'/signin'} />;
}

export default function App() {
	const { data: books, isLoading } = useQuery({
		queryKey: ['books'],
        queryFn: async () => {
            const { data } = await fetcher.get(`http://localhost:8080/books`) ;
            return data as { result: Book[] };
        }
	});

	if (isLoading) return <h1>Loading...</h1>;
	
	return (
		<>
			<Routes>
				<Route element={<Protected />}>
					<Route path='/' element={<Home/>} />
					{
						books?.result.map(book => <Route path={book.id} element={<BookItem book={book} />} key={book.id}></Route>)
					}
				</Route>
				<Route path="signup" element={<SignUp />}></Route>
				<Route path="signin" element={<SignIn />}></Route>
				<Route path="*" element={<h1>Page not found!</h1>}></Route>
			</Routes>
		</>
	);
}

// http://localhost:5173/0300fb90-e7a8-46c5-9172-0b4152add927
