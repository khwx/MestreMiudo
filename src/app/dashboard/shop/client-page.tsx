"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, Star, Coins, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  getShopItems, 
  buyShopItem, 
  getUserInventory, 
  equipInventoryItem, 
  getStudentRewards 
} from '@/app/actions';
import { ShopItem, UserInventory } from '@/app/shared-schemas';

export default function ShopClientPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<UserInventory[]>([]);
  const [rewards, setRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        setItems(shopItems);
        setInventory(userInv);
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
    try {
      const result = await buyShopItem(name!, item.id!);
      if (result.success) {
        toast({
          title: "Compra realizada!",
          description: `Parabéns! Agora tens o(a) ${item.name}.`,
        });
        // Refresh inventory and rewards
        const updatedInv = await getUserInventory(name!);
        const updatedRewards = await getStudentRewards(name!);
        setInventory(updatedInv);
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

  const handleEquip = async (itemId: string) => {
    try {
      const result = await equipInventoryItem(name!, itemId);
      if (result.success) {
        toast({
          title: "Equipado!",
          description: "O item foi equipado com sucesso.",
        });
        const updatedInv = await getUserInventory(name!);
        setInventory(updatedInv);
      } else {
        toast({
          title: "Erro ao equipar",
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">Loja do MestreMiúdo</h1>
          <p className="text-muted-foreground">Gasta as tuas moedas em itens fantásticos!</p>
        </div>
        <div className="flex items-center gap-3 bg-card border p-3 rounded-full shadow-sm">
          <Coins className="h-6 w-6 text-yellow-500" />
          <span className="text-xl font-bold">{rewards?.total_points || 0} Moedas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shop Items */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" /> Itens Disponíveis
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.length === 0 ? (
              <p className="text-muted-foreground">Nenhum item disponível no momento.</p>
            ) : (
              items.map(item => {
                const isOwned = inventory.some(inv => inv.item_id === item.id);
                return (
                  <Card key={item.id} className={cn("overflow-hidden transition-all hover:shadow-md", isOwned && "border-green-500 bg-green-50/30")}>
                    <div className="aspect-square bg-muted relative">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground italic">
                          Sem Imagem
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <CardDescription className="text-xs">{item.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-yellow-600">
                          <Coins className="h-4 w-4" />
                          {item.price}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Button 
                        className="w-full" 
                        variant={isOwned ? "outline" : "default"}
                        onClick={() => isOwned ? null : handleBuy(item)}
                        disabled={isOwned}
                      >
                        {isOwned ? (
                          <><CheckCircle2 className="mr-2 h-4 w-4" /> Já tens!</>
                        ) : (
                          'Comprar'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* User Inventory */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" /> O Teu Inventário
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {inventory.length === 0 ? (
              <p className="text-muted-foreground">Ainda não tens itens. Compra alguns na loja!</p>
            ) : (
              inventory.map(inv => (
                <Card key={inv.id} className={cn("p-4 flex items-center justify-between transition-all", inv.equipped && "border-primary bg-primary/10")}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                      {inv.shop_items?.image_url ? (
                        <img src={inv.shop_items.image_url} alt={inv.shop_items.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-xs italic">?</div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{inv.shop_items?.name}</p>
                      <p className="text-xs text-muted-foreground">{inv.shop_items?.item_type}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={inv.equipped ? "default" : "outline"}
                    onClick={() => handleEquip(inv.item_id)}
                  >
                    {inv.equipped ? 'Equipado' : 'Equipar'}
                  </Button>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}