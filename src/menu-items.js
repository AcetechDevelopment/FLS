// Menu configuration for default layout with role-based access
// role_id: 1 = Admin, 2 = Manager, 3 = User

const menuItems = {
  items: [
    // ================= Dashboard =================
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
          url: '/dashboard',
          roles: [1, 2, 3]
        }
      ]
    },

    // ================= Transition =================
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
          roles: [1, 2, 3],
          children: [
            { id: 'inward', title: 'Inward', type: 'item', url: '/transition/inward', roles: [1, 2, 3] },
            { id: 'dispatch', title: 'Dispatch', type: 'item', url: '/transition/dispatch', roles: [1, 2, 3] }
          ]
        }
      ]
    },

    // ================= Reports =================
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
          roles: [1, 2, 3],
          children: [
            { id: 'category-report', title: 'Category Report', type: 'item', url: '/categorywise', roles: [1, 2, 3] },
            { id: 'inward-report', title: 'Inward Report', type: 'item', url: '/inwardreport', roles: [1, 2, 3] },
            { id: 'dispatch-report', title: 'Dispatch Report', type: 'item', url: '/dispatchreport', roles: [1, 2, 3] }
          ]
        }
      ]
    },

    // ================= Stock Management =================
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
          roles: [1, 2], // Only Admin + Manager
          children: [
            { id: 'material-stock', title: 'Material Stock', type: 'item', url: '/materialstock', roles: [1, 2] },
            { id: 'stock-adjustment', title: 'Stock Adjustment', type: 'item', url: '/stockadjustment', roles: [1, 2] }
          ]
        },

        // ================= Master =================
        {
          id: 'master-menu',
          title: 'Master',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'folder',
          roles: [1, 2],
          children: [
            { id: 'customer', title: 'Customer', type: 'item', url: '/customer', roles: [1, 2] },
            { id: 'price-master', title: 'Price Master', type: 'item', url: '/pricemaster', roles: [1, 2] },
            { id: 'material-master', title: 'Material Master', type: 'item', url: '/materialmaster', roles: [1, 2] },
            { id: 'user-master', title: 'User Master', type: 'item', url: '/usermaster', roles: [1] }, // Admin only
            { id: 'customer-group', title: 'Customer Group', type: 'item', url: '/customergroup', roles: [1, 2] },
            { id: 'vehicle-inventory', title: 'Vehicle Inventory', type: 'item', url: '/vehicleinventory', roles: [1, 2, 3] }
          ]
        }
      ]
    }
  ]
};

export default menuItems;