import { Navigate, Route, Routes } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { checkAuth } from "./authSlice";
import { Spinner } from "./components/ui/spinner";
import { Toaster } from "sonner";
import MainLayout from "./components/MainLayout";
import HomePage from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemPage from "./pages/ProblemPage";
import AdminLayout from "./pages/AdminLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminCreate from "./pages/AdminCreate";
import UpdateProblem from "./components/updateProblem";
import AdminUpload from "./pages/AdminUpload";
import AuthSuccess from "./pages/AuthSuccess";
import Contest from "./pages/Contest";
import Discuss from "./pages/Discuss";
import NotFound from "./pages/NotFound";

function App() {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    dispatch(checkAuth()).finally(() => {
      setIsCheckingAuth(false);
    });
  }, [dispatch]);

  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#4ADE80]">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" theme="dark" richColors />
      <Routes>
        <Route element={<MainLayout />}>
          <Route element={<HomePage />} path="/" />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/contests" element={<Contest />} />
          <Route path="/discuss" element={<Discuss />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Auth Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/problem/:problemId" element={<ProblemPage />} />

        {/* Admin Route
         */}
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminLayout />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path='/admin/create' element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminCreate />
          ) : (
            <Navigate to="/" />
          )
        } />

        <Route path='/admin/update/:problemId' element={
          isAuthenticated && user?.role === "admin" ? (
            <UpdateProblem />
          ) : (
            <Navigate to="/" />
          )
        } />

        <Route path='/admin/upload/:problemId' element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminUpload />
          ) : (
            <Navigate to="/" />
          )
        } />
      </Routes>

      
    </>
  );
}

export default App;
