import { Routes, Route } from "react-router-dom";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Home from "./components/Home";
import { useQuery } from "@tanstack/react-query";
import { Book, fetcher } from "./functions";
import BookItem from "./components/BookItem";

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
				<Route path='/' element={<Home />}></Route>
				<Route path='signup' element={<SignUp />}></Route>
				<Route path='signin' element={<SignIn />}></Route>
				{
					books?.result.map(book => <Route path={book.id} element={<BookItem book={book} />} key={book.id}></Route>)
				}
			</Routes>
		</>
	);
}
