'use client';

import { useState } from 'react';
import { Supplier } from '@/types';
import { Check, Clock, Star, MapPin, TrendingUp } from 'lucide-react';

interface SupplierSelectionProps {
    suppliers: Supplier[];
    productId: string;
    onSelect: (supplierId: string) => void;
    selectedSupplierId?: string;
}

export default function SupplierSelection({
    suppliers,
    onSelect,
    selectedSupplierId
}: SupplierSelectionProps) {
    const [selected, setSelected] = useState<string | undefined>(selectedSupplierId);

    const handleSelect = (supplierId: string) => {
        setSelected(supplierId);
        onSelect(supplierId);
    };

    // Sort suppliers by rating (default priority)
    const sortedSuppliers = [...suppliers].sort((a, b) => b.rating - a.rating);

    return (
        <div className="space-y-4">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Your Preferred Supplier</h3>
                <p className="text-sm text-gray-600">
                    Select a supplier for this product. Each supplier has different delivery times and ratings.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedSuppliers.map((supplier) => (
                    <SupplierCard
                        key={supplier.id}
                        supplier={supplier}
                        isSelected={selected === supplier.id}
                        onSelect={() => handleSelect(supplier.id)}
                    />
                ))}
            </div>

            {!selected && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> If you don&apos;t select a supplier, we&apos;ll automatically assign the best-rated supplier for you.
                    </p>
                </div>
            )}
        </div>
    );
}

interface SupplierCardProps {
    supplier: Supplier;
    isSelected: boolean;
    onSelect: () => void;
}

function SupplierCard({ supplier, isSelected, onSelect }: SupplierCardProps) {
    const getBadge = () => {
        if (supplier.rating >= 4.8) return { text: 'Fastest Delivery', color: 'success' };
        if (supplier.rating >= 4.5) return { text: 'Best Price', color: 'primary' };
        return { text: 'Reliable', color: 'warning' };
    };

    const badge = getBadge();

    return (
        <button
            onClick={onSelect}
            className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left w-full ${isSelected
                ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
        >
            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                </div>
            )}

            {/* Badge */}
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${badge.color === 'success' ? 'bg-success-100 text-success-700' :
                badge.color === 'primary' ? 'bg-primary-100 text-primary-700' :
                    'bg-warning-100 text-warning-700'
                }`}>
                <TrendingUp className="w-3 h-3" />
                {badge.text}
            </div>

            {/* Supplier Name */}
            <h4 className={`text-lg font-bold mb-3 ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                {supplier.name}
            </h4>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{supplier.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-gray-500">Rating</span>
            </div>

            {/* Delivery Time */}
            <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                    <strong>{supplier.deliveryTimeEstimate}</strong> delivery
                </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{supplier.location}</span>
            </div>

            {/* Commission Info (for admin view) */}
            {/* <div className="mt-3 pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Commission: {(supplier.commissionRate * 100).toFixed(0)}%
        </span>
      </div> */}
        </button>
    );
}
