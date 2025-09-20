
'use client';

import { ArrowRight, Package } from "lucide-react";
import { ShipmentCard } from "./shipment-card";
import { Shipment } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShipmentListPageProps {
    title: string;
    description: string;
    shipments: Shipment[];
    role: 'shipper' | 'driver';
    navigate: (path: string) => void;
}

const statusFilters: { value: Shipment['status'] | 'all', label: string }[] = [
    { value: 'all', label: 'همه' },
    { value: 'pending', label: 'در انتظار' },
    { value: 'in_transit', label: 'در حال حمل' },
    { value: 'delivered', label: 'تحویل شده' },
];


export function ShipmentListPage({ title, description, shipments, role, navigate }: ShipmentListPageProps) {
    const [activeTab, setActiveTab] = useState<'all' | Shipment['status']>('all');

    const filteredShipments = activeTab === 'all'
        ? shipments
        : shipments.filter(s => s.status === activeTab);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="p-2 rounded-md hover:bg-accent">
                    <ArrowRight className="h-5 w-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                <div className="flex justify-center">
                    <TabsList>
                        {statusFilters.map(filter => (
                            // For shipper, we don't show accepted, it's covered by in_transit
                            (role === 'shipper' && filter.value === 'accepted') ? null :
                            <TabsTrigger key={filter.value} value={filter.value}>{filter.label}</TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                
                <TabsContent value={activeTab} className="mt-6">
                     {filteredShipments.length > 0 ? (
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
