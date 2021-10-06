import Vue from 'vue';
import {
  Aside,
  Avatar,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Card,
  Container,
  Dialog,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form,
  FormItem,
  Header,
  Image,
  Input,
  Main,
  Menu,
  MenuItem,
  MenuItemGroup,
  Message,
  MessageBox,
  Pagination,
  Submenu,
  Table,
  TableColumn,
  Tooltip,
  Tree,
} from 'element-ui';
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(Button);
Vue.use(ButtonGroup);
Vue.use(Image);
Vue.use(Input);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Main);
Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Card);
Vue.use(BreadcrumbItem);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(MenuItemGroup);
Vue.use(Tooltip);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Avatar);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Pagination);
Vue.use(Dialog);
Vue.use(Tree);
Vue.use(Divider);

Vue.prototype.$message = Message;
Vue.prototype.$confirm = MessageBox.confirm;

Vue.use(OverlayScrollbarsPlugin);
