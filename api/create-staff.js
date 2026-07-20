const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dznqpltxfhpuorxxwypb.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function generateSecurityCode(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for(let i=0;i<8;i++){
    code += chars[Math.floor(Math.random()*chars.length)];
  }
  return code.slice(0,4) + '-' + code.slice(4,8);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing service role key' });
  }

  const { adminAccessToken, email, password, fullName, role } = req.body || {};

  if (!adminAccessToken || !email || !password || !fullName || !role) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Verifye moun k ap mande a se reyèlman yon admin
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(adminAccessToken);
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { data: profileData, error: profileErr } = await supabaseAdmin
    .from('staff_profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileErr || !profileData || profileData.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
  }

  // Kreye kont Auth
  const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createErr || !newUser?.user) {
    return res.status(400).json({ error: createErr?.message || 'Erreur création compte' });
  }

  const securityCode = generateSecurityCode();

  const { error: rpcErr } = await supabaseAdmin.rpc('create_staff_profile', {
    p_id: newUser.user.id,
    p_full_name: fullName,
    p_role: role,
    p_security_code: securityCode
  });

  if (rpcErr) {
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
    return res.status(400).json({ error: rpcErr.message });
  }

  return res.status(200).json({
    success: true,
    userId: newUser.user.id,
    securityCode
  });
};
