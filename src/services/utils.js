export function useDefaults() {
    const types = ['Deslocação KM', 'Estacionamento', 'Lavagem', 'Portagem', 'Transportes', 'Alimentação', 'Alojamento', 'Ajuda de Custo', 'Jornais/Revistas', 'Livros/Doc. Técnica', 'Outros'];
    const typesDesc = ['Deslocação de ', 'Estacionamento em ', 'Lavagem de viatura', 'Portagem em deslocação para ', 'Bilhete de transporte ', 'Refeição em ', '', 'Compra de ', 'Compra de ', ''];

    return {
        types,
        typesDesc
    }
}
