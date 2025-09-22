
'use client';

import { ArrowLeft, Package } from "lucide-react";
import { ShipmentCard } from "./shipment-card";
import { Shipment } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

interface ShipmentListPageProps {
    title: string;
    description: string;
    shipments: Shipment[];
    isLoading: boolean;
    role: 'shipper' | 'driver';
    navigate: (path: string) => void;
}

const statusFilters: { value: Shipment['status'] | 'all', label: string }[] = [
    { value: 'all', label: 'همه' },
    { value: 'pending', label: 'در انتظار' },
    { value: 'in_transit', label: 'در حال حمل' },
    { value: 'delivered', label: 'تحویل شده' },
];


export function ShipmentListPage({ title, description, shipments, isLoading, role, navigate }: ShipmentListPageProps) {
    const [activeTab, setActiveTab] = useState<'all' | Shipment['status']>('all');
    
    const filteredShipments = activeTab === 'all'
        ? shipments
        : shipments.filter(s => s.status === activeTab);
        
    const handleTabChange = (value: string) => {
        setActiveTab(value as any);
    }

    return (
        <div className="space-y-6">
             <div className="relative flex items-center justify-between p-6 rounded-2xl overflow-hidden bg-card border shadow-sm">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent"></div>
                 <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-2 text-muted-foreground max-w-prose">{description}</p>
                 </div>
                 <button onClick={() => navigate('/dashboard')} className="relative z-10 p-2 rounded-full bg-background/50 hover:bg-background transition-colors">
                    <ArrowLeft className="h-6 w-6" />
                </button>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex justify-center">
                    <TabsList>
                        {statusFilters.map(filter => (
                            // For shipper, we don't show accepted, it's covered by in_transit
                            (role === 'shipper' && filter.value === 'accepted') ? null :
                            <TabsTrigger key={filter.value} value={filter.value}>{filter.label}</TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                
                <TabsContent value={activeTab} className="mt-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                     {isLoading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} className="h-64 w-full" />
                            ))}
                        </div>
                     ) : filteredShipments.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredShipments.map((shipment, index) => (
                                <div key={shipment.id} className="animate-in fade-in-0 slide-in-from-top-12 duration-500" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
                                    <ShipmentCard shipment={shipment} role={role} navigate={navigate} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg animate-in fade-in duration-500">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">هیچ درخواستی یافت نشد</h3>
                            <p className="mt-2 text-sm text-muted-foreground">در حال حاضر درخواستی با این وضعیت برای نمایش وجود ندارد.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
