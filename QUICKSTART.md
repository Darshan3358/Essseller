# EssSmartSeller - Quick Start Guide

## Dashboard Overview (Hindi/English)

### मुख्य मेट्रिक्स / Main Metrics

#### 1. Amount Receivables (राशि प्राप्य)
- **क्या है**: जो sales हो गई हैं लेकिन delivery नहीं हुई है
- **What it is**: Sales that are completed but not yet delivered
- **Current Value**: $399.99
- **Purpose**: Track pending payments from non-delivered orders

#### 2. Total Lifetime Sales (कुल जीवनकाल बिक्री)
- **क्या है**: शुरुआत से अब तक की कुल बिक्री
- **What it is**: All-time total sales since inception
- **Current Value**: $125,847.50
- **Purpose**: Track overall business performance

#### 3. Today's Sales (आज की बिक्री)
- **क्या है**: आज की कुल बिक्री
- **What it is**: Current day's total sales
- **Current Value**: $699.98 (+15.3%)
- **Purpose**: Monitor daily performance with percentage change

#### 4. This Month Sales (इस महीने की बिक्री)
- **क्या है**: चालू महीने की कुल बिक्री
- **What it is**: Current month's total sales
- **Current Value**: $18,450.00 (+8.7%)
- **Purpose**: Track monthly performance trends

#### 5. Last Month Sales (पिछले महीने की बिक्री)
- **क्या है**: पिछले महीने की कुल बिक्री
- **What it is**: Previous month's total sales
- **Current Value**: $16,950.00
- **Purpose**: Compare with current month

#### 6. Net Profit (शुद्ध लाभ)
- **क्या है**: कुल बिक्री - खर्च = शुद्ध लाभ
- **What it is**: Total Revenue - Costs = Net Profit
- **Current Value**: $52,340.25 (41.6% margin)
- **Calculation**: 
  ```
  Net Profit = Total Sales - Product Costs - Shipping - Platform Fees
  Profit Margin = (Net Profit / Total Sales) × 100
  ```

### Sales Statistics Diagram (बिक्री आंकड़े चित्र)

**Features:**
- **Chart Types**: Line Chart / Bar Chart
- **Metrics Available**:
  - Gross Sales (कुल बिक्री)
  - Net Profit (शुद्ध लाभ)
  - Order Volume (ऑर्डर की संख्या)
  - Average Order Value (औसत ऑर्डर मूल्य)
- **Time Filters**:
  - Last 7 Days
  - Last 30 Days
  - Last 6 Months
  - Last 12 Months

**How to Use:**
1. Click on metric buttons to show/hide data
2. Switch between Line and Bar chart
3. Select date range from filters
4. Hover over chart for detailed values

## Page Navigation

### 1. Dashboard (/)
- Main overview page
- All key metrics
- Sales chart
- Featured products
- Store health score

### 2. Suppliers (/suppliers)
- Manage supplier network
- View supplier ratings
- Track delivery times
- Manage commissions

### 3. Reports (/reports)
- Advanced filtering
- Order history
- Export capabilities
- Year-over-year comparison

## Key Features

### Real-Time Updates
- Dashboard refreshes every 30 seconds
- Live sales tracking
- Automatic calculations

### Interactive Charts
- Multiple visualization options
- Customizable metrics
- Date range filtering
- Responsive design

### Store Health Monitoring
- Overall score (0-100)
- 6 performance factors
- Improvement recommendations
- Trend tracking

## Understanding Calculations

### Net Profit Formula
```
Net Profit = Σ(Order Total - Product Cost - Shipping - Platform Fee)
```

### Profit Margin Formula
```
Profit Margin = (Net Profit / Total Sales) × 100
```

### Store Health Score
```
Total Score = Σ(Factor Value × Factor Weight)

Factors:
- Order Fulfillment Rate: 25%
- Cancellation Rate: 20%
- Customer Ratings: 20%
- Delivery Time: 15%
- Inventory Management: 10%
- Return/Refund Rate: 10%
```

## Color Coding

- **Green**: Positive metrics, success
- **Blue/Indigo**: Primary actions, neutral
- **Orange**: Warnings, attention needed
- **Red**: Critical issues, errors
- **Yellow**: Featured items, highlights

## Tips for Best Results

1. **Monitor Daily**: Check Today's Sales regularly
2. **Track Trends**: Use the sales chart for patterns
3. **Improve Health**: Focus on low-scoring factors
4. **Manage Suppliers**: Keep high-rated suppliers active
5. **Review Reports**: Use filters for detailed analysis

## Common Questions

**Q: What is Amount Receivables?**
A: Money you will receive from orders that are sold but not yet delivered.

**Q: How is Net Profit calculated?**
A: Total Sales minus all costs (product cost, shipping, platform fees).

**Q: What does the percentage mean in Today's Sales?**
A: It shows the increase or decrease compared to yesterday.

**Q: How often does data update?**
A: Dashboard metrics update every 30 seconds automatically.

**Q: Can I export reports?**
A: Yes, go to Reports page and use Export CSV/PDF buttons.

## Need Help?

- Check the main README.md for detailed documentation
- Review the implementation plan in .agent/workflows/
- Contact support for technical issues

---

**Happy Selling! 🚀**
