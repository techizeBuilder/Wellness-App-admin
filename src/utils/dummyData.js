// Dummy data for Zenovia Admin Panel

export const dashboardStats = {
  totalUsers: 2847,
  totalExperts: 127,
  activeBookings: 89,
  monthlyRevenue: 156789
};

export const revenueData = [
  { name: 'Jan', revenue: 65000, bookings: 120 },
  { name: 'Feb', revenue: 78000, bookings: 145 },
  { name: 'Mar', revenue: 92000, bookings: 167 },
  { name: 'Apr', revenue: 87000, bookings: 156 },
  { name: 'May', revenue: 105000, bookings: 189 },
  { name: 'Jun', revenue: 125000, bookings: 223 },
  { name: 'Jul', revenue: 142000, bookings: 267 },
  { name: 'Aug', revenue: 156789, bookings: 298 }
];

export const categoryData = [
  { name: 'Yoga', value: 35, color: '#004d4d' },
  { name: 'Diet & Nutrition', value: 28, color: '#ffd700' },
  { name: 'Ayurveda', value: 20, color: '#ff6f61' },
  { name: 'Meditation', value: 12, color: '#00b3b3' },
  { name: 'Others', value: 5, color: '#10b981' }
];

export const userGrowthData = [
  { name: 'Jan', users: 1200 },
  { name: 'Feb', users: 1456 },
  { name: 'Mar', users: 1678 },
  { name: 'Apr', users: 1834 },
  { name: 'May', users: 2012 },
  { name: 'Jun', users: 2267 },
  { name: 'Jul', users: 2534 },
  { name: 'Aug', users: 2847 }
];

export const recentBookings = [
  {
    id: 'BK001',
    user: 'Sarah Johnson',
    expert: 'Dr. Priya Sharma',
    service: 'Yoga Session',
    date: '2024-09-25',
    time: '10:00 AM',
    status: 'Confirmed',
    amount: 1200
  },
  {
    id: 'BK002',
    user: 'Michael Chen',
    expert: 'Nutritionist Maya',
    service: 'Diet Consultation',
    date: '2024-09-25',
    time: '2:00 PM',
    status: 'Pending',
    amount: 800
  },
  {
    id: 'BK003',
    user: 'Emily Davis',
    expert: 'Ayurveda Expert Ram',
    service: 'Ayurvedic Treatment',
    date: '2024-09-26',
    time: '11:00 AM',
    status: 'Confirmed',
    amount: 1500
  },
  {
    id: 'BK004',
    user: 'Alex Wilson',
    expert: 'Meditation Guru Anand',
    service: 'Meditation Session',
    date: '2024-09-26',
    time: '6:00 PM',
    status: 'Confirmed',
    amount: 600
  },
  {
    id: 'BK005',
    user: 'Lisa Anderson',
    expert: 'Dr. Priya Sharma',
    service: 'Yoga Session',
    date: '2024-09-27',
    time: '9:00 AM',
    status: 'Cancelled',
    amount: 1200
  }
];

export const users = [
  {
    id: 'U001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+91 9876543210',
    joinDate: '2024-01-15',
    status: 'Active',
    totalBookings: 12,
    totalSpent: 15600
  },
  {
    id: 'U002',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+91 9876543211',
    joinDate: '2024-02-20',
    status: 'Active',
    totalBookings: 8,
    totalSpent: 9800
  },
  {
    id: 'U003',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+91 9876543212',
    joinDate: '2024-01-30',
    status: 'Inactive',
    totalBookings: 5,
    totalSpent: 6200
  },
  {
    id: 'U004',
    name: 'Alex Wilson',
    email: 'alex.wilson@email.com',
    phone: '+91 9876543213',
    joinDate: '2024-03-10',
    status: 'Active',
    totalBookings: 15,
    totalSpent: 18900
  },
  {
    id: 'U005',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+91 9876543214',
    joinDate: '2024-02-05',
    status: 'Active',
    totalBookings: 7,
    totalSpent: 8400
  }
];

export const experts = [
  {
    id: 'E001',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@zenovia.com',
    phone: '+91 9876543220',
    category: 'Yoga',
    experience: '8 years',
    rating: 4.8,
    totalSessions: 245,
    status: 'Active',
    joinDate: '2023-06-15',
    specialization: 'Hatha Yoga, Pranayama'
  },
  {
    id: 'E002',
    name: 'Nutritionist Maya',
    email: 'maya.nutrition@zenovia.com',
    phone: '+91 9876543221',
    category: 'Diet & Nutrition',
    experience: '6 years',
    rating: 4.9,
    totalSessions: 189,
    status: 'Active',
    joinDate: '2023-08-20',
    specialization: 'Weight Management, Clinical Nutrition'
  },
  {
    id: 'E003',
    name: 'Ayurveda Expert Ram',
    email: 'ram.ayurveda@zenovia.com',
    phone: '+91 9876543222',
    category: 'Ayurveda',
    experience: '12 years',
    rating: 4.7,
    totalSessions: 167,
    status: 'Active',
    joinDate: '2023-05-10',
    specialization: 'Panchakarma, Herbal Medicine'
  },
  {
    id: 'E004',
    name: 'Meditation Guru Anand',
    email: 'anand.meditation@zenovia.com',
    phone: '+91 9876543223',
    category: 'Meditation',
    experience: '10 years',
    rating: 4.9,
    totalSessions: 134,
    status: 'Active',
    joinDate: '2023-07-01',
    specialization: 'Mindfulness, Vipassana'
  },
  {
    id: 'E005',
    name: 'Dr. Kavita Nair',
    email: 'kavita.nair@zenovia.com',
    phone: '+91 9876543224',
    category: 'Yoga',
    experience: '5 years',
    rating: 4.6,
    totalSessions: 98,
    status: 'Inactive',
    joinDate: '2023-09-15',
    specialization: 'Ashtanga Yoga, Therapeutic Yoga'
  }
];

