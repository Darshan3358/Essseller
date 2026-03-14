// User & Authentication Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'client';
    createdAt: Date;
}

export interface Client {
    id: string;
    userId: string;
    storeName: string;
    storeHealthScore: number;
    createdAt: Date;
}

// Product Types
export interface Product {
    id: string;
    clientId: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    imageUrl: string;
    category: string;
    stock: number;
    isFeatured: boolean;
    featuredOrder: number;
    featuredUntil?: Date;
    createdAt: Date;
}

// Order Types
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type DeliveryStatus = 'pending' | 'shipped' | 'delivered' | 'returned';

export interface Order {
    id: string;
    clientId: string;
    supplierId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    totalAmount: number;
    shippingCost: number;
    platformFee: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    deliveryStatus: DeliveryStatus;
    createdAt: Date;
    deliveredAt?: Date;
    estimatedDelivery?: Date;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    cost: number;
}

// Supplier Types
export interface Supplier {
    id: string;
    name: string;
    contact: string;
    email: string;
    location: string;
    rating: number;
    status: 'active' | 'inactive';
    deliveryTimeEstimate: string;
    commissionRate: number;
    createdAt: Date;
}

export interface ProductSupplier {
    productId: string;
    supplierId: string;
    isDefault: boolean;
    priority: number;
}

// Review Types
export interface Review {
    id: string;
    orderId: string;
    productId: string;
    customerId: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

// Store Health Types
export interface StoreHealthScore {
    id: string;
    clientId: string;
    score: number;
    calculationDate: Date;
    factorDetails: {
        orderFulfillmentRate: FactorScore;
        cancellationRate: FactorScore;
        customerRatings: FactorScore;
        deliveryTimePerformance: FactorScore;
        inventoryManagement: FactorScore;
        returnRefundRate: FactorScore;
    };
}

export interface FactorScore {
    value: number;
    weightage: number;
    contribution: number;
    benchmark: 'excellent' | 'good' | 'average' | 'poor';
    trend: 'improving' | 'stable' | 'declining';
    tip?: string;
}

export interface StoreHealthConfig {
    orderFulfillmentWeight: number;
    cancellationWeight: number;
    customerRatingsWeight: number;
    deliveryTimeWeight: number;
    inventoryWeight: number;
    returnRefundWeight: number;
}

// Dashboard Types
export interface SalesStats {
    amountReceivables: number;
    totalLifetimeSales: number;
    todaySales: number;
    todayChange: number;
    thisMonthSales: number;
    thisMonthChange: number;
    lastMonthSales: number;
    netProfit: number;
    netProfitMargin: number;
}

export interface ChartDataPoint {
    date: string;
    sales: number;
    profit: number;
    orders: number;
    aov: number;
}

export type TimeFilter = 'daily' | 'monthly' | 'yearly';
export type DateRange = '7days' | '30days' | '6months' | '12months' | 'ytd';
