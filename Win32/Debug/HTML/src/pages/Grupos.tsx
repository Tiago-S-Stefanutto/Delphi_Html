import ListagemGenerica from "@/components/ListagemGenerica";

export default function Grupos() {
  return (
    <ListagemGenerica
      titulo="Grupos"
      icone="📋"
      endpoint="/grupos"
      formPage="/grupo-form"
      colunas={[
        { chave: "id", label: "ID" },
        { chave: "descricao", label: "Descrição" },
      ]}
      entityType="Grupo"
    />
  );
}
