import ListagemGenerica from "@/components/ListagemGenerica";

export default function Familias() {
  return (
    <ListagemGenerica
      titulo="Famílias"
      icone="👨‍👩‍👧‍👦"
      endpoint="/familias"
      formPage="/familia-form"
      colunas={[
        { chave: "id", label: "ID" },
        { chave: "descricao", label: "Descrição" },
      ]}
      entityType="Família"
    />
  );
}
