import { lazy, useState, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.scss";

// Layouts
import AdminLayout from "layouts/AdminLayout";
import GuestLayout from "layouts/GuestLayout";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
const Login = lazy(() => import("./views/auth/login"));
const Register = lazy(() => import("./views/auth/register"));
const DashboardSales = lazy(() => import("./views/dashboard/DashSales/index"));
const Transition = lazy(() => import("./views/dashboard/Transition/index"));
const Typography = lazy(() => import("./views/ui-elements/basic/BasicTypography"));
const Color = lazy(() => import("./views/ui-elements/basic/BasicColor"));
const FeatherIcon = lazy(() => import("./views/ui-elements/icons/Feather"));
const FontAwesome = lazy(() => import("./views/ui-elements/icons/FontAwesome"));
const MaterialIcon = lazy(() => import("./views/ui-elements/icons/Material"));
const Sample = lazy(() => import("./views/sample"));

// Master/Stock/Reports Pages
const UserMaster = lazy(() => import("./views/master/usermaster"));
const SupplierMaster = lazy(() => import("./views/master/supplier"));
const MaterialMaster = lazy(() => import("./views/master/materialmaster"));
const SupplierGroup = lazy(() => import("./views/master/suppliergroup"));
const MaterialStockMaster = lazy(() => import("./views/Stock/Materialstock"));
const StockAdjustment = lazy(() => import("./views/Stock/stockadjustment"));
const InwardPage = lazy(() => import("./views/transition/inward"));
const DispatchPage = lazy(() => import("./views/transition/dispatch"));
const PriceMaster = lazy(() => import("./views/master/pricemaster"));
const CategoryWise = lazy(() => import("./views/reports/categorywise"));
const InwardReport = lazy(() => import("./views/reports/inwardreport"));
const DispatchReport = lazy(() => import("./views/reports/dispatchreport"));

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Keep login state in sync with localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Redirect root */}
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
          />

          {/* Guest Routes */}
          <Route element={<GuestLayout />}>
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login setIsLoggedIn={setIsLoggedIn} />
                )
              }
            />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Admin Routes */}
          {isLoggedIn && (
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<DashboardSales />} />
              <Route path="/transition/inward" element={<InwardPage />} />
              <Route path="/transition/dispatch" element={<DispatchPage />} />
              <Route path="/settings" element={<Color />} />
              <Route path="/privilege" element={<FeatherIcon />} />
              <Route path="/icons/font-awesome-5" element={<FontAwesome />} />
              <Route path="/icons/material" element={<MaterialIcon />} />
              <Route path="/sample-page" element={<Sample />} />
              <Route path="/usermaster" element={<UserMaster />} />
              <Route path="/customer" element={<SupplierMaster />} />
              <Route path="/materialmaster" element={<MaterialMaster />} />
              <Route path="/pricemaster" element={<PriceMaster />} />
              <Route path="/suppliergroup" element={<SupplierGroup />} />
              <Route path="/materialstock" element={<MaterialStockMaster />} />
              <Route path="/stockadjustment" element={<StockAdjustment />} />
              <Route path="/inwardpage" element={<InwardPage />} />
              <Route path="/dispatch" element={<DispatchPage />} />
              <Route path="/categorywise" element={<CategoryWise />} />
              <Route path="/inwardreport" element={<InwardReport />} />
              <Route path="/dispatchreport" element={<DispatchReport />} />
            </Route>
          )}

          {/* Fallback */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </Suspense>

      {/* Global Toast */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}
