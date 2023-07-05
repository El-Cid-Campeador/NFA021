import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import GetBook from "./pages/GetBook";
import Search from "./pages/Search";
import AdvancedSearch from "./pages/AdvancedSearch";
import Dashboard from "./pages/Dashboard";
import PageNotFound from "./pages/PageNotFound";
import GetMember from "./pages/GetMember";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";

export default function App() {	
	return (
		<>
			<Routes>
				<Route path="/" element={<SignUp />} />
				<Route path="signin" element={<SignIn />}></Route>
				<Route path="home" element={<Home />}></Route>
				<Route path="books/:bookId" element={<GetBook />}></Route>
				<Route path="search" element={<Search />}></Route>
				<Route path="advanced_search" element={<AdvancedSearch />}></Route>
				<Route path="dashboard" element={<Dashboard />}></Route>
				<Route path="add-book" element={<AddBook />}></Route>
				<Route path="edit-book/:bookId" element={<EditBook />}></Route>
				<Route path="members/:memberId" element={<GetMember />}></Route>
				<Route path="*" element={<PageNotFound />}></Route>
			</Routes>
		</>
	);
}
