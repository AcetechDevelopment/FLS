// Menu configuration for default layout
const menuItems = {
  items: [
   
    {
      id: 'ui-element',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'home' ,
          url: '/dashboard'
        },
        // {
        //   id: 'color',
        //   title: 'Color',
        //   type: 'item',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'color_lens',
        //   url: '/color'
        // },
        // {
        //   id: 'icons',
        //   title: 'Icons',
        //   type: 'collapse',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'history_edu',
        //   children: [
        //     {
        //       id: 'feather',
        //       title: 'Feather',
        //       type: 'item',
        //       url: '/icons/Feather'
        //     },
        //     {
        //       id: 'font-awesome-5',
        //       title: 'Font Awesome',
        //       type: 'item',
        //       url: '/icons/font-awesome-5'
        //     },
        //     {
        //       id: 'material',
        //       title: 'Material',
        //       type: 'item',
        //       url: '/icons/material'
        //     }
        //   ]
        // }
      ]
    },
     {
      // id: 'navigation',
      // title: '',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'transition',
          title: 'Transition',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'swap_horiz',
          children: [
            {
              id: 'inward',
              title: 'Inward',
              type: 'item',
              url: '/inwardpage'
            },
            {
    id: 'dispatch',
    title: 'Dispatch',
    type: 'item',
    url: '/dispatch'
  }
          ]
        }
      ]
    },
    
// {
//   id: 'reports-group',
//   title: 'Reports',
//   type: 'group',
//   icon: 'icon-navigation',
//   children: [
//     {
//       id: 'reports',
//       title: 'Reports',
//       type: 'collapse',
//       icon: 'material-icons-two-tone',
//       iconname: 'description',
//       children: [
//         {
//           id: 'categorywise',
//           title: 'Categorywise',
//           type: 'item',
//           url: '/categorywise'
//         },
//         {
//           id: 'report-2',
//           title: 'Report 2',
//           type: 'item',
//           url: '/dashboard/transition'
//         }
//       ]
//     }
//   ]
// },

{
  id: 'navigation',
  type: 'group',
  icon: 'material-icons-two-tone',
  iconname: 'folder',
  children: [
    {
      id: 'reports',
      title: 'Reports',
      type: 'collapse',   // ✅ dropdown
      icon: 'material-icons-two-tone',
      iconname: 'bar_chart',
      children: [
        {
          id: 'category-report',
          title: 'Category Report',
          type: 'item',
          url: './categorywise'
        },
        {
          id: 'inward-report',
          title: 'Inward Report',
          type: 'item',
          url: './inwardreport'
        },
        {
          id: 'dispatch-report',
          title: 'Dispatch Report',
          type: 'item',
          url: './dispatchreport'
        }
      ]
    }
  ]
},


    // {
    //   id: 'pages',
    //   title: 'Pages',
    //   subtitle: '15+ Redymade Pages',
    //   type: 'group',
    //   icon: 'icon-pages',
    //   children: [
    //     {
    //       id: 'login',
    //       title: 'Login',
    //       type: 'item',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'verified_user',
    //       url: '/login',
    //       target: true
    //     },
    //     {
    //       id: 'register',
    //       title: 'Register',
    //       type: 'item',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'person_add_alt_1',
    //       url: '/register',
    //       target: true
    //     }
    //   ]
    // },

    {
      id: 'support',
      // title: 'OTHER',
      // subtitle: 'Extra More Things',
      type: 'group',
      icon: 'icon-support',
      children: [
      
     {
  id: 'operation-menu',
  title: 'Stock Managament',
  type: 'collapse',
  icon: 'material-icons-two-tone',
 iconname: 'build',
  children: [
    { id: 'operation-1', title: 'Material Stock', type: 'item', url: '/materialstock' },
    { id: 'operation-2', title: 'Stock Management', type: 'item', url: '/stockadjustment' }
  ]
},

        {
  id: 'master-menu',
  title: 'Master',
  type: 'collapse',
  icon: 'material-icons-two-tone',
 iconname: 'folder',
  children: [
    { id: 'supplier', title: 'Customer', type: 'item', url: './customer' },
    { id: 'price-master', title: 'Price Master', type: 'item', url: './pricemaster' },
    { id: 'material-master', title: 'Material Master', type: 'item', url: './materialmaster' },
    { id: 'user-master', title: 'User Master', type: 'item', url: './usermaster' },
    { id: 'supplier-group', title: 'Supplier Group', type: 'item', url: '/suppliergroup' }
  ]
},

    {
  id: 'settings',
  title: 'Settings',
  type: 'collapse', // was 'item'
  classes: 'nav-item',
  icon: 'material-icons-two-tone',
  iconname: 'settings',
  children: [
    {
      id: 'privilege',
      title: 'Privilege',
      type: 'item',
      url: '/privilege',
      classes: 'nav-item',
      // icon: 'material-icons-two-tone',
      iconname: 'storefront'
    },
    //  {
    //   id: 'login',
    //   title: 'Login',
    //   type: 'item',
    //   url: '/login',
    //   target: true,
    //   iconname: 'verified_user'
    // },
    // {
    //   id: 'register',
    //   title: 'Register',
    //   type: 'item',
    //   url: '/register',
    //   target: true,
    //   iconname: 'person_add_alt_1'
    // }
  ]
}
        // {
        //   id: 'disabled-menu',
        //   title: 'Disabled Menu',
        //   type: 'item',
        //   url: '#',
        //   classes: 'nav-item disabled',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'power_off'
        // }
      ]
    }
  ]
};

export default menuItems;