import ListagemGenerica from "@/components/ListagemGenerica";

export default function Categorias() {
  return (
    <ListagemGenerica
      titulo="Categorias"
      icone="🏷️"
      endpoint="/categorias"
      formPage="/categoria-form"
      colunas={[
        { chave: "id", label: "ID" },
        { chave: "descricao", label: "Descrição" },
      ]}
      entityType="Categoria"
    />
  );
}
