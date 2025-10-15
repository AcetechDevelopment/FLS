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
          iconname: 'home',
          url: '/dashboard'
        }
      ]
    },
    {
      id: 'transition-group',
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
              url: '/transition/inward'
            },
            {
              id: 'dispatch',
              title: 'Dispatch',
              type: 'item',
              url: '/transition/dispatch'
            }
          ]
        }
      ]
    },
    {
      id: 'reports-group',
      type: 'group',
      icon: 'material-icons-two-tone',
      iconname: 'folder',
      children: [
        {
          id: 'reports-collapse',
          title: 'Reports',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'bar_chart',
          children: [
            {
              id: 'category-report',
              title: 'Category Report',
              type: 'item',
              url: '/categorywise'
            },
            {
              id: 'inward-report',
              title: 'Inward Report',
              type: 'item',
              url: '/inwardreport'
            },
            {
              id: 'dispatch-report',
              title: 'Dispatch Report',
              type: 'item',
              url: '/dispatchreport'
            }
          ]
        }
      ]
    },
    {
      id: 'support-group',
      type: 'group',
      icon: 'icon-support',
      children: [
        {
          id: 'operation-menu',
          title: 'Stock Management',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'build',
          children: [
            { id: 'material-stock', title: 'Material Stock', type: 'item', url: '/materialstock' },
            { id: 'stock-adjustment', title: 'Stock Adjustment', type: 'item', url: '/stockadjustment' }
          ]
        },
        {
          id: 'master-menu',
          title: 'Master',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'folder',
          children: [
            { id: 'customer', title: 'Customer', type: 'item', url: '/customer' },
            { id: 'price-master', title: 'Price Master', type: 'item', url: '/pricemaster' },
            { id: 'material-master', title: 'Material Master', type: 'item', url: '/materialmaster' },
            { id: 'user-master', title: 'User Master', type: 'item', url: '/usermaster' },
            { id: 'customer-group', title: 'Customer Group', type: 'item', url: '/customergroup' }
          ]
        },
        // {
        //   id: 'settings-menu',
        //   title: 'Settings',
        //   type: 'collapse',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'settings',
        //   children: [
        //     { id: 'privilege', title: 'Privilege', type: 'item', url: '/privilege', iconname: 'storefront' }
        //   ]
        // }
      ]
    }
  ]
};

export default menuItems;