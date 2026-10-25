import Link from 'next/link';

export default function GuiasTamanhosPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Guia de tamanhos e medidas</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Cada produto tem sua própria tabela de medidas na página individual.
          Use este guia como referência geral para escolher o tamanho ideal.
        </p>

        <div className="border border-border rounded-xl overflow-hidden mb-8">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-rosé-50">
                <th className="px-4 py-3 text-rosé-700 font-medium">Tamanho</th>
                <th className="px-4 py-3 text-rosé-700 font-medium">Busto (cm)</th>
                <th className="px-4 py-3 text-rosé-700 font-medium">Cintura (cm)</th>
                <th className="px-4 py-3 text-rosé-700 font-medium">Quadril (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 font-medium">P</td>
                <td className="px-4 py-3">82–88</td>
                <td className="px-4 py-3">62–68</td>
                <td className="px-4 py-3">90–96</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 font-medium">M</td>
                <td className="px-4 py-3">90–96</td>
                <td className="px-4 py-3">70–76</td>
                <td className="px-4 py-3">98–104</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 font-medium">G</td>
                <td className="px-4 py-3">98–104</td>
                <td className="px-4 py-3">78–84</td>
                <td className="px-4 py-3">106–112</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">GG</td>
                <td className="px-4 py-3">106–112</td>
                <td className="px-4 py-3">86–92</td>
                <td className="px-4 py-3">114–120</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-rosé-700">Como medir</h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li><b>Busto:</b> em torno da parte mais cheia do busto, com a fita nivelada.</li>
            <li><b>Cintura:</b> na parte mais estreita da cintura, geralmente acima do umbigo.</li>
            <li><b>Quadril:</b> na parte mais larga do quadril, com a fita nivelada.</li>
            <li><b>Comprimento:</b> do ombro até o ponto desejado da peça.</li>
          </ul>
        </div>

        <div className="mt-12 p-8 bg-rosé-50 rounded-xl border border-rosé-100">
          <p className="text-sm text-muted-foreground">
            As medidas podem variar de acordo com o modelo. Consulte sempre a
            tabela de medidas na página de cada produto. Em caso de dúvida,
            entre em contato pelo WhatsApp.
          </p>
        </div>
      </div>
    </main>
  );
}
