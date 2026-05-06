import FormularioGenerico from "@/components/FormularioGenerico";

export default function FamiliaForm() {
  return (
    <FormularioGenerico
      titulo="Família"
      icone="👨‍👩‍👧‍👦"
      endpoint="/familias"
      campos={[
        { nome: "descricao", label: "Descrição", tipo: "textarea", obrigatorio: true },
      ]}
      listaPage="/familias"
      entityType="Família"
    />
  );
}
