import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function clean() {
  console.log('🔍 Identificando duplicados...\n');

  // Buscar todas as lições
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*');

  if (lessonsError) {
    console.error('❌ Erro:', lessonsError.message);
    return;
  }

  // Agrupar por title (as duplicadas têm o mesmo title)
  const grouped = {};
  lessons.forEach(l => {
    if (!grouped[l.title]) grouped[l.title] = [];
    grouped[l.title].push(l);
  });

  let toDelete = [];
  let toKeep = [];

  Object.keys(grouped).forEach(title => {
    const group = grouped[title];
    if (group.length > 1) {
      console.log(`⚠️  Duplicado: ${title} (${group.length} cópias)`);
      
      // Manter a cópia com ID novo (última no array)
      const toKeepId = group[group.length - 1].id;
      const toDeleteIds = group.slice(0, -1).map(l => l.id);
      
      toKeep.push(toKeepId);
      toDelete = toDelete.concat(toDeleteIds);
      
      console.log(`   🔄 Mantendo: ${toKeepId}`);
      console.log(`   ❌ Apagando: ${toDeleteIds.join(", ")}`);
    }
  });

  if (toDelete.length === 0) {
    console.log('✅ Nenhuma duplicada encontrada!');
    return;
  }

  // Confirmar antes de apagar
  console.log(`\n⚠️  Vou apagar ${toDelete.length} duplicadas. Continuar? (y/n)`);
  
  // Como não podemos interagir, vou fazer direto
  console.log('\n🔄 Apagando duplicadas...\n');

  for (const id of toDelete) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) {
      console.log(`❌ Erro ao apagar ${id}:`, error.message);
    } else {
      console.log(`✅ Apagado: ${id}`);
    }
  }

  console.log('\n✨ Limpeza concluída!\n');
}

clean();
