export function shouldSkipSaving(freePractice: boolean): boolean {
  return freePractice === true;
}

export function buildFreePracticeBannerText(): string {
  return '🎈 Modo Treino Livre: diverte-te sem guardar pontos!';
}

export function buildFreePracticeResultMessage(): string {
  return '📝 Como era treino livre, não guardámos pontos nem progresso.';
}

export function buildFreePracticeResultTitle(): string {
  return 'Treino Livre Concluído!';
}
