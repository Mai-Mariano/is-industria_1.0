import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminRH, { loader as adminLoader } from "./pages/AdminRH";
import Login, { loader as loginLoader } from "./pages/Login";
import "./index.css";
import "./i18n";
import MainLayout from "./layout/MainLayout";

const Home = lazy(() => import("./pages/Home.jsx"));
const QuemSomos = lazy(() => import("./pages/QuemSomos.jsx"));
const Certificates = lazy(() => import("./pages/Certificates.jsx"));
const Services = lazy(() => import("./pages/Services.jsx"));
const ServicesIndex = lazy(() => import("./pages/ServicesIndex.jsx"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail.jsx"));
const MapPage = lazy(() => import("./pages/Map.jsx"));
const News = lazy(() => import("./pages/News.jsx"));
const Careers = lazy(() => import("./pages/Careers.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Privacidade = lazy(() => import("./pages/Privacidade.jsx"));
const OndeAtuamos = lazy(() => import("./pages/onde-atuamos.jsx"));
const Compliance = lazy(() => import("./pages/Compliance.jsx"));

const NotFound = () => <div className="p-6 text-red-600">Pagina nao encontrada.</div>;

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div className="p-6">Carregando...</div>}>
        <MainLayout />
      </Suspense>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "QuemSomos", element: <QuemSomos /> },
      { path: "certificados", element: <Certificates /> },
      { path: "servicos", element: <Services /> },
      { path: "mapa", element: <MapPage /> },
      { path: "noticias", element: <News /> },
      { path: "carreiras", element: <Careers /> },
      { path: "admin", element: <AdminRH />, loader: adminLoader },
      { path: "login", element: <Login />, loader: loginLoader },
      { path: "privacidade", element: <Privacidade /> },
      { path: "contato", element: <Contact /> },
      { path: "compliance", element: <Compliance /> },
      { path: "about", element: <About /> },
      { path: "onde-atuamos", element: <OndeAtuamos /> },
      { path: "servicos/index", element: <ServicesIndex /> },
      { path: "servicos/:slug", element: <ServiceDetail /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
