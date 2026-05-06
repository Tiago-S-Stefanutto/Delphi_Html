import FormularioGenerico from "@/components/FormularioGenerico";

export default function GrupoForm() {
  return (
    <FormularioGenerico
      titulo="Grupo"
      icone="📋"
      endpoint="/grupos"
      campos={[
        { nome: "descricao", label: "Descrição", tipo: "textarea", obrigatorio: true },
      ]}
      listaPage="/grupos"
      entityType="Grupo"
    />
  );
}
