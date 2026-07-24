const JOU_NON = ['Dimanch', 'Lendi', 'Madi', 'Mèkredi', 'Jedi', 'Vandredi', 'Samdi'];

async function chajeEmisyonsAkAnimateurs() {
  const { data: emisyons, error } = await supabase
    .from('emisyons')
    .select(`
      id, non, deskripsyon, baner_url, jou_semèn, è_kòmanse, è_fini,
      emisyon_animateurs (
        wòl,
        animateurs ( id, nom, foto_url, bio )
      )
    `)
    .eq('is_active', true);

  if (error) {
    console.error('Erè chajman emisyon:', error);
    return [];
  }
  return emisyons;
}

function jwennEmisyonKapPase(emisyons) {
  const kounyeA = new Date();
  const jouAktyèl = kounyeA.getDay();
  const lèAktyèl = kounyeA.toTimeString().slice(0, 8);

  return emisyons.find(e => {
    if (!e.jou_semèn.includes(jouAktyèl)) return false;
    return lèAktyèl >= e.è_kòmanse && lèAktyèl <= e.è_fini;
  }) || null;
}

async function afichebanerLive() {
  const conteneur = document.getElementById('baner-live');
  if (!conteneur) return;

  const emisyons = await chajeEmisyonsAkAnimateurs();
  const enKou = jwennEmisyonKapPase(emisyons);

  if (!enKou) {
    conteneur.innerHTML = `<div class="baner-off-air"><span class="point-gris"></span> Pa gen emisyon live kounye a — mizik k ap jwe</div>`;
    return;
  }

  const animatèNon = enKou.emisyon_animateurs.map(ea => ea.animateurs.nom).join(' & ');

  conteneur.innerHTML = `<div class="baner-on-air"><span class="point-rouj"></span> <strong>EN DIRÈK:</strong> ${enKou.non} — avèk ${animatèNon}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  afichebanerLive();
  setInterval(afichebanerLive, 60000);
});
