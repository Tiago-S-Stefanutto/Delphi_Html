import ListagemGenerica from "@/components/ListagemGenerica";

export default function Periodos() {
  return (
    <ListagemGenerica
      titulo="Períodos"
      icone="📈"
      endpoint="/periodos"
      formPage="/periodo-form"
      colunas={[
        { chave: "id", label: "ID" },
        { chave: "descricao", label: "Descrição" },
      ]}
      entityType="Período"
    />
  );
}
