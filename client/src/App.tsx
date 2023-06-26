import { Routes, Route } from "react-router-dom";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Home from "./components/Home";
import BookItem from "./components/BookItem";
import Search from "./components/Search";
import AdvancedSearch from "./components/AdvancedSearch";
import Dashboard from "./components/Dashboard";

export default function App() {	
	return (
		<>
			<Routes>
				<Route path="/" element={<SignUp />} />
				<Route path="signin" element={<SignIn />}></Route>
				<Route path="home" element={<Home />}></Route>
				<Route path="books/:bookId" element={<BookItem />}></Route>
				<Route path="search" element={<Search />}></Route>
				<Route path="advanced_search" element={<AdvancedSearch />}></Route>
				<Route path="dashboard" element={<Dashboard />}></Route>
				<Route path="*" element={<h1>Page not found!</h1>}></Route>
			</Routes>
		</>
	);
}

// http://localhost:5173/0300fb90-e7a8-46c5-9172-0b4152add927
