"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, Star, Coins, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { 
  getShopItems, 
  buyShopItem, 
  getUserInventory, 
  getStudentRewards 
} from '@/app/actions';
import type { ShopItem, UserInventory } from '@/app/shared-schemas';

export default function ShopClientPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const grade = searchParams.get('grade');
  const router = useRouter();
  const { toast } = useToast();

  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<UserInventory[]>([]);
  const [rewards, setRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShop() {
      if (!name) return;
      setLoading(true);
      try {
        const [shopItems, userInv, studentRewards] = await Promise.all([
          getShopItems(),
          getUserInventory(name),
          getStudentRewards(name)
        ]);
        setItems(shopItems || []);
        setInventory(userInv || []);
        setRewards(studentRewards);
      } catch (error) {
        toast({
          title: "Erro ao carregar loja",
          description: "Ocorreu um erro ao carregar os itens da loja.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, [name, toast]);

  const handleBuy = async (item: ShopItem) => {
    if (!name || !rewards || rewards.total_points < item.price) {
      toast({
        title: "Moedas insuficientes! 💰",
        description: `Precisas de mais ${item.price - (rewards?.total_points || 0)} moedas.`,
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await buyShopItem(name, item.id!);
      if (result.success) {
        toast({
          title: "Compra realizada! 🎉",
          description: `Parabéns! Agora tens o(a) ${item.name}.`,
        });
        // Refresh
        const [updatedInv, updatedRewards] = await Promise.all([
          getUserInventory(name),
          getStudentRewards(name)
        ]);
        setInventory(updatedInv || []);
        setRewards(updatedRewards);
      } else {
        toast({
          title: "Não foi possível comprar",
          description: result.error || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const isOwned = (itemId: string) => {
    return inventory.some(inv => inv.item_id === itemId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <div className="text-6xl animate-bounce">🛍️</div>
        <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
          Loja Mágica
        </h2>
        <div className="flex items-center justify-center gap-2 bg-yellow-100 dark:bg-yellow-900/40 px-6 py-3 rounded-full inline-block">
          <Coins className="h-8 w-8 text-yellow-600" />
          <span className="text-3xl font-black text-yellow-700">
            {rewards?.total_points || 0}
          </span>
          <span className="text-yellow-600 font-bold">moedas</span>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="card-kid border-4 border-yellow-300 bg-white dark:bg-gray-800 shadow-2xl max-w-2xl mx-auto">
          <div className="p-8 text-center">
            <p className="text-xl text-gray-500">Nenhum item disponível ainda. Volta em breve! 🚀</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const owned = isOwned(item.id!);
            return (
              <div 
                key={item.id} 
                className={`card-kid bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ${
                  owned ? 'border-green-300' : 'border-yellow-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-4xl">{item.icon || '🎁'}</span>
                      <div>
                        <h3 className="text-xl font-black text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    {owned && (
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className={`text-xl font-black ${
                        (rewards?.total_points || 0) >= item.price ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {item.price}
                      </span>
                    </div>

                    {owned ? (
                      <div className="bg-green-50 px-4 py-2 rounded-full">
                        <span className="text-green-700 font-bold">✅ Já tens!</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleBuy(item)}
                        className="btn-kid bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold"
                        disabled={(rewards?.total_points || 0) < item.price}
                      >
                        Comprar! 🛒
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Back Button */}
      <div className="text-center pt-6">
        <Button 
          onClick={() => router.push(`/dashboard?name=${name}&grade=${grade}`)}
          size="lg"
          className="btn-kid bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl"
        >
          ← Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}
