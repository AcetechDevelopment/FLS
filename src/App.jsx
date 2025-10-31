import { lazy, useState, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.scss";

// Layouts
import AdminLayout from "layouts/AdminLayout";
import GuestLayout from "layouts/GuestLayout";

// Toast
import { ToastContainer } from "react-toastify";

// 🔹 Remove the direct import of VehicleInventory
// import VehicleInventory from "./views/master/vehicleinventory";

// Loading component
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "1.5rem",
    }}
  >
    <div>Loading...</div>
  </div>
);

// Protected Route
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("authToken");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Lazy load components
const Login = lazy(() => import("./views/auth/login"));
const Register = lazy(() => import("./views/auth/register"));
const Dashboard = lazy(() => import("./views/dashboard/dashboard"));
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
const MaterialStockMaster = lazy(() => import("./views/Stock/materialstock"));
const StockAdjustment = lazy(() => import("./views/Stock/stockadjustment"));
const InwardPage = lazy(() => import("./views/transition/inward"));
const DispatchPage = lazy(() => import("./views/transition/dispatch"));
const PriceMaster = lazy(() => import("./views/master/pricemaster"));
const CategoryWise = lazy(() => import("./views/reports/categorywise"));
const InwardReport = lazy(() => import("./views/reports/inwardreport"));
const DispatchReport = lazy(() => import("./views/reports/dispatchreport"));
const VehicleInventory = lazy(() => import("./views/master/vehicleinventory")); // ✅ keep this one only

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem("authToken"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    setIsLoggedIn(!!token);
    setIsLoading(false);

    const handleStorageChange = (e) => {
      if (e.key === "authToken") setIsLoggedIn(!!e.newValue);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />

          {/* Public routes */}
          <Route element={<GuestLayout />}>
            <Route
              path="/login"
              element={
                isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login setIsLoggedIn={setIsLoggedIn} />
              }
            />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Transition routes */}
            <Route path="/transition/inward" element={<InwardPage />} />
            <Route path="/transition/dispatch" element={<DispatchPage />} />

            {/* Settings/UI routes */}
            <Route path="/settings" element={<Color />} />
            <Route path="/privilege" element={<FeatherIcon />} />
            <Route path="/icons/font-awesome-5" element={<FontAwesome />} />
            <Route path="/icons/material" element={<MaterialIcon />} />
            <Route path="/sample-page" element={<Sample />} />

            {/* Master routes */}
            <Route path="/usermaster" element={<UserMaster />} />
            <Route path="/customer" element={<SupplierMaster />} />
            <Route path="/materialmaster" element={<MaterialMaster />} />
            <Route path="/pricemaster" element={<PriceMaster />} />
            <Route path="/customergroup" element={<SupplierGroup />} />
            <Route path="/vehicleinventory" element={<VehicleInventory />} />

            {/* Stock routes */}
            <Route path="/materialstock" element={<MaterialStockMaster />} />
            <Route path="/stockadjustment" element={<StockAdjustment />} />

            {/* Report routes */}
            <Route path="/categorywise" element={<CategoryWise />} />
            <Route path="/inwardreport" element={<InwardReport />} />
            <Route path="/dispatchreport" element={<DispatchReport />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="colored"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}
