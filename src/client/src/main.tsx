import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import AppProviders from "./Providers.tsx";

// import { createBrowserRouter, RouterProvider } from "react-router-dom";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//   },
// ]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	  <AppProviders>
	    <App />
	  </AppProviders>
);
//   <React.StrictMode>
//     <RouterProvider router={router} />
//   </React.StrictMode>
// );