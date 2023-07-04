import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import BookItem from "./pages/BookItem";
import Search from "./pages/Search";
import AdvancedSearch from "./pages/AdvancedSearch";
import Dashboard from "./pages/Dashboard";
import PageNotFound from "./pages/PageNotFound";
import UserItem from "./pages/UserItem";
import AddBook from "./pages/AddBook";

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
				<Route path="add-book" element={<AddBook />}></Route>
				<Route path="members/:memberId" element={<UserItem />}></Route>
				<Route path="*" element={<PageNotFound />}></Route>
			</Routes>
		</>
	);
}

// http://localhost:5173/0300fb90-e7a8-46c5-9172-0b4152add927
