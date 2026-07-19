export default async function handler(req, res) {
  // Verifica se a requisição veio realmente da Vercel Cron para segurança
  const authHeader = req.headers.authorization || req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send('Não autorizado');
  }

  // Permite ler tanto variáveis de ambiente comuns do Supabase quanto as específicas do Vite
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      success: false,
      error: 'Variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não estão configuradas na Vercel.'
    });
  }

  try {
    // Faz um ping simples via PostgREST na tabela 'vehicles' para acordar/manter o banco ativo
    const pingUrl = `${supabaseUrl}/rest/v1/vehicles?select=id&limit=1`;
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro na API do Supabase: Status ${response.status} - ${errText}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Supabase pingado com sucesso. Banco de dados VORA ativo!'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
