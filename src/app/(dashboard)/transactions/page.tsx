
'use client';

import { useRouter } from 'next/navigation';
import { getTransactions, Transaction } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const transactionTypeMap: { [key in Transaction['type']]: { text: string; sign: string } } = {
  deposit: { text: 'واریز', sign: '+' },
  withdrawal: { text: 'برداشت', sign: '-' },
  payment: { text: 'پرداخت', sign: '-' },
  refund: { text: 'بازگشت وجه', sign: '+' },
};

const statusMap: { [key in Transaction['status']]: { text: string; variant: 'default' | 'secondary' | 'destructive' } } = {
  completed: { text: 'موفق', variant: 'secondary' },
  pending: { text: 'در انتظار', variant: 'default' },
  failed: { text: 'ناموفق', variant: 'destructive' },
};

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);


  const getAmountClass = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return 'text-green-600 dark:text-green-400';
      case 'withdrawal':
      case 'payment':
        return 'text-red-600 dark:text-red-400';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-muted">
          <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold">تاریخچه تراکنش‌ها</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تراکنش‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>نوع تراکنش</TableHead>
                  <TableHead>شرح</TableHead>
                  <TableHead className="text-left">مبلغ (تومان)</TableHead>
                  <TableHead className="text-center">وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.date}</TableCell>
                      <TableCell>{transactionTypeMap[tx.type].text}</TableCell>
                      <TableCell className="text-muted-foreground">{tx.description}</TableCell>
                      <TableCell className={`text-left font-semibold ${getAmountClass(tx.type)}`}>
                        {transactionTypeMap[tx.type].sign} {Math.abs(tx.amount).toLocaleString('fa-IR')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusMap[tx.status].variant}>
                          {statusMap[tx.status].text}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            تراکنشی یافت نشد.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        <div className="text-left">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="ml-2 h-4 w-4" />
                بازگشت به پروفایل
            </Button>
      </div>
    </div>
  );
}
