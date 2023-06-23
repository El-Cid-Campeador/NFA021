import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
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
		<QueryClientProvider client={client}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</QueryClientProvider>
	</React.StrictMode>,
);
