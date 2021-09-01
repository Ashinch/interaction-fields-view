import Detail from '../page/detail/detail';
import Index from '../page/index/index';
import Login from '../page/login/login';

const routes = [
  {
    path: '/',
    component: Index
  },
  {
    path: '/detail',
    component: Detail
  },
  {
    path: '/login',
    component: Login
  }
];
export default routes;
