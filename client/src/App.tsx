import { Routes, Route } from "react-router-dom";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Home from "./components/Home";

export default function App() {
	return (
		<>
			<Routes>
				<Route path='/' element={<Home />}></Route>
				<Route path='signup' element={<SignUp />}></Route>
				<Route path='signin' element={<SignIn />}></Route>
			</Routes>
		</>
	);
}
