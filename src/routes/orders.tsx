import { createFileRoute } from "@tanstack/react-router";
import { Search, FileText, Download, Check, X, CreditCard } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "List Of Transactions — MCA Download" },
      { name: "description", content: "View and manage your MCA document download transactions." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Load fresh orders created by the user from localStorage
    const savedOrders = JSON.parse(localStorage.getItem("my_orders") || "[]");
    setOrders(savedOrders);
  }, []);

  const filteredOrders = orders.filter(order => 
    (order.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.cin || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-8 px-4 overflow-x-hidden">
        <div className="container mx-auto max-w-[1600px]">
          <h1 className="text-xl font-medium text-muted-foreground mb-4">List Of Transactions</h1>
          
          <div className="mb-6 relative">
             <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search here" 
                className="w-full max-w-sm h-10 border-border bg-card pr-10"
             />
             <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="overflow-x-auto rounded-md border border-border shadow-sm bg-card">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/10">
                  <th className="px-4 py-3 border-r border-border">CIN :</th>
                  <th className="px-4 py-3 border-r border-border">Company :</th>
                  <th className="px-4 py-3 border-r border-border">Order Status :</th>
                  <th className="px-4 py-3 border-r border-border">Payment Status :</th>
                  <th className="px-4 py-3 border-r border-border">V2 / V3 Link :</th>
                  <th className="px-4 py-3 border-r border-border">Invoice No :</th>
                  <th className="px-4 py-3 border-r border-border">Description :</th>
                  <th className="px-4 py-3 border-r border-border">Order Date :</th>
                  <th className="px-4 py-3 border-r border-border">Amount :</th>
                  <th className="px-4 py-3 border-r border-border">From Date :</th>
                  <th className="px-4 py-3">To Date :</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[12px]">
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-muted-foreground">
                      No orders found.
                    </td>
                  </tr>
                )}
                {filteredOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-secondary/5 transition-colors">
                    <td className="px-4 py-4 border-r border-border whitespace-nowrap">
                       <a href="#" className="text-[#1d69d7] hover:underline font-medium">{order.cin}</a>
                    </td>
                    <td className="px-4 py-4 border-r border-border">
                       <a href="#" className="text-[#1d69d7] hover:underline font-medium uppercase">{order.companyName}</a>
                    </td>
                    <td className="px-4 py-4 border-r border-border text-center">
                       <div className="flex justify-center"><Check className="h-4 w-4 text-success" /></div>
                    </td>
                    <td className="px-4 py-4 border-r border-border text-center">
                       <div className="flex justify-center"><Check className="h-4 w-4 text-success" /></div>
                    </td>
                    <td className="px-4 py-4 border-r border-border text-center">
                       <div className="flex justify-center">
                          <div className="p-1 bg-gradient-to-br from-pink-500 to-indigo-600 rounded">
                             <Download className="h-3 w-3 text-white" />
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-4 border-r border-border text-center">
                       <div className="flex justify-center">
                          <div className="relative">
                             <FileText className="h-5 w-5 text-muted-foreground" />
                             <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full border border-white">
                                <Check className="h-2 w-2 text-white" />
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-4 border-r border-border whitespace-nowrap text-muted-foreground">
                       {order.item}
                    </td>
                    <td className="px-4 py-4 border-r border-border whitespace-nowrap text-muted-foreground">
                       {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 border-r border-border whitespace-nowrap font-medium">
                       ₹{order.amount}.00
                    </td>
                    <td className="px-4 py-4 border-r border-border whitespace-nowrap text-muted-foreground">
                       {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                       {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
