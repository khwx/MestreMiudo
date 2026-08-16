'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteStory } from '@/app/actions';

interface DeleteStoryDialogProps {
  storyId: string;
  storyTitle?: string;
  trigger?: React.ReactNode;
  onDeleted?: (id: string) => void;
}

export default function DeleteStoryDialog({
  storyId,
  storyTitle,
  trigger,
  onDeleted,
}: DeleteStoryDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteStory(storyId);
      if (result?.success) {
        toast({
          title: 'História eliminada',
          description: storyTitle
            ? `"${storyTitle}" foi eliminada com sucesso.`
            : 'A história foi eliminada com sucesso.',
          variant: 'default',
        });
        onDeleted?.(storyId);
        setOpen(false);
      } else {
        toast({
          title: 'Erro ao eliminar',
          description: result?.error || 'Não foi possível eliminar a história.',
          variant: 'destructive',
        });
        setOpen(false);
      }
    } catch (err) {
      console.error('Unexpected error deleting story:', err);
      toast({
        title: 'Erro inesperado',
        description: 'Não foi possível eliminar a história. Tenta novamente.',
        variant: 'destructive',
      });
      setOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultTrigger = (
    <button
      type="button"
      aria-label="Eliminar história"
      className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
      title="Eliminar esta história"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger ?? defaultTrigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar esta história?</AlertDialogTitle>
          <AlertDialogDescription>
            {storyTitle
              ? `Esta ação vai eliminar a história "${storyTitle}". Não é possível desfazer. Tens a certeza?`
              : 'Esta ação vai eliminar a história. Não é possível desfazer. Tens a certeza?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
          >
            {isDeleting ? 'A eliminar...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
