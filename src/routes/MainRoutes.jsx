import { lazy } from 'react';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';
import UserMaster from '../views/master/usermaster';
import SupplierMaster from '../views/master/supplier';
import MaterialMaster from '../views/master/materialmaster';
import SupplierGroup from '../views/master/suppliergroup';
import MaterialStockMaster from '../views/Stock/Materialstock';
import StockAdjustment from '../views/Stock/stockadjustment';
import InwardPage from '../views/transition/inward';
import DispatchPage from '../views/transition/dispatch';
import PriceMaster from '../views/master/pricemaster';
import CategoryWise from '../views/reports/categorywise';
import InwardReport from '../views/reports/inwardreport';
import DispatchReport from '../views/reports/dispatchreport';


const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const  Transition = lazy(() => import('../views/dashboard/Transition/index'));



const Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));

const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));

const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));

const Sample = lazy(() => import('../views/sample'));

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        {
          path: '/transition/inward',
          element: <DashboardSales />
        },
          {
          path: '/transition/dispatch',
          element: <Transition />
        },
        {
          path: '/dashboard',
          element: <Typography />
        },
        {
          path: '/settings',
          element: <Color />
        },
        {
          path: '/privilege',
          element: <FeatherIcon />
        },
        {
          path: '/icons/font-awesome-5',
          element: <FontAwesome />
        },
        {
          path: '/icons/material',
          element: <MaterialIcon />
        },

        {
          path: '/sample-page',
          element: <Sample />
        }, 
         {
          path: '/usermaster',
          element: <UserMaster />
        }, {
          path: '/customer',
          element: <SupplierMaster />
        },
         {
          path: '/materialmaster',
          element: <MaterialMaster />
        },

         {
          path: '/pricemaster',
          element: <PriceMaster />
        },

         {
          path: '/suppliergroup',
          element: < SupplierGroup/>
        },
        {
          path: '/materialstock',
          element: <MaterialStockMaster />
        },

         {
          path: '/stockadjustement',
          element: <StockAdjustment />
        },

         {
          path: '/inwardpage',
          element: <InwardPage />
        },  

         {
          path: '/dispatch',
          element: <DispatchPage />
        },

           {
          path: '/cateworywise',
          element: <CategoryWise />
        },

         {
          path: '/inwardreport',
          element: <InwardReport />
        },

         {
          path: '/dispatchreport',
          element: <DispatchReport />
        },
    
      ]
    },
    {
      path: '/',
      element: <GuestLayout />,
      children: [
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/register',
          element: <Register />
        }
      ]
    }
  ]
};

export default MainRoutes;
