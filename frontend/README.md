# EssSmartSeller - Smart E-Commerce Management Platform

A comprehensive, modern e-commerce management system built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### 📊 Dashboard & Analytics
- **Amount Receivables**: Track pending payments from non-delivered orders
- **Total Lifetime Sales**: Complete sales history tracking
- **Today's Sales**: Real-time daily sales monitoring with percentage change
- **This Month Sales**: Current month performance with trends
- **Last Month Sales**: Previous month comparison
- **Net Profit Calculation**: Automatic profit calculation with margin percentage
- **Interactive Sales Chart**: 
  - Multiple chart types (Line & Bar)
  - Multiple metrics (Sales, Profit, Orders, AOV)
  - Date range filters (7 days, 30 days, 6 months, 12 months)
  - Real-time data visualization with Recharts

### 🏪 Supplier Management
- Complete supplier CRUD operations
- Supplier rating system (5-star)
- Delivery time tracking
- Location-based supplier organization
- Commission rate management
- Active/Inactive status tracking
- Supplier performance metrics

### 📦 Featured Products
- Dynamic product carousel with Swiper.js
- Auto-play functionality
- Responsive design (1-4 products per view)
- Featured product scheduling
- Product rating display
- Stock management
- Discount badges
- Category organization

### 💚 Store Health Monitoring (3C Score)
- **Overall Health Score**: 0-100 rating with letter grades (A+ to D)
- **6 Performance Factors**:
  1. Order Fulfillment Rate (25% weight)
  2. Cancellation Rate (20% weight)
  3. Customer Ratings (20% weight)
  4. Delivery Time Performance (15% weight)
  5. Inventory Management (10% weight)
  6. Return/Refund Rate (10% weight)
- Visual progress indicators
- Trend tracking (improving/stable/declining)
- Actionable improvement tips
- Benchmark comparisons (excellent/good/average/poor)

### 📈 Advanced Reporting
- Date range filtering
- Category-based filtering
- Status-based filtering
- Order history table
- Export to CSV/PDF (ready for implementation)
- Year-over-year comparison
- Revenue analytics
- Average order value tracking

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15.1.4 (App Router)
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **Charts**: Recharts 2.15.0
- **Carousel**: Swiper.js 11.1.15
- **Icons**: Lucide React 0.469.0
- **Date Handling**: date-fns 4.1.0
- **Build Tool**: Turbopack (Next.js)

## 📁 Project Structure

```
essmartseller/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Dashboard homepage
│   ├── globals.css              # Global styles & Tailwind
│   ├── suppliers/               # Supplier management page
│   │   └── page.tsx
│   └── reports/                 # Sales reports page
│       └── page.tsx
├── components/                   # React components
│   ├── dashboard/
│   │   ├── MetricCard.tsx       # Reusable metric cards
│   │   └── SalesChart.tsx       # Interactive sales chart
│   ├── products/
│   │   └── FeaturedProductsCarousel.tsx
│   ├── suppliers/
│   │   └── SupplierSelection.tsx
│   ├── health/
│   │   └── StoreHealthDashboard.tsx
│   └── layout/
│       └── Navigation.tsx       # Main navigation
├── lib/
│   └── mockData.ts              # Mock data for development
├── types/
│   └── index.ts                 # TypeScript type definitions
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies

```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd essmartseller
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎨 Design System

### Color Palette

- **Primary**: Indigo (#4F46E5) - Main brand color
- **Success**: Green (#10B981) - Positive actions & metrics
- **Warning**: Orange (#F59E0B) - Alerts & attention
- **Danger**: Red (#EF4444) - Errors & critical items
- **Neutral**: Gray scale - Text & backgrounds

### Typography

- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, large sizes (2xl - 4xl)
- **Body**: Regular, readable sizes (sm - base)

### Components

- **Glass Cards**: Glassmorphism effects with backdrop blur
- **Premium Cards**: Elevated cards with hover effects
- **Gradient Text**: Multi-color gradient headings
- **Metric Cards**: Animated cards with icons
- **Badges**: Status indicators with color coding
- **Buttons**: Primary, Secondary, Success, Danger variants

### Animations

- Fade In: 0.5s ease-in-out
- Slide Up: 0.5s ease-out
- Scale In: 0.3s ease-out
- Pulse Slow: 3s infinite
- Hover Transforms: Scale & translate effects

## 📊 Dashboard Metrics Explained

### Amount Receivables
Shows the total amount from orders that have been placed but not yet delivered. This represents pending revenue that will be received upon successful delivery.

### Total Lifetime Sales
Cumulative revenue from all completed orders since the store's inception. This is your all-time gross sales figure.

### Today's Sales
Current day's revenue with percentage change compared to the previous day. Updates in real-time.

### This Month Sales
Current month's total revenue with percentage change compared to the previous month.

### Last Month Sales
Previous month's total revenue for comparison purposes.

### Net Profit
Calculated as: `Total Revenue - Product Costs - Shipping Costs - Platform Fees`
Includes profit margin percentage for quick assessment.

## 🔄 Real-Time Features

- Dashboard metrics update every 30 seconds
- Live sales tracking
- Automatic chart data refresh
- Dynamic health score calculation

## 🎯 Future Enhancements

### Planned Features
- [ ] Database integration (PostgreSQL + Prisma)
- [ ] User authentication (NextAuth.js)
- [ ] Real API endpoints
- [ ] Email notifications
- [ ] Advanced filtering & search
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] AI-powered insights
- [ ] Inventory forecasting
- [ ] Customer relationship management (CRM)

### Backend Integration
- [ ] REST API implementation
- [ ] GraphQL support
- [ ] Redis caching
- [ ] WebSocket for real-time updates
- [ ] Payment gateway integration
- [ ] Shipping API integration

## 🔐 Security Considerations

When moving to production:
- Implement proper authentication & authorization
- Add CSRF protection
- Enable rate limiting
- Sanitize all user inputs
- Use environment variables for sensitive data
- Implement proper error handling
- Add API request validation
- Enable HTTPS only

## 📱 Responsive Design

The application is fully responsive across all devices:
- **Mobile**: 320px - 767px (1 column layout)
- **Tablet**: 768px - 1023px (2 column layout)
- **Desktop**: 1024px+ (3-4 column layout)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**EssSmartSeller Team**

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Tailwind CSS for the utility-first CSS framework
- Recharts for beautiful chart components
- Swiper.js for the carousel functionality
- Lucide for the icon library

## 📞 Support

For support, email support@essmartseller.com or open an issue in the repository.

---

**Built with ❤️ for smart e-commerce management**
