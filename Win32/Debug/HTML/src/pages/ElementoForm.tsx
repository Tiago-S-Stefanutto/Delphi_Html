import FormularioGenerico from "@/components/FormularioGenerico";

export default function ElementoForm() {
  return (
    <FormularioGenerico
      titulo="Elemento Químico"
      icone="⚛️"
      endpoint="/elementos"
      campos={[
        { nome: "numero_atomico", label: "Número Atômico", tipo: "number", obrigatorio: true },
        { nome: "simbolo", label: "Símbolo", tipo: "text", obrigatorio: true },
        { nome: "nome", label: "Nome", tipo: "text", obrigatorio: true },
        { nome: "massa_atomica", label: "Massa Atômica", tipo: "number", obrigatorio: true, step: "0.01" },
        { nome: "grupo_id", label: "Grupo", tipo: "select" },
        { nome: "periodo_id", label: "Período", tipo: "select" },
        { nome: "familia_id", label: "Família", tipo: "select" },
        { nome: "categoria_id", label: "Categoria", tipo: "select" },
      ]}
      listaPage="/elementos"
      entityType="Elemento"
    />
  );
}
