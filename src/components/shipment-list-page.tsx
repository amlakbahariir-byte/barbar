
'use client';

import { ArrowRight, Package } from "lucide-react";
import { ShipmentCard } from "./shipment-card";
import { Shipment } from "@/lib/data";

interface ShipmentListPageProps {
    title: string;
    description: string;
    shipments: Shipment[];
    role: 'shipper' | 'driver';
    navigate: (path: string) => void;
}

export function ShipmentListPage({ title, description, shipments, role, navigate }: ShipmentListPageProps) {
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

            {shipments.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {shipments.map((shipment, index) => (
                        <div key={shipment.id} className="animate-in fade-in-0 slide-in-from-top-12 duration-500" style={{ animationDelay: `${index * 100 + 200}ms`, animationFillMode: 'backwards' }}>
                            <ShipmentCard shipment={shipment} role={role} navigate={navigate} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">هیچ درخواستی یافت نشد</h3>
                    <p className="mt-2 text-sm text-muted-foreground">در حال حاضر درخواستی برای نمایش در این بخش وجود ندارد.</p>
                </div>
            )}
        </div>
    );
}
