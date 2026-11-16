export interface SalesMetrics {
  daily_revenue: number;
  total_orders_today: number;
  conversion_rate: number;
  critical_stock_count: number;
  total_revenue?: number;
  total_orders?: number;
  average_ticket?: number;
}

export interface DailySalesChartPoint {
  date: string;
  amount: number;
  orders_count: number;
}

export interface StockReservationItem {
  order_id: string;
  product_id: number;
  quantity: number;
  ttl_remaining: number;
  key?: string;
  product_name?: string;
  reserved_quantity?: number;
  ttl_remaining_seconds?: number;
}

export interface UpdateOrderStatusPayload {
  status: string;
}
