import ListagemGenerica from "@/components/ListagemGenerica";

export default function Elementos() {
  return (
    <ListagemGenerica
      titulo="Elementos Químicos"
      icone="⚛️"
      endpoint="/elementos"
      formPage="/elemento-form"
      colunas={[
        { chave: "id", label: "ID" },
        { chave: "numero_atomico", label: "Número Atômico" },
        { chave: "simbolo", label: "Símbolo" },
        { chave: "nome", label: "Nome" },
        { chave: "massa_atomica", label: "Massa Atômica" },
      ]}
      entityType="Elemento"
    />
  );
}
