import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import store from "./app/store.ts";
import "./index.css";

const client = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			// staleTime: Infinity,
			// cacheTime: 
			retry: false,
			retryOnMount: false,
			networkMode: 'always'
		},
		mutations: {
			networkMode: 'always'
		}
	},
	logger: {
		log: console.log,
		warn: console.warn,
		error: () => {}
	}
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<Provider store={store}>
			<QueryClientProvider client={client}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</QueryClientProvider>
		</Provider>
	</React.StrictMode>,
);
