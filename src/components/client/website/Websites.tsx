import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useParams,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavWebsites from "./Navigation";
import Pages from "./pages/Pages";
import PuckEditor from "./pages/Editor";
import PuckPreview from "./pages/Preview";
import Files from "./pages/Files";
import Products from "./pages/Products";
import Forms from "./pages/Forms";
import Appearance from "./pages/Appearance";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import { LanguageProvider } from "@/providers/LanguageProvider";

export const Websites = ({ user }: { user: any }) => {
  // The Main Dashboard Layout (Sidebar + Content)
  const DashboardLayout = () => {
    const { t } = useTranslation();
    const { subdomain } = useParams();
    if (!subdomain) return null;

    return (
      <div className="flex w-full h-screen overflow-hidden">
        <aside className="w-52 shrink-0 border-r border-gray-200 bg-white h-full overflow-y-auto">
          <NavWebsites user={user} />
        </aside>
        <main className="grow h-full overflow-y-auto bg-gray-50">
          <div className="w-full min-h-full">
            {/* Header Area */}
            <div className="py-8 md:px-0 bg-white border-b border-gray-200 mb-6">
              <div className="mx-auto max-w-7xl px-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("dashboard.title")}
                </h1>
              </div>
            </div>
            {/* Content Area */}
            <div className="mx-auto max-w-7xl w-full px-6 pb-20">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/admin/websites/:subdomain",
      children: [
        // 1. Full Screen Editor Route (No Sidebar)
        {
          path: "pages/:pagePath/editor",
          element: <PuckEditor />,
        },
        {
          path: "pages/:pagePath/preview",
          element: <PuckPreview />,
        },

        // 2. Dashboard Routes (With Sidebar)
        {
          element: <DashboardLayout />,
          children: [
            { index: true, element: <Navigate to="pages" replace /> },
            { path: "pages", element: <Pages /> },
            { path: "files", element: <Files /> },
            { path: "products", element: <Products /> },
            { path: "forms", element: <Forms /> },
            { path: "appearance", element: <Appearance /> },
            { path: "users", element: <Users /> },
            { path: "settings", element: <Settings /> },
          ],
        },
      ],
    },
  ]);

  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
};
