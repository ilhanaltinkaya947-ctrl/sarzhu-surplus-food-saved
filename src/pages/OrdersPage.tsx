import { ShoppingBag, Clock, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";

export default function OrdersPage() {
  // Placeholder for orders - will be populated once auth is implemented
  const orders: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Orders" />
      
      <main className="pt-20 pb-24 px-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Start saving food and money by reserving a mystery bag from shops near you
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Orders will be listed here */}
          </div>
        )}
      </main>
    </div>
  );
}
