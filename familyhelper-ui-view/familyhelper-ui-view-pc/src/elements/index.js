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
  Option,
  Pagination,
  Select,
  Submenu,
  Switch,
  Table,
  TableColumn,
  TabPane,
  Tabs,
  Tooltip,
  Transfer,
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
Vue.use(Switch);
Vue.use(Option);
Vue.use(Select);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Transfer);

Vue.prototype.$message = Message;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;

Vue.use(OverlayScrollbarsPlugin);

const echarts = require('echarts/lib/echarts');

require('echarts/lib/chart/line');
require('echarts/lib/chart/bar');

require('echarts/lib/component/tooltip');
require('echarts/lib/component/toolbox');
require('echarts/lib/component/dataZoom');
require('echarts/lib/component/title');
require('echarts/lib/component/grid');
require('echarts/lib/component/markArea');
require('echarts/lib/component/markLine');
require('echarts/lib/component/visualMap');
require('echarts/lib/component/legend');
require('echarts/lib/component/legendScroll');
require('echarts/lib/component/legendScroll');

Vue.prototype.$echarts = echarts;