export const bookings = [
  {
    id: 'BK001',
    user: 'Sarah Johnson',
    expert: 'Dr. Priya Sharma',
    service: 'Yoga Session',
    date: '2024-09-25',
    time: '10:00 AM',
    duration: '60 min',
    status: 'Confirmed',
    amount: 1200,
    paymentStatus: 'Paid'
  },
  {
    id: 'BK002',
    user: 'Michael Chen',
    expert: 'Nutritionist Maya',
    service: 'Diet Consultation',
    date: '2024-09-25',
    time: '2:00 PM',
    duration: '45 min',
    status: 'Pending',
    amount: 800,
    paymentStatus: 'Pending'
  },
  {
    id: 'BK003',
    user: 'Emily Davis',
    expert: 'Ayurveda Expert Ram',
    service: 'Ayurvedic Treatment',
    date: '2024-09-26',
    time: '11:00 AM',
    duration: '90 min',
    status: 'Confirmed',
    amount: 1500,
    paymentStatus: 'Paid'
  },
  {
    id: 'BK004',
    user: 'Alex Wilson',
    expert: 'Meditation Guru Anand',
    service: 'Meditation Session',
    date: '2024-09-26',
    time: '6:00 PM',
    duration: '45 min',
    status: 'Confirmed',
    amount: 600,
    paymentStatus: 'Paid'
  },
  {
    id: 'BK005',
    user: 'Lisa Anderson',
    expert: 'Dr. Priya Sharma',
    service: 'Yoga Session',
    date: '2024-09-27',
    time: '9:00 AM',
    duration: '60 min',
    status: 'Cancelled',
    amount: 1200,
    paymentStatus: 'Refunded'
  }
];

export const payments = [
  {
    id: 'PAY001',
    transactionId: 'TXN123456789',
    user: 'Sarah Johnson',
    amount: 1200,
    method: 'Credit Card',
    date: '2024-09-25',
    status: 'Completed',
    service: 'Yoga Session'
  },
  {
    id: 'PAY002',
    transactionId: 'TXN123456790',
    user: 'Emily Davis',
    amount: 1500,
    method: 'UPI',
    date: '2024-09-26',
    status: 'Completed',
    service: 'Ayurvedic Treatment'
  },
  {
    id: 'PAY003',
    transactionId: 'TXN123456791',
    user: 'Alex Wilson',
    amount: 600,
    method: 'Debit Card',
    date: '2024-09-26',
    status: 'Completed',
    service: 'Meditation Session'
  },
  {
    id: 'PAY004',
    transactionId: 'TXN123456792',
    user: 'Michael Chen',
    amount: 800,
    method: 'Net Banking',
    date: '2024-09-25',
    status: 'Pending',
    service: 'Diet Consultation'
  },
  {
    id: 'PAY005',
    transactionId: 'TXN123456793',
    user: 'Lisa Anderson',
    amount: 1200,
    method: 'Credit Card',
    date: '2024-09-27',
    status: 'Refunded',
    service: 'Yoga Session'
  }
];

export const subscriptions = [
  {
    id: 'SUB001',
    name: 'Basic Plan',
    price: 999,
    duration: '1 Month',
    features: [
      '5 Sessions per month',
      'Basic yoga classes',
      'Diet consultation',
      'Email support'
    ],
    subscribers: 1245,
    status: 'Active'
  },
  {
    id: 'SUB002',
    name: 'Premium Plan',
    price: 2499,
    duration: '3 Months',
    features: [
      '15 Sessions per month',
      'All yoga & meditation classes',
      'Personal diet plan',
      'Ayurveda consultation',
      'Priority support'
    ],
    subscribers: 867,
    status: 'Active'
  },
  {
    id: 'SUB003',
    name: 'Elite Plan',
    price: 4999,
    duration: '6 Months',
    features: [
      'Unlimited Sessions',
      'All premium features',
      'One-on-one expert sessions',
      'Custom wellness program',
      '24/7 support',
      'Health tracking'
    ],
    subscribers: 345,
    status: 'Active'
  }
];

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getStatusColor = (status) => {
  const statusColors = {
    Active: 'status-active',
    Inactive: 'status-inactive',
    Pending: 'status-pending',
    Confirmed: 'status-active',
    Cancelled: 'status-inactive',
    Completed: 'status-active',
    Refunded: 'status-pending',
    Paid: 'status-active'
  };
  
  return statusColors[status] || 'status-pending';
};

export default {
  dashboardStats,
  revenueData,
  categoryData,
  userGrowthData,
  recentBookings,
  users,
  experts,
  bookings,
  payments,
  subscriptions,
  formatCurrency,
  formatDate,
  getStatusColor
};