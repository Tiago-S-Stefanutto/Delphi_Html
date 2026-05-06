import FormularioGenerico from "@/components/FormularioGenerico";

export default function CategoriaForm() {
  return (
    <FormularioGenerico
      titulo="Categoria"
      icone="🏷️"
      endpoint="/categorias"
      campos={[
        { nome: "descricao", label: "Descrição", tipo: "textarea", obrigatorio: true },
      ]}
      listaPage="/categorias"
      entityType="Categoria"
    />
  );
}
