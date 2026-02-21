import { Search, Radio, Flame, Rocket, TrendingDown, Skull, Dna, Archive, BarChart2 } from "lucide-react";

const LIFECYCLE_ITEMS = [
  { status: "RADAR", icon: <Radio className="h-5 w-5 text-blue-400" />, title: "Radar", desc: "Oferta recem-descoberta. Ainda nao foi analisada em detalhe. E o ponto de entrada — tudo que voce encontra espionando comeca aqui." },
  { status: "ANALYZING", icon: <Search className="h-5 w-5 text-yellow-400" />, title: "Analyzing", desc: "Voce esta investigando ativamente: analisando funil, criativos, trafego e viabilidade. A oferta esta sob avaliacao." },
  { status: "HOT", icon: <Flame className="h-5 w-5 text-orange-500" />, title: "HOT", desc: "A oferta mostrou sinais fortes: trafego crescente, multiplos criativos ativos, funil validado. Merece atencao imediata e possivel clone." },
  { status: "SCALING", icon: <Rocket className="h-5 w-5 text-green-500" />, title: "Scaling", desc: "A oferta esta em fase de crescimento acelerado. Trafego subindo consistentemente, novos criativos aparecendo. E o momento de agir rapido." },
  { status: "DYING", icon: <TrendingDown className="h-5 w-5 text-red-400" />, title: "Dying", desc: "Trafego em queda, criativos sendo pausados. A oferta esta perdendo forca. Ainda pode ter insights uteis, mas o timing ja passou." },
  { status: "DEAD", icon: <Skull className="h-5 w-5 text-gray-500" />, title: "Dead", desc: "A oferta parou completamente. Sem trafego, sem criativos ativos. Mantida no radar apenas como referencia historica." },
  { status: "CLONED", icon: <Dna className="h-5 w-5 text-purple-400" />, title: "Cloned", desc: "Voce ja clonou/adaptou esta oferta. Indica que o ciclo de espionagem foi concluido e a inteligencia foi aplicada na sua propria operacao." },
  { status: "VAULT", icon: <Archive className="h-5 w-5 text-gray-400" />, title: "Vault", desc: "Bau de sites irrelevantes (google, youtube, hotmart, etc). Nao polui o radar nem os dados de trafego." },
  { status: "NEVER_SCALED", icon: <BarChart2 className="h-5 w-5 text-slate-400" />, title: "Never Scaled", desc: "Sites que nunca escalaram. Mantidos para referencia mas separados dos dados ativos." },
];

export function SpyAboutTab() {
  return (
    <div className="border rounded-lg p-6 max-w-2xl space-y-4">
      <h2 className="text-lg font-semibold">Ciclo de Vida das Ofertas</h2>
      <p className="text-sm text-muted-foreground">Cada oferta no radar passa por um ciclo de qualificacao. Use os status abaixo para organizar seu pipeline de espionagem:</p>
      <div className="space-y-3">
        {LIFECYCLE_ITEMS.map(item => (
          <div key={item.status} className="flex gap-3 p-3 rounded-lg bg-muted/30">
            <span className="shrink-0 mt-0.5">{item.icon}</span>
            <div>
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
