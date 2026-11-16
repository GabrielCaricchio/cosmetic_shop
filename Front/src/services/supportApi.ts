export const supportApi = {
  getWhatsAppUrl(params: { product_name?: string; order_id?: string } = {}): string {
    const searchParams = new URLSearchParams();
    if (params.product_name) searchParams.set('product_name', params.product_name);
    if (params.order_id) searchParams.set('order_id', params.order_id);
    const query = searchParams.toString();
    return `/api/whatsapp-redirect${query ? `?${query}` : ''}`;
  },

  openWhatsApp(params: { product_name?: string; order_id?: string } = {}) {
    window.open(this.getWhatsAppUrl(params), '_blank');
  },
};

export default supportApi;
