import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Loans from "./pages/Loans";
import Members from "./pages/Members";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "books", Component: Books },
      { path: "loans", Component: Loans },
      { path: "members", Component: Members },
    ],
  },
]);
