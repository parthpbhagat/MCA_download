import { createFileRoute } from "@tanstack/react-router";
import { Search, FileText, Download, Check, X, CreditCard } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Printer } from "lucide-react";

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
    
    // Fetch settings for company info in invoice
    fetch("http://localhost:8000/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(e => console.error(e));
  }, []);

  const [settings, setSettings] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const downloadSample = (type: string, cin: string) => {
    const blob = new Blob([`Sample ${type} document for CIN: ${cin}`], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_${cin}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
                    <td className="px-4 py-4 border-r border-border">
                       <div className="flex justify-center">
                          {order.item?.includes("V2") ? (
                            <button 
                              onClick={() => downloadSample("V2", order.cin)}
                              className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[11px] font-bold hover:bg-blue-100 transition-colors"
                            >
                               Download V2
                            </button>
                          ) : (
                            <button 
                              onClick={() => downloadSample("V3", order.cin)}
                              className="px-4 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded text-[11px] font-bold hover:bg-purple-100 transition-colors"
                            >
                               Download V3
                            </button>
                          )}
                       </div>
                    </td>
                    <td className="px-4 py-4 border-r border-border text-center">
                       <button 
                         onClick={() => setSelectedInvoice(order)}
                         className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-all border border-slate-200 group"
                       >
                          <FileText className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-900" />
                          <span className="font-semibold text-[10px] uppercase tracking-wider">Invoice</span>
                       </button>
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
      
      {/* Invoice Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
         <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none shadow-2xl">
            {selectedInvoice && (
               <div className="flex flex-col">
                  {/* Invoice Header */}
                  <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
                     <div>
                        <h2 className="text-3xl font-bold tracking-tighter uppercase mb-1">Tax Invoice</h2>
                        <p className="text-slate-400 text-sm font-mono">{selectedInvoice.id || "INV-001"}</p>
                     </div>
                     <div className="text-right">
                        <div className="text-xl font-bold text-success mb-1 tracking-tight">{settings?.contactInfo?.name || "MCA DOWNLOAD"}</div>
                        <p className="text-[11px] text-slate-400 leading-tight whitespace-pre-line">
                           {settings?.contactInfo?.address || "Loading address..."}
                        </p>
                     </div>
                  </div>

                  <div className="p-10">
                     <div className="grid grid-cols-2 gap-10 mb-10">
                        <div>
                           <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</h3>
                           <div className="text-slate-800">
                              <p className="font-bold text-[15px]">{localStorage.getItem("profile_displayName") || "Customer"}</p>
                              <p className="text-[13px] text-slate-500 mt-1">{localStorage.getItem("profile_email") || "customer@example.com"}</p>
                              <p className="text-[13px] text-slate-500">{localStorage.getItem("profile_mobile") || ""}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Order Details</h3>
                           <div className="text-slate-800">
                              <p className="text-[13px]"><span className="text-slate-400">Date:</span> {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                              <p className="text-[13px]"><span className="text-slate-400">Status:</span> <span className="text-success font-bold">Paid</span></p>
                              <p className="text-[13px]"><span className="text-slate-400">Payment:</span> Razorpay</p>
                           </div>
                        </div>
                     </div>

                     {/* Table */}
                     <div className="border border-slate-100 rounded-lg overflow-hidden mb-8">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                 <th className="px-6 py-4">Description</th>
                                 <th className="px-6 py-4 text-center">Qty</th>
                                 <th className="px-6 py-4 text-right">Amount</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              <tr>
                                 <td className="px-6 py-5">
                                    <div className="font-bold text-slate-800">{selectedInvoice.item}</div>
                                    <div className="text-[12px] text-slate-500 mt-1">{selectedInvoice.companyName}</div>
                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedInvoice.cin}</div>
                                 </td>
                                 <td className="px-6 py-5 text-center text-slate-600">1</td>
                                 <td className="px-6 py-5 text-right font-medium text-slate-800">
                                    ₹{(selectedInvoice.amount / (1 + (settings?.billing?.gstPercent || 18) / 100)).toFixed(2)}
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     {/* Calculations */}
                     <div className="flex justify-end">
                        <div className="w-[280px] space-y-3">
                           <div className="flex justify-between text-[13px]">
                              <span className="text-slate-500">Sub Total</span>
                              <span className="text-slate-800 font-medium">₹{(selectedInvoice.amount / (1 + (settings?.billing?.gstPercent || 18) / 100)).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-[13px]">
                              <span className="text-slate-500">GST ({settings?.billing?.gstPercent || 18}%)</span>
                              <span className="text-slate-800 font-medium">₹{(selectedInvoice.amount - (selectedInvoice.amount / (1 + (settings?.billing?.gstPercent || 18) / 100))).toFixed(2)}</span>
                           </div>
                           <div className="pt-3 border-t border-slate-100 flex justify-between">
                              <span className="text-[15px] font-bold text-slate-900">Grand Total</span>
                              <span className="text-[18px] font-bold text-[#1d69d7]">₹{selectedInvoice.amount.toFixed(2)}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Footer Action */}
                  <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                     <p className="text-[11px] text-slate-400 italic">This is a computer generated document, no signature required.</p>
                     <Button 
                       onClick={() => window.print()}
                       variant="outline" 
                       size="sm" 
                       className="gap-2 bg-white text-slate-700 h-9"
                     >
                        <Printer className="w-4 h-4" /> Print Invoice
                     </Button>
                  </div>
               </div>
            )}
         </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}
