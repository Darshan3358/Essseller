import { Product, Order, Supplier, Review, StoreHealthScore, SalesStats, ChartDataPoint } from '@/types';

// Mock Products
export const mockProducts: Product[] = [
    {
        id: '1',
        clientId: 'client1',
        name: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 299.99,
        cost: 150.00,
        imageUrl: '/images/products/headphones.jpg',
        category: 'Electronics',
        stock: 45,
        isFeatured: true,
        featuredOrder: 1,
        createdAt: new Date('2024-01-15'),
    },
    {
        id: '2',
        clientId: 'client1',
        name: 'Smart Watch Pro',
        description: 'Advanced fitness tracking and notifications',
        price: 399.99,
        cost: 200.00,
        imageUrl: '/images/products/smartwatch.jpg',
        category: 'Electronics',
        stock: 32,
        isFeatured: true,
        featuredOrder: 2,
        createdAt: new Date('2024-01-20'),
    },
    {
        id: '3',
        clientId: 'client1',
        name: 'Laptop Stand Aluminum',
        description: 'Ergonomic laptop stand for better posture',
        price: 79.99,
        cost: 35.00,
        imageUrl: '/images/products/laptop-stand.jpg',
        category: 'Accessories',
        stock: 120,
        isFeatured: true,
        featuredOrder: 3,
        createdAt: new Date('2024-02-01'),
    },
    {
        id: '4',
        clientId: 'client1',
        name: 'Mechanical Keyboard RGB',
        description: 'Gaming keyboard with customizable RGB lighting',
        price: 149.99,
        cost: 75.00,
        imageUrl: '/images/products/keyboard.jpg',
        category: 'Electronics',
        stock: 67,
        isFeatured: true,
        featuredOrder: 4,
        createdAt: new Date('2024-02-10'),
    },
    {
        id: '5',
        clientId: 'client1',
        name: 'Wireless Mouse Ergonomic',
        description: 'Comfortable wireless mouse for all-day use',
        price: 49.99,
        cost: 22.00,
        imageUrl: '/images/products/mouse.jpg',
        category: 'Accessories',
        stock: 89,
        isFeatured: true,
        featuredOrder: 5,
        createdAt: new Date('2024-02-15'),
    },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
    {
        id: 'sup1',
        name: 'TechSupply Co.',
        contact: '+1-555-0101',
        email: 'contact@techsupply.com',
        location: 'San Francisco, CA',
        rating: 4.8,
        status: 'active',
        deliveryTimeEstimate: '2-3 days',
        commissionRate: 0.15,
        createdAt: new Date('2023-06-01'),
    },
    {
        id: 'sup2',
        name: 'Global Electronics Ltd.',
        contact: '+1-555-0202',
        email: 'sales@globalelec.com',
        location: 'New York, NY',
        rating: 4.6,
        status: 'active',
        deliveryTimeEstimate: '3-5 days',
        commissionRate: 0.12,
        createdAt: new Date('2023-07-15'),
    },
    {
        id: 'sup3',
        name: 'FastShip Distributors',
        contact: '+1-555-0303',
        email: 'info@fastship.com',
        location: 'Los Angeles, CA',
        rating: 4.9,
        status: 'active',
        deliveryTimeEstimate: '1-2 days',
        commissionRate: 0.18,
        createdAt: new Date('2023-08-20'),
    },
];

// Mock Orders
export const mockOrders: Order[] = [
    {
        id: 'ord1',
        clientId: 'client1',
        supplierId: 'sup1',
        customerId: 'cust1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        items: [
            {
                productId: '1',
                productName: 'Premium Wireless Headphones',
                quantity: 1,
                price: 299.99,
                cost: 150.00,
            },
        ],
        totalAmount: 299.99,
        shippingCost: 15.00,
        platformFee: 8.99,
        status: 'completed',
        paymentStatus: 'paid',
        deliveryStatus: 'delivered',
        createdAt: new Date('2026-01-20'),
        deliveredAt: new Date('2026-01-21'),
    },
    {
        id: 'ord2',
        clientId: 'client1',
        supplierId: 'sup2',
        customerId: 'cust2',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        items: [
            {
                productId: '2',
                productName: 'Smart Watch Pro',
                quantity: 1,
                price: 399.99,
                cost: 200.00,
            },
        ],
        totalAmount: 399.99,
        shippingCost: 15.00,
        platformFee: 11.99,
        status: 'completed',
        paymentStatus: 'pending',
        deliveryStatus: 'pending',
        createdAt: new Date('2026-01-21'),
        estimatedDelivery: new Date('2026-01-25'),
    },
    {
        id: 'ord3',
        clientId: 'client1',
        supplierId: 'sup3',
        customerId: 'cust3',
        customerName: 'Bob Johnson',
        customerEmail: 'bob@example.com',
        items: [
            {
                productId: '3',
                productName: 'Laptop Stand Aluminum',
                quantity: 2,
                price: 79.99,
                cost: 35.00,
            },
        ],
        totalAmount: 159.98,
        shippingCost: 10.00,
        platformFee: 4.79,
        status: 'completed',
        paymentStatus: 'paid',
        deliveryStatus: 'delivered',
        createdAt: new Date('2026-01-15'),
        deliveredAt: new Date('2026-01-18'),
    },
];

