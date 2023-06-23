import { Routes, Route } from "react-router-dom";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Home from "./components/Home";
import BookItem from "./components/BookItem";
import Search from "./components/Search";
import ExploreByParameter from "./components/ExploreByParameter";

export default function App() {	
	return (
		<>
			<Routes>
				<Route path='/' element={<Home/>} />
				<Route path="signup" element={<SignUp />}></Route>
				<Route path="signin" element={<SignIn />}></Route>
				<Route path="books/:bookId" element={<BookItem />}></Route>
				<Route path="search" element={<Search />}></Route>
				<Route path="explore/:column/:value" element={<ExploreByParameter />}></Route>
				<Route path="*" element={<h1>Page not found!</h1>}></Route>
			</Routes>
		</>
	);
}

// http://localhost:5173/0300fb90-e7a8-46c5-9172-0b4152add927
