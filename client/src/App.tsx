import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import { lazy } from "react";
import LazyLoadRoute from "./components/LazyLoadRoute";

const Home = lazy(() => import('./pages/Home'));
const SignIn = lazy(() => import('./pages/SignIn'));
const GetBook = lazy(() => import('./pages/GetBook'));
const Search = lazy(() => import('./pages/Search'));
const AdvancedSearch = lazy(() => import('./pages/AdvancedSearch'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PageNotFound = lazy(() => import('./pages/PageNotFound'));
const GetMember = lazy(() => import('./pages/GetMember'));
const AddBook = lazy(() => import('./pages/AddBook'));
const EditBook = lazy(() => import('./pages/EditBook'));
const Fees = lazy(() => import('./pages/Fees'));
const BookModifications = lazy(() => import('./pages/BookModifications'));
const BookBorrowings = lazy(() => import('./pages/BookBorrowings'));
const AddLibrarian = lazy(() => import('./pages/AddLibrarian'));
const FeesDetails = lazy(() => import('./pages/FeesDetails'));
const GetLibrarian = lazy(() => import('./pages/GetLibrarian'));

export default function App() {	
	return (
		<Routes>
			<Route path="/" element={<SignUp />} />
			<Route path="signin" element={<LazyLoadRoute component={<SignIn />} />}></Route>
			<Route path="home" element={<LazyLoadRoute component={<Home />} />}></Route>
			<Route path="books/:bookId" element={<LazyLoadRoute component={<GetBook />} />}></Route>
			<Route path="books/:bookId/modifications" element={<LazyLoadRoute component={<BookModifications />} />}></Route>
			<Route path="books/:bookId/borrowings" element={<LazyLoadRoute component={<BookBorrowings />} />}></Route>
			<Route path="search" element={<LazyLoadRoute component={<Search />} />}></Route>
			<Route path="advanced_search" element={<LazyLoadRoute component={<AdvancedSearch />} />}></Route>
			<Route path="dashboard" element={<LazyLoadRoute component={<Dashboard />} />}></Route>
			<Route path="books/add" element={<LazyLoadRoute component={<AddBook />} />}></Route>
			<Route path="books/edit/:bookId" element={<LazyLoadRoute component={<EditBook />} />}></Route>
			<Route path="members/:memberId" element={<LazyLoadRoute component={<GetMember />} />}></Route>
			<Route path="fees/:memberId" element={<LazyLoadRoute component={<Fees />} />}></Route>
			<Route path="fees/:memberId/details" element={<LazyLoadRoute component={<FeesDetails />} />}></Route>
			<Route path="new_librarian" element={<LazyLoadRoute component={<AddLibrarian />} />}></Route>
			<Route path="librarians/:addedlibrarianId" element={<LazyLoadRoute component={<GetLibrarian />} />}></Route>
			<Route path="*" element={<LazyLoadRoute component={<PageNotFound />} />}></Route>
		</Routes>
	);
}
