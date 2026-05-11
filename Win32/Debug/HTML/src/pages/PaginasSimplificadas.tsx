// ═══════════════════════════════════════════════════════
// Grupos.tsx  –  substitui o antigo Grupos.tsx
// ═══════════════════════════════════════════════════════
import CrudTabs from "@/components/CrudTabs";

export default function Grupos() {
  return (
    <CrudTabs
      titulo="Grupos"
      icone="📋"
      endpoint="/grupos"
      colunas={[
        { chave: "id", label: "ID" },
        { chave: "descricao", label: "Descrição" },
      ]}
      campos={[
        { nome: "descricao", label: "Descrição", tipo: "textarea", obrigatorio: true },
      ]}
    />
  );
}


// ═══════════════════════════════════════════════════════
// Periodos.tsx  –  substitui o antigo Periodos.tsx
// ═══════════════════════════════════════════════════════
// import CrudTabs from "@/components/CrudTabs";
//
// export default function Periodos() {
//   return (
//     <CrudTabs
//       titulo="Períodos"
//       icone="📈"
//       endpoint="/periodos"
//       colunas={[
//         { chave: "id", label: "ID" },
//         { chave: "descricao", label: "Descrição" },
//       ]}
//       campos={[
//         { nome: "descricao", label: "Descrição", tipo: "textarea", obrigatorio: true },
//       ]}
//     />
//   );
// }


// ═══════════════════════════════════════════════════════
// Familias.tsx  –  substitui o antigo Familias.tsx
// ═══════════════════════════════════════════════════════
// import CrudTabs from "@/components/CrudTabs";
//
// export default function Familias() {
//   return (
//     <CrudTabs
//       titulo="Famílias"
//       icone="👨‍👩‍👧‍👦"
//       endpoint="/familias"
//       colunas={[
//         { chave: "id", label: "ID" },
//         { chave: "descricao", label: "Descrição" },
//       ]}
//       campos={[
//         { nome: "descricao", label: "Descrição", tipo: "textarea", obrigatorio: true },
//       ]}
//     />
//   );
// }


// ═══════════════════════════════════════════════════════
// Categorias.tsx  –  substitui o antigo Categorias.tsx
// ═══════════════════════════════════════════════════════
// import CrudTabs from "@/components/CrudTabs";
//
// export default function Categorias() {
//   return (
//     <CrudTabs
//       titulo="Categorias"
//       icone="🏷️"
//       endpoint="/categorias"
//       colunas={[
//         { chave: "id", label: "ID" },
//         { chave: "descricao", label: "Descrição" },
//       ]}
//       campos={[
//         { nome: "descricao", label: "Descrição", tipo: "textarea", obrigatorio: true },
//       ]}
//     />
//   );
// }


// ═══════════════════════════════════════════════════════
// ElementosComCrudTabs.tsx  –  alternativa via componente
// (já existe Elementos.tsx dedicado; use este se preferir
//  a abordagem genérica)
// ═══════════════════════════════════════════════════════
// import CrudTabs from "@/components/CrudTabs";
//
// export default function ElementosCrudTabs() {
//   return (
//     <CrudTabs
//       titulo="Elementos Químicos"
//       icone="⚛️"
//       endpoint="/elementos"
//       colunas={[
//         { chave: "id", label: "ID" },
//         { chave: "numero_atomico", label: "Nº Atômico" },
//         { chave: "simbolo", label: "Símbolo" },
//         { chave: "nome", label: "Nome" },
//         { chave: "massa_atomica", label: "Massa Atômica" },
//       ]}
//       campos={[
//         { nome: "numero_atomico", label: "Nº Atômico",   tipo: "number",   obrigatorio: true },
//         { nome: "simbolo",        label: "Símbolo",       tipo: "text",     obrigatorio: true },
//         { nome: "nome",           label: "Nome",          tipo: "text",     obrigatorio: true },
//         { nome: "massa_atomica",  label: "Massa Atômica", tipo: "number",   step: "0.0001" },
//         { nome: "grupo_id",       label: "Grupo",         tipo: "select",   opcoes: "grupos" },
//         { nome: "periodo_id",     label: "Período",       tipo: "select",   opcoes: "periodos" },
//         { nome: "familia_id",     label: "Família",       tipo: "select",   opcoes: "familias" },
//         { nome: "categoria_id",   label: "Categoria",     tipo: "select",   opcoes: "categorias" },
//       ]}
//     />
//   );
// }
