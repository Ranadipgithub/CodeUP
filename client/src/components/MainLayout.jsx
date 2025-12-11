import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />  {/* Pages that use this layout will render here */}
    </>
  );
};

export default MainLayout;
