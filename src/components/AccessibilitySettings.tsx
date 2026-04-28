"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accessibility, Keyboard, Volume2, Eye } from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';

export function AccessibilitySettings() {
  const [open, setOpen] = useState(false);
  const { settings, setSettings } = useAccessibility();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full"
          aria-label="Definições de acessibilidade"
        >
          <Accessibility className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Acessibilidade
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Keyboard className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="keyboard-nav" className="font-medium">Navegação por teclado</Label>
                <p className="text-sm text-muted-foreground">Destaque ao usar Tab</p>
              </div>
            </div>
            <Switch
              id="keyboard-nav"
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, keyboardNavigation: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="reduced-motion" className="font-medium">Reduzir movimento</Label>
                <p className="text-sm text-muted-foreground">Desativa animações</p>
              </div>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, reducedMotion: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="high-contrast" className="font-medium">Alto contraste</Label>
                <p className="text-sm text-muted-foreground">Maior legibilidade</p>
              </div>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, highContrast: checked }))}
            />
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2"> Atalhos de teclado</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd> - Navegar entre elementos</li>
              <li><kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> - Selecionar/Ativar</li>
              <li><kbd className="px-2 py-1 bg-muted rounded text-xs">Escape</kbd> - Fechar diálogos</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}