import FormularioGenerico from "@/components/FormularioGenerico";

export default function PeriodoForm() {
  return (
    <FormularioGenerico
      titulo="Período"
      icone="📈"
      endpoint="/periodos"
      campos={[
        { nome: "descricao", label: "Descrição", tipo: "textarea", obrigatorio: true },
      ]}
      listaPage="/periodos"
      entityType="Período"
    />
  );
}
