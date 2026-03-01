import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { GardenDetail } from "./pages/GardenDetail";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
        {
            index: true,
            Component: Home,
        },
        {
            path: "garden/:id",
            Component: GardenDetail,
        },
    ]
  },
]);
