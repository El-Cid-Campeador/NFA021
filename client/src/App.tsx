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
import Fees from "./pages/Fees";
import BookModifications from "./pages/BookModifications";
import BookBorrowings from "./pages/BookBorrowings";
import AddLibrarian from "./pages/AddLibrarian";
import FeesDetails from "./pages/FeesDetails";

export default function App() {	
	return (
		<Routes>
			<Route path="/" element={<SignUp />} />
			<Route path="new_librarian" element={<AddLibrarian />} />
			<Route path="signin" element={<SignIn />}></Route>
			<Route path="home" element={<Home />}></Route>
			<Route path="books/:bookId" element={<GetBook />}></Route>
			<Route path="books/:bookId/modifications" element={<BookModifications />}></Route>
			<Route path="books/:bookId/borrowings" element={<BookBorrowings />}></Route>
			<Route path="search" element={<Search />}></Route>
			<Route path="advanced_search" element={<AdvancedSearch />}></Route>
			<Route path="dashboard" element={<Dashboard />}></Route>
			<Route path="books/add" element={<AddBook />}></Route>
			<Route path="books/edit/:bookId" element={<EditBook />}></Route>
			<Route path="members/:memberId" element={<GetMember />}></Route>
			<Route path="fees/:memberId" element={<Fees />}></Route>
			<Route path="fees/:memberId/details" element={<FeesDetails />}></Route>
			<Route path="*" element={<PageNotFound />}></Route>
		</Routes>
	);
}
