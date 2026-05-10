export interface HelpQuestion {
  q: string;
  a: string;
}

export interface HelpModule {
  id: string;
  label: string;
  icon: string;
  questions: HelpQuestion[];
}

const helpContent: HelpModule[] = [
  {
    id: 'sales',
    label: 'Sales',
    icon: 'fa-cart-shopping',
    questions: [
      {
        q: 'How do I record a new sale?',
        a: 'Go to Sales → click "New Sale". Select a customer (optional), choose a branch, add products by searching for variants, set quantities, apply any discount, then click "Create Sale". The sale will be recorded with a PENDING payment status by default.',
      },
      {
        q: 'How do I record a payment on a sale?',
        a: 'Open the sale from the Sales list, then click "Record Payment". Enter the amount paid and the payment method. The payment status will update automatically to PARTIAL or PAID depending on the amount.',
      },
      {
        q: 'Can I cancel a sale?',
        a: 'Yes. Open the sale detail page and click "Cancel Sale". Cancelled sales are excluded from all revenue reports. This action cannot be undone.',
      },
      {
        q: 'What does "Partial" payment status mean?',
        a: 'Partial means the customer has paid some but not all of the sale total. The remaining balance is tracked as outstanding and will appear in the unpaid sales report.',
      },
      {
        q: 'How do I view the receipt for a sale?',
        a: 'Open the sale detail page and click "View Receipt". A printable receipt page will open which you can print or save as PDF.',
      },
      {
        q: 'How do I filter sales by branch or payment status?',
        a: 'On the Sales list page, use the filter bar at the top to filter by branch, payment status, date range, or search by sale number.',
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: 'fa-boxes-stacked',
    questions: [
      {
        q: 'How do I adjust inventory levels?',
        a: 'Go to Inventory, find the item you want to adjust, and click the adjust icon. Enter the adjustment quantity (positive to add stock, negative to remove) and provide a reason. The change will be logged in the activity feed.',
      },
      {
        q: 'How do I transfer stock between warehouses?',
        a: 'On the Inventory page, click the transfer icon on an item. Select the source and destination warehouse, enter the quantity to transfer, and confirm. Both warehouses will be updated immediately.',
      },
      {
        q: 'What does "Low Stock" mean?',
        a: 'An item is marked as Low Stock when its current quantity is at or below the minimum quantity threshold set for that item. You can see all low-stock items on the Inventory page or in the Reports → Inventory tab.',
      },
      {
        q: 'How do I set minimum and maximum stock levels?',
        a: 'Minimum and maximum quantities are configured per variant per warehouse. Edit the inventory record from the Inventory page to update these thresholds.',
      },
      {
        q: 'Why does an item show "Reserved" quantity?',
        a: 'Reserved quantity represents stock that is allocated to pending orders or supplies but has not yet been dispatched. Available quantity = Total − Reserved.',
      },
    ],
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: 'fa-money-bill-wave',
    questions: [
      {
        q: 'How do I record an expense?',
        a: 'Go to Expenses → click "Record Expense". Fill in the amount, date, category, branch, and an optional description. Click "Record Expense" to save.',
      },
      {
        q: 'What expense categories are available?',
        a: 'The available categories are: Rent, Utilities, Salaries, Waybill Fees, Maintenance, Feeding, Daily Transport, Workers Payment, and Miscellaneous.',
      },
      {
        q: 'Can I edit or delete an expense after recording it?',
        a: 'Yes, if you have the right permissions. Use the edit (pencil) icon to update an expense, or the delete (trash) icon to remove it. Deleted expenses cannot be recovered.',
      },
      {
        q: 'How do I view expenses for a specific branch?',
        a: 'Use the Branch filter on the Expenses page to narrow down to a specific branch. You can also filter by category and date range.',
      },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: 'fa-box',
    questions: [
      {
        q: 'What is the difference between a Product and a Variant?',
        a: 'A Product is the base item (e.g. "Office Chair"). A Variant is a specific version of that product with distinct attributes like size or colour (e.g. "Office Chair — Black, Large"). Stock is tracked at the variant level.',
      },
      {
        q: 'How do I add a new product?',
        a: 'Go to Products → "New Product". Enter the product name, brand, category, and type. After creating the product, add one or more variants with their own pricing and attributes.',
      },
      {
        q: 'How do I add a variant to an existing product?',
        a: 'Open the product profile page and scroll to the Variants section. Click "Add Variant", fill in the variant details, and save.',
      },
      {
        q: 'Can I deactivate a product without deleting it?',
        a: 'Yes. On the product profile or edit page, change the status to Inactive. Inactive products will not appear in the sale creation form.',
      },
    ],
  },
  {
    id: 'supplies',
    label: 'Supplies',
    icon: 'fa-truck-fast',
    questions: [
      {
        q: 'What is a Supply?',
        a: 'A Supply records stock coming in to a branch or warehouse from an external source. It is the inbound equivalent of a sale. Supplies start as Draft and are marked Fulfilled once the stock is received.',
      },
      {
        q: 'How do I fulfil a supply?',
        a: 'Open the supply detail page and click "Fulfil Supply". This marks the supply as fulfilled and updates the inventory levels in the destination warehouse.',
      },
      {
        q: 'Can I cancel a supply?',
        a: 'Yes. Open the supply detail and click "Cancel". Cancelled supplies are excluded from inventory and reporting.',
      },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: 'fa-users',
    questions: [
      {
        q: 'How do I add a new customer?',
        a: 'Go to Customers → "New Customer". Enter the customer\'s name, contact details, and optionally a credit limit. Save to create the customer record.',
      },
      {
        q: 'What is a credit limit?',
        a: 'A credit limit is the maximum amount a customer can owe at any time. When recording a sale, the system checks the customer\'s outstanding balance against their credit limit.',
      },
      {
        q: 'How do I see how much a customer owes?',
        a: 'Open the customer profile. The outstanding balance and available credit are displayed at the top. You can also see all their associated sales.',
      },
    ],
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: 'fa-id-card',
    questions: [
      {
        q: 'How do I add a new staff member?',
        a: 'Go to Manage Staff → "New Staff". Fill in their name, email, phone, branch, and assign a role. They will receive a login email to set their password.',
      },
      {
        q: 'How do I change a staff member\'s role?',
        a: 'Open the staff profile and click "Edit". Change the role from the dropdown and save. The new permissions take effect immediately on their next action.',
      },
      {
        q: 'How do I transfer a staff member to another branch?',
        a: 'Open the staff profile and use the "Transfer" option. Select the destination branch and confirm. The transfer is logged in the activity feed.',
      },
      {
        q: 'What happens when I deactivate a staff account?',
        a: 'Deactivated staff cannot log in. Their historical records (sales, expenses, activities) are preserved and still attributed to them.',
      },
      {
        q: 'How do roles and permissions work?',
        a: 'Each staff member is assigned a role (e.g. Cashier, Manager). Each role has a set of permissions that control what pages and actions are accessible. Roles are managed under Manage Staff → Roles.',
      },
    ],
  },
  {
    id: 'branches',
    label: 'Branches & Warehouses',
    icon: 'fa-code-branch',
    questions: [
      {
        q: 'What is the difference between a Branch and a Warehouse?',
        a: 'A Branch is a business location (e.g. a store or office). A Warehouse is a physical storage location that belongs to a branch. One branch can have multiple warehouses.',
      },
      {
        q: 'How do I create a new branch?',
        a: 'Go to Branches → "New Branch". Fill in the branch name, address, and assign a manager. The branch code is generated automatically.',
      },
      {
        q: 'How do I create a warehouse for a branch?',
        a: 'Go to Warehouses → "New Warehouse". Select the branch it belongs to, set the warehouse type and capacity, and assign a manager.',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'fa-chart-line',
    questions: [
      {
        q: 'How do I generate a report?',
        a: 'Go to Reports, select a tab (Sales, Expenses, Inventory, etc.), choose a date range and optionally a branch, and the report loads automatically.',
      },
      {
        q: 'How do I export a report to CSV?',
        a: 'With a report loaded, click "Export CSV" in the top-right corner. A CSV file will download immediately to your device.',
      },
      {
        q: 'How do I export a report to PDF?',
        a: 'Click "Download PDF" in the top-right corner. A formatted print page will open in a new tab with the Seeman logo. Use your browser\'s print dialog to save as PDF.',
      },
      {
        q: 'Can I filter reports by branch?',
        a: 'Yes, if you have a management role. A branch dropdown appears in the filter bar. Branch-level staff only see data for their own branch.',
      },
    ],
  },
];

export default helpContent;