// Mock Reviews
export const mockReviews: Review[] = [
    {
        id: 'rev1',
        orderId: 'ord1',
        productId: '1',
        customerId: 'cust1',
        customerName: 'John Doe',
        rating: 5,
        comment: 'Excellent sound quality and comfortable to wear!',
        createdAt: new Date('2026-01-21'),
    },
    {
        id: 'rev2',
        orderId: 'ord3',
        productId: '3',
        customerId: 'cust3',
        customerName: 'Bob Johnson',
        rating: 4,
        comment: 'Great product, very sturdy and well-made.',
        createdAt: new Date('2026-01-19'),
    },
];

// Mock Sales Stats
export const mockSalesStats: SalesStats = {
    amountReceivables: 399.99,
    totalLifetimeSales: 125847.50,
    todaySales: 699.98,
    todayChange: 15.3,
    thisMonthSales: 18450.00,
    thisMonthChange: 8.7,
    lastMonthSales: 16950.00,
    netProfit: 52340.25,
    netProfitMargin: 41.6,
};

// Mock Chart Data
export const mockChartData: ChartDataPoint[] = [
    { date: '2026-01-15', sales: 2450, profit: 1020, orders: 12, aov: 204.17 },
    { date: '2026-01-16', sales: 3200, profit: 1330, orders: 15, aov: 213.33 },
    { date: '2026-01-17', sales: 2890, profit: 1200, orders: 14, aov: 206.43 },
    { date: '2026-01-18', sales: 4100, profit: 1705, orders: 18, aov: 227.78 },
    { date: '2026-01-19', sales: 3650, profit: 1520, orders: 16, aov: 228.13 },
    { date: '2026-01-20', sales: 4500, profit: 1870, orders: 20, aov: 225.00 },
    { date: '2026-01-21', sales: 5200, profit: 2160, orders: 22, aov: 236.36 },
];

// Mock Store Health Score
export const mockStoreHealthScore: StoreHealthScore = {
    id: 'health1',
    clientId: 'client1',
    score: 87.5,
    calculationDate: new Date('2026-01-21'),
    factorDetails: {
        orderFulfillmentRate: {
            value: 96.5,
            weightage: 25,
            contribution: 24.13,
            benchmark: 'excellent',
            trend: 'improving',
            tip: 'Maintain your excellent fulfillment rate!',
        },
        cancellationRate: {
            value: 3.2,
            weightage: 20,
            contribution: 17.36,
            benchmark: 'excellent',
            trend: 'stable',
            tip: 'Keep cancellation rate below 5%',
        },
        customerRatings: {
            value: 4.6,
            weightage: 20,
            contribution: 18.4,
            benchmark: 'excellent',
            trend: 'improving',
            tip: 'Excellent customer satisfaction!',
        },
        deliveryTimePerformance: {
            value: 88.0,
            weightage: 15,
            contribution: 13.2,
            benchmark: 'good',
            trend: 'stable',
            tip: 'Aim for 90%+ on-time deliveries',
        },
        inventoryManagement: {
            value: 92.0,
            weightage: 10,
            contribution: 9.2,
            benchmark: 'good',
            trend: 'improving',
            tip: 'Good stock availability',
        },
        returnRefundRate: {
            value: 4.5,
            weightage: 10,
            contribution: 5.21,
            benchmark: 'average',
            trend: 'declining',
            tip: 'Work on reducing returns to below 3%',
        },
    },
};

// Helper function to calculate net profit
export function calculateNetProfit(orders: Order[]): number {
    return orders.reduce((total, order) => {
        const productCosts = order.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
        const orderProfit = order.totalAmount - productCosts - order.shippingCost - order.platformFee;
        return total + orderProfit;
    }, 0);
}

// Helper function to calculate store health score
export function calculateStoreHealthScore(factorDetails: StoreHealthScore['factorDetails']): number {
    return Object.values(factorDetails).reduce((total, factor) => total + factor.contribution, 0);
}
